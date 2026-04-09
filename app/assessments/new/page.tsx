'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import programsData from '../../../lib/programs-data.json'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Program { title: string; code: string }
interface Institution { institution: string; programs: Program[] }
const INSTITUTIONS: Institution[] = programsData as Institution[]

// ─── Searchable Program Select ────────────────────────────────────────────────
function ProgramSelect({
  value, onChange
}: {
  value: string
  onChange: (val: string, label: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [displayLabel, setDisplayLabel] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const query = search.toLowerCase()
  const filtered: { institution: string; programs: Program[] }[] = INSTITUTIONS
    .map(inst => ({
      institution: inst.institution,
      programs: inst.programs.filter(p =>
        p.title.toLowerCase().includes(query) ||
        inst.institution.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query)
      )
    }))
    .filter(g => g.programs.length > 0)

  const totalFiltered = filtered.reduce((n, g) => n + g.programs.length, 0)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (inst: string, p: Program) => {
    const label = `${p.title} — ${inst}`
    setDisplayLabel(label)
    onChange(`${inst}::${p.code}::${p.title}`, label)
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setTimeout(() => inputRef.current?.focus(), 50) }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', borderRadius: 8, border: `1px solid ${open ? '#3451D1' : 'var(--border2)'}`,
          background: '#fff', cursor: 'pointer', fontSize: 14, color: displayLabel ? 'var(--text)' : 'var(--text3)',
          boxShadow: open ? '0 0 0 3px rgba(52,81,209,0.1)' : 'none', transition: 'all 0.15s',
          textAlign: 'left', gap: 8
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {displayLabel || 'Select a program track…'}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ flexShrink: 0, color: 'var(--text3)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, marginTop: 4,
          background: '#fff', borderRadius: 10, border: '1px solid var(--border2)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
          overflow: 'hidden', maxHeight: 360, display: 'flex', flexDirection: 'column'
        }}>
          {/* Search */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search programs or institutions…"
              style={{
                width: '100%', paddingLeft: 28, paddingRight: 12, paddingTop: 6, paddingBottom: 6,
                border: '1px solid var(--border2)', borderRadius: 6, fontSize: 13, outline: 'none',
                color: 'var(--text)', background: 'var(--bg)'
              }}
            />
          </div>

          {/* Results */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                No programs found
              </div>
            ) : (
              <>
                <div style={{ padding: '6px 14px 4px', fontSize: 11, color: 'var(--text3)', fontWeight: 500, letterSpacing: '0.04em' }}>
                  {totalFiltered.toLocaleString()} PROGRAMS
                </div>
                {filtered.map(group => (
                  <div key={group.institution}>
                    <div style={{
                      padding: '6px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text3)',
                      letterSpacing: '0.04em', textTransform: 'uppercase', background: 'var(--bg)',
                      borderTop: '1px solid var(--border)'
                    }}>
                      {group.institution}
                    </div>
                    {group.programs.map(p => (
                      <button
                        key={`${group.institution}::${p.code}::${p.title}`}
                        type="button"
                        onClick={() => select(group.institution, p)}
                        style={{
                          width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between', gap: 8,
                          padding: '8px 14px', fontSize: 13, color: 'var(--text)',
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          transition: 'background 0.1s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.title}
                        </span>
                        {p.code && p.code !== 'nan' && (
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                            background: 'var(--accent-light)', color: 'var(--accent)', flexShrink: 0
                          }}>
                            {p.code}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface DescriptionBullet { category: string; text: string }
interface FullBlock { type: string; cfg: Record<string, unknown> }

const uid = () => Math.random().toString(36).slice(2, 8)

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  'Technical':    { bg: '#EFF6FF', color: '#1D4ED8' },
  'Personality':  { bg: '#F0FDF4', color: '#15803D' },
  'Outcome':      { bg: '#FDF4FF', color: '#7E22CE' },
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CreateAssessmentPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [program, setProgram] = useState('')
  const [programLabel, setProgramLabel] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // AI suggestion state
  const [bullets, setBullets] = useState<DescriptionBullet[]>([])
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)
  const [generatingFull, setGeneratingFull] = useState(false)

  const canSuggest = name.trim().length > 2 && program.length > 0

  const fetchSuggestion = async () => {
    setLoadingSuggestion(true)
    setBullets([])
    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Suggest assessment description for ${programLabel}`, mode: 'suggest_description', program: programLabel }),
      })
      const data = await res.json()
      if (data.parsed?.bullets) setBullets(data.parsed.bullets)
    } catch {}
    setLoadingSuggestion(false)
  }

  const useAllBullets = () => {
    const text = bullets.map(b => `${b.category}: ${b.text}`).join('\n')
    setDescription(text)
    setErrors(p => ({ ...p, description: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const e2: Record<string, string> = {}
    if (!name.trim()) e2.name = 'Assessment name is required'
    if (!program) e2.program = 'Please select a program'
    setErrors(e2)
    if (Object.keys(e2).length > 0) return
    setSubmitting(true)

    const id = `asmnt-${Date.now()}`
    const assessment = {
      id, name: name.trim(), program, programLabel,
      description: description.trim(),
      createdAt: new Date().toISOString(),
      modules: []
    }
    try {
      const stored = JSON.parse(localStorage.getItem('pa-assessments') || '[]')
      stored.push(assessment)
      localStorage.setItem('pa-assessments', JSON.stringify(stored))
    } catch {}

    router.push(`/assessments/${id}/builder`)
  }

  const generateFull = async () => {
    if (!name.trim() || !program) {
      setErrors({
        name: !name.trim() ? 'Assessment name is required' : '',
        program: !program ? 'Please select a program' : '',
      })
      return
    }
    setGeneratingFull(true)

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Generate full assessment for ${programLabel}`, mode: 'generate_full', program: programLabel }),
      })
      const data = await res.json()
      const blocks: FullBlock[] = data.parsed?.blocks || []

      const id = `asmnt-${Date.now()}`
      const builtBlocks = blocks.map(b => ({ id: uid(), type: b.type, cfg: b.cfg }))

      const assessment = {
        id,
        name: name.trim(),
        program,
        programLabel,
        description: description.trim() || `AI-generated assessment for ${programLabel}`,
        createdAt: new Date().toISOString(),
        modules: [],
        builderBlocks: builtBlocks,
        published: false,
      }

      const stored = JSON.parse(localStorage.getItem('pa-assessments') || '[]')
      stored.push(assessment)
      localStorage.setItem('pa-assessments', JSON.stringify(stored))

      router.push(`/assessments/${id}/builder`)
    } catch {
      setGeneratingFull(false)
    }
  }

  const fieldStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14,
    border: `1px solid ${hasError ? '#DC2626' : 'var(--border2)'}`,
    outline: 'none', color: 'var(--text)', background: '#fff',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  })

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '40px 24px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.02em' }}>PASSAGE ASSESSMENT</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Create New Assessment
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text2)', maxWidth: 420, lineHeight: 1.5 }}>
          Fill in the name and program — AI will suggest the rest.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 20, width: '100%', maxWidth: 900, alignItems: 'flex-start' }}>
        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          flex: 1, background: '#fff', borderRadius: 14,
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)',
          padding: 32, display: 'flex', flexDirection: 'column', gap: 22
        } as React.CSSProperties}>

          {/* Name */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
              Assessment Name
            </label>
            <input
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
              placeholder="e.g., Practical Nursing Fit Check"
              style={fieldStyle(!!errors.name)}
              onFocus={e => { e.target.style.borderColor = '#3451D1'; e.target.style.boxShadow = '0 0 0 3px rgba(52,81,209,0.1)' }}
              onBlur={e => { e.target.style.borderColor = errors.name ? '#DC2626' : 'var(--border2)'; e.target.style.boxShadow = 'none' }}
            />
            {errors.name && <p style={{ marginTop: 5, fontSize: 12, color: '#DC2626' }}>{errors.name}</p>}
          </div>

          {/* Program */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>
              Choose Program
            </label>
            <ProgramSelect
              value={program}
              onChange={(val, label) => { setProgram(val); setProgramLabel(label); setErrors(p => ({ ...p, program: '' })); setBullets([]) }}
            />
            {errors.program && <p style={{ marginTop: 5, fontSize: 12, color: '#DC2626' }}>{errors.program}</p>}
          </div>

          {/* Description + AI Suggest */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                Description & Purpose
              </label>
              {canSuggest && (
                <button
                  type="button"
                  onClick={fetchSuggestion}
                  disabled={loadingSuggestion}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 12, fontWeight: 600, color: '#4F46E5',
                    background: 'rgba(79,70,229,0.07)', border: '1px solid rgba(79,70,229,0.2)',
                    borderRadius: 20, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit'
                  }}
                >
                  {loadingSuggestion ? (
                    <>
                      <div style={{ width: 10, height: 10, border: '1.5px solid rgba(79,70,229,0.3)', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      Thinking…
                    </>
                  ) : (
                    <>✦ AI Suggest</>
                  )}
                </button>
              )}
            </div>

            {/* Bullet suggestions */}
            {bullets.length > 0 && (
              <div style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bullets.map((b, i) => {
                  const colors = CATEGORY_COLORS[b.category] || { bg: '#F9FAFB', color: '#374151' }
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '10px 12px', borderRadius: 10,
                      background: colors.bg, border: `1px solid ${colors.color}22`
                    }}>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, color: colors.color,
                        background: `${colors.color}18`, padding: '2px 8px', borderRadius: 10,
                        flexShrink: 0, marginTop: 1, whiteSpace: 'nowrap'
                      }}>
                        {b.category}
                      </span>
                      <span style={{ fontSize: 13, color: '#374151', flex: 1, lineHeight: 1.5 }}>{b.text}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setDescription(d => d ? `${d}\n${b.category}: ${b.text}` : `${b.category}: ${b.text}`)
                          setErrors(p => ({ ...p, description: '' }))
                        }}
                        style={{
                          fontSize: 11, fontWeight: 600, color: colors.color,
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: '2px 6px', borderRadius: 6, flexShrink: 0, fontFamily: 'inherit'
                        }}
                      >
                        + Use
                      </button>
                    </div>
                  )
                })}
                <button
                  type="button"
                  onClick={useAllBullets}
                  style={{
                    fontSize: 12.5, fontWeight: 600, color: '#4F46E5',
                    background: 'none', border: '1px solid rgba(79,70,229,0.3)',
                    borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
                    fontFamily: 'inherit', alignSelf: 'flex-start'
                  }}
                >
                  Use all 3 →
                </button>
              </div>
            )}

            <textarea
              value={description}
              onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })) }}
              placeholder="Detail the objectives and criteria for this assessment… or click ✦ AI Suggest above"
              rows={4}
              style={{ ...fieldStyle(!!errors.description), lineHeight: 1.6, resize: 'vertical' }}
              onFocus={e => { e.target.style.borderColor = '#3451D1'; e.target.style.boxShadow = '0 0 0 3px rgba(52,81,209,0.1)' }}
              onBlur={e => { e.target.style.borderColor = errors.description ? '#DC2626' : 'var(--border2)'; e.target.style.boxShadow = 'none' }}
            />
            {errors.description && <p style={{ marginTop: 5, fontSize: 12, color: '#DC2626' }}>{errors.description}</p>}
          </div>

          {/* ─── Two CTAs ─────────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {/* Generate full — primary */}
            <button
              type="button"
              onClick={generateFull}
              disabled={generatingFull}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '13px 28px', borderRadius: 9, border: 'none',
                cursor: generatingFull ? 'not-allowed' : 'pointer',
                background: generatingFull ? '#374151' : '#111827',
                color: '#fff', fontSize: 15, fontWeight: 700, width: '100%',
                letterSpacing: '-0.01em', fontFamily: 'inherit'
              }}
            >
              {generatingFull ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Generating assessment…
                </>
              ) : (
                <>✦ Generate full assessment with AI</>
              )}
            </button>

            {/* Manual — secondary */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '11px 28px', borderRadius: 9,
                border: '1.5px solid var(--border2)',
                cursor: submitting ? 'not-allowed' : 'pointer',
                background: '#fff', color: 'var(--text)',
                fontSize: 14, fontWeight: 600, width: '100%', fontFamily: 'inherit'
              }}
            >
              {submitting ? 'Creating…' : 'Create blank and build manually →'}
            </button>
          </div>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </form>

        {/* Right tip card */}
        <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
          {/* AI modes card */}
          <div style={{ background: '#111827', borderRadius: 14, padding: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 12px' }}>
              Two ways to build
            </p>
            {[
              { icon: '✦', title: 'Generate with AI', sub: 'AI builds intro + 3 questions instantly. You edit in the builder.' },
              { icon: '⊕', title: 'Build manually', sub: 'Start blank. Use /commands to add video, scenario, and MC blocks.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i === 0 ? 14 : 0 }}>
                <span style={{ fontSize: 16, color: i === 0 ? '#818CF8' : 'rgba(255,255,255,0.3)', flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>{item.title}</p>
                  <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* After creating */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', padding: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px' }}>
              After creating
            </p>
            {['Add or edit blocks in the builder', 'Publish to the marketplace', 'Students take — scores save to admin'].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: i < 2 ? 8 : 0 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
