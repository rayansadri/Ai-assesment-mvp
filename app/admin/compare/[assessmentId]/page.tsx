'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { computeFitScore, getScoreLabel } from '@/lib/programs'

// ─── Types ────────────────────────────────────────────────────────────────────
type BlockType =
  | 'section' | 'intro' | 'video' | 'multiple-choice' | 'open-text'
  | 'scenario' | 'case-study' | 'document-check' | 'file-upload' | 'scoring-rule'

interface SubmissionResponse {
  blockId: string
  blockType: BlockType
  blockTitle?: string
  textResponse?: string
  choiceResponse?: number | number[]
  videoUrl?: string
  fileUrl?: string
  score?: number
  rubricNotes?: string
}

interface Submission {
  id: string
  assessmentId: string
  assessmentTitle: string
  studentName: string
  studentEmail: string
  programName: string
  startedAt: string
  submittedAt?: string
  status: 'in-progress' | 'submitted' | 'reviewed'
  totalScore?: number
  responses: SubmissionResponse[]
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ active }: { active: 'dashboard' | 'submissions' | 'analytics' | 'compare' }) {
  return (
    <div style={{
      width: 240, minWidth: 240,
      height: '100vh', background: '#1A2B4A',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, flexShrink: 0,
    }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #3451D1 0%, #6B8AF0 100%)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>
            Passage
          </span>
        </div>
        <div style={{ marginTop: 4, fontSize: 10.5, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.06em', textTransform: 'uppercase', paddingLeft: 42 }}>
          Admin
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px' }}>
        <NavLink href="/admin" label="Dashboard" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" active={active === 'dashboard'} />
        <NavLink href="/admin" label="All Submissions" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" active={active === 'submissions'} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 7,
          background: active === 'compare' ? 'rgba(255,255,255,0.12)' : 'transparent',
          color: active === 'compare' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
          fontSize: 13.5, fontWeight: active === 'compare' ? 600 : 400,
          margin: '1px 0',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Analytics</span>
          <span style={{
            marginLeft: 'auto', fontSize: 9.5, background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.35)', padding: '2px 6px', borderRadius: 4,
            letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600,
          }}>Soon</span>
        </div>
      </nav>

      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/assessments/new" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 10px', borderRadius: 7,
            background: 'rgba(52,81,209,0.35)', color: 'rgba(255,255,255,0.9)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Create Assessment
          </div>
        </Link>
      </div>
    </div>
  )
}

function NavLink({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px', borderRadius: 7,
        background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
        color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)',
        fontSize: 13.5, fontWeight: active ? 600 : 400,
        cursor: 'pointer', margin: '1px 0',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d={icon} />
        </svg>
        {label}
      </div>
    </Link>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    'submitted':   { bg: 'rgba(217,119,6,0.10)',  color: '#D97706', label: 'Submitted' },
    'reviewed':    { bg: 'rgba(22,163,74,0.10)',   color: '#16A34A', label: 'Reviewed' },
    'in-progress': { bg: 'rgba(107,114,128,0.10)', color: '#6B7280', label: 'In Progress' },
  }
  const s = map[status] || map['in-progress']
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
    }}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
      {s.label}
    </span>
  )
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
      <div style={{
        width: 28, height: 28,
        border: '2.5px solid rgba(52,81,209,0.15)',
        borderTopColor: '#3451D1',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── Response preview helper ──────────────────────────────────────────────────
function responsePreview(r: SubmissionResponse): string {
  if (!r) return '—'
  if (r.blockType === 'video') return r.videoUrl ? '▶ Video' : '—'
  if (r.blockType === 'multiple-choice') {
    if (r.choiceResponse == null) return '—'
    const idx = Array.isArray(r.choiceResponse) ? r.choiceResponse : [r.choiceResponse]
    return `Option ${idx.map((n: number) => n + 1).join(', ')}`
  }
  if (r.textResponse) {
    const t = r.textResponse.trim()
    return t.length > 60 ? t.slice(0, 60) + '…' : t
  }
  if (r.fileUrl) return '📎 File'
  return '—'
}

// ─── Candidate card ───────────────────────────────────────────────────────────
function CandidateCard({
  sub, note, onNoteChange, score,
}: {
  sub: Submission; note: string; onNoteChange: (val: string) => void; score: number
}) {
  const { label, color, bg } = getScoreLabel(score)
  const barColor = score >= 85 ? '#10B981' : score >= 72 ? '#4F46E5' : '#F59E0B'
  return (
    <div style={{
      background: '#FFFFFF', borderRadius: 10,
      border: `1.5px solid ${score >= 85 ? '#BBF7D0' : score >= 72 ? '#BFDBFE' : '#FDE68A'}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      padding: '16px', minWidth: 200, flex: '1 1 200px',
    }}>
      <Link href={`/admin/submissions/${sub.id}`} style={{ textDecoration: 'none' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 2, letterSpacing: '-0.01em' }}>
          {sub.studentName}
        </div>
        <div style={{ fontSize: 11.5, color: '#9CA3AF', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {sub.studentEmail}
        </div>
      </Link>
      {/* Score display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: barColor, letterSpacing: '-0.03em' }}>{score}</span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: bg, color }}>{label}</span>
      </div>
      {/* Score bar */}
      <div style={{ height: 5, background: '#F3F4F6', borderRadius: 3, marginBottom: 12, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: barColor, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
      <textarea
        value={note}
        onChange={e => onNoteChange(e.target.value)}
        placeholder="Add note…"
        rows={2}
        style={{
          width: '100%', padding: '6px 8px',
          border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6,
          fontSize: 12, color: '#6B7280', background: '#F9FAFB',
          lineHeight: 1.5, resize: 'vertical',
        }}
      />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CompareView({ params }: { params: Promise<{ assessmentId: string }> }) {
  const { assessmentId } = use(params)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    try {
      const stored: Submission[] = JSON.parse(localStorage.getItem('pa-submissions') || '[]')
      const filtered = stored.filter(s => s.assessmentId === assessmentId)
      // Sort by computed fit score descending
      filtered.sort((a, b) => computeFitScore(b.id, b.responses) - computeFitScore(a.id, a.responses))
      setSubmissions(filtered)
    } catch {}
    setLoading(false)
  }, [assessmentId])

  const assessmentTitle = submissions[0]?.assessmentTitle || 'Assessment'

  // Compute scores for all submissions
  const scoreMap = Object.fromEntries(submissions.map(s => [s.id, computeFitScore(s.id, s.responses)]))

  // Collect all unique response block ids/titles (non-structural) across submissions
  const allBlockIds: { blockId: string; blockTitle: string; blockType: string }[] = []
  const seen = new Set<string>()
  for (const sub of submissions) {
    for (const r of sub.responses) {
      if (!seen.has(r.blockId) && !['section', 'intro', 'scoring-rule'].includes(r.blockType)) {
        seen.add(r.blockId)
        allBlockIds.push({
          blockId: r.blockId,
          blockTitle: r.blockTitle || r.blockType,
          blockType: r.blockType,
        })
      }
    }
  }

  // Max 6 columns side by side
  const displaySubs = submissions.slice(0, 6)
  const maxTotal = displaySubs.length > 0 ? Math.max(...displaySubs.map(s => scoreMap[s.id])) : null

  // Find best score per row for highlighting
  const bestScore = (blockId: string): number | null => {
    const scores = displaySubs
      .map(s => s.responses.find(r => r.blockId === blockId)?.score)
      .filter((v): v is number => v != null)
    return scores.length > 0 ? Math.max(...scores) : null
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F0F2F5', overflow: 'hidden' }}>
      <Sidebar active="compare" />

      {/* Main */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '28px 32px 48px' }}>
          {/* Back */}
          <Link href="/admin" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: '#6B7280', textDecoration: 'none', fontSize: 13, marginBottom: 20,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5m7-7l-7 7 7 7" />
            </svg>
            Back to Dashboard
          </Link>

          {/* Heading */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.03em', margin: '0 0 4px' }}>
              {loading ? 'Loading…' : `Comparing ${submissions.length} candidate${submissions.length !== 1 ? 's' : ''}`}
            </h1>
            <p style={{ fontSize: 13.5, color: '#6B7280', margin: 0 }}>
              {assessmentTitle}
            </p>
          </div>

          {loading ? (
            <Spinner />
          ) : submissions.length === 0 ? (
            <div style={{
              background: '#FFFFFF', borderRadius: 10, padding: '48px 32px',
              textAlign: 'center', border: '1px solid rgba(0,0,0,0.08)',
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                No submissions yet for this assessment.
              </div>
              <div style={{ fontSize: 13, color: '#9CA3AF' }}>
                Share the assessment link with candidates to get started.
              </div>
            </div>
          ) : (
            <>
              {/* Candidate cards */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 28 }}>
                {displaySubs.map(sub => (
                  <CandidateCard
                    key={sub.id}
                    sub={sub}
                    note={notes[sub.id] || ''}
                    onNoteChange={v => setNotes(prev => ({ ...prev, [sub.id]: v }))}
                    score={scoreMap[sub.id] ?? 0}
                  />
                ))}
              </div>

              {/* Comparison table */}
              <div style={{
                background: '#FFFFFF', borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                overflow: 'hidden',
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    {/* Head */}
                    <thead>
                      <tr style={{ background: '#1A2B4A' }}>
                        <th style={{
                          padding: '12px 16px', textAlign: 'left',
                          fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.55)',
                          letterSpacing: '0.05em', textTransform: 'uppercase',
                          minWidth: 160, position: 'sticky', left: 0, background: '#1A2B4A',
                          borderRight: '1px solid rgba(255,255,255,0.08)',
                        }}>
                          Criteria
                        </th>
                        {displaySubs.map(sub => (
                          <th key={sub.id} style={{
                            padding: '12px 16px', textAlign: 'center',
                            fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.88)',
                            minWidth: 160, borderLeft: '1px solid rgba(255,255,255,0.06)',
                          }}>
                            <div style={{ marginBottom: 2 }}>{sub.studentName}</div>
                            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>
                              {sub.studentEmail}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {/* Overall Score row */}
                      <tr style={{ background: '#FAFAFA', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        <td style={{
                          padding: '11px 16px', fontWeight: 700, color: '#374151',
                          fontSize: 12.5, position: 'sticky', left: 0, background: '#FAFAFA',
                          borderRight: '1px solid rgba(0,0,0,0.06)',
                        }}>
                          Overall Score
                        </td>
                        {displaySubs.map(sub => {
                          const sc = scoreMap[sub.id] ?? 0
                          const isBest = maxTotal != null && sc === maxTotal
                          const { label, color, bg } = getScoreLabel(sc)
                          return (
                            <td key={sub.id} style={{
                              padding: '11px 16px', textAlign: 'center',
                              borderLeft: '1px solid rgba(0,0,0,0.05)',
                            }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <span style={{
                                  fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em',
                                  color: isBest ? '#16A34A' : '#111827',
                                }}>
                                  {sc}
                                </span>
                                <span style={{
                                  fontSize: 10.5, fontWeight: 700, padding: '2px 7px',
                                  borderRadius: 20, background: bg, color,
                                }}>
                                  {label}
                                </span>
                              </div>
                            </td>
                          )
                        })}
                      </tr>

                      {/* Status row */}
                      <tr style={{ background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        <td style={{
                          padding: '11px 16px', fontWeight: 600, color: '#374151',
                          fontSize: 12.5, position: 'sticky', left: 0, background: '#FFFFFF',
                          borderRight: '1px solid rgba(0,0,0,0.06)',
                        }}>
                          Status
                        </td>
                        {displaySubs.map(sub => (
                          <td key={sub.id} style={{
                            padding: '11px 16px', textAlign: 'center',
                            borderLeft: '1px solid rgba(0,0,0,0.05)',
                          }}>
                            <StatusBadge status={sub.status} />
                          </td>
                        ))}
                      </tr>

                      {/* Submitted row */}
                      <tr style={{ background: '#FAFAFA', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        <td style={{
                          padding: '11px 16px', fontWeight: 600, color: '#374151',
                          fontSize: 12.5, position: 'sticky', left: 0, background: '#FAFAFA',
                          borderRight: '1px solid rgba(0,0,0,0.06)',
                        }}>
                          Submitted
                        </td>
                        {displaySubs.map(sub => (
                          <td key={sub.id} style={{
                            padding: '11px 16px', textAlign: 'center',
                            fontSize: 12, color: '#6B7280',
                            borderLeft: '1px solid rgba(0,0,0,0.05)',
                          }}>
                            {sub.submittedAt
                              ? new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : <span style={{ color: '#D1D5DB' }}>—</span>
                            }
                          </td>
                        ))}
                      </tr>

                      {/* Completion row */}
                      <tr style={{ background: '#FFFFFF', borderBottom: '2px solid rgba(0,0,0,0.08)' }}>
                        <td style={{
                          padding: '11px 16px', fontWeight: 600, color: '#374151',
                          fontSize: 12.5, position: 'sticky', left: 0, background: '#FFFFFF',
                          borderRight: '1px solid rgba(0,0,0,0.06)',
                        }}>
                          Completion
                        </td>
                        {displaySubs.map(sub => {
                          const answered = sub.responses.filter(r =>
                            !['section', 'intro', 'scoring-rule'].includes(r.blockType) &&
                            (r.textResponse || r.videoUrl || r.fileUrl || r.choiceResponse != null)
                          ).length
                          const total = sub.responses.filter(r =>
                            !['section', 'intro', 'scoring-rule'].includes(r.blockType)
                          ).length
                          const pct = total > 0 ? Math.round((answered / total) * 100) : 0
                          return (
                            <td key={sub.id} style={{
                              padding: '11px 16px', textAlign: 'center',
                              borderLeft: '1px solid rgba(0,0,0,0.05)',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                <div style={{
                                  flex: 1, maxWidth: 64, height: 5,
                                  background: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden',
                                }}>
                                  <div style={{
                                    height: '100%',
                                    width: `${pct}%`,
                                    background: pct === 100 ? '#16A34A' : '#3451D1',
                                    borderRadius: 3, transition: 'width 0.3s',
                                  }} />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 600, color: pct === 100 ? '#16A34A' : '#374151' }}>
                                  {pct}%
                                </span>
                              </div>
                            </td>
                          )
                        })}
                      </tr>

                      {/* Response rows */}
                      {allBlockIds.map((block, idx) => {
                        const best = bestScore(block.blockId)
                        const isEvenRow = idx % 2 === 0
                        return (
                          <tr key={block.blockId} style={{
                            background: isEvenRow ? '#FAFAFA' : '#FFFFFF',
                            borderBottom: '1px solid rgba(0,0,0,0.05)',
                          }}>
                            <td style={{
                              padding: '10px 16px',
                              fontSize: 12.5, fontWeight: 500,
                              color: '#374151',
                              position: 'sticky', left: 0,
                              background: isEvenRow ? '#FAFAFA' : '#FFFFFF',
                              borderRight: '1px solid rgba(0,0,0,0.06)',
                              maxWidth: 180,
                            }}>
                              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {block.blockTitle}
                              </div>
                              <div style={{
                                fontSize: 10, color: '#9CA3AF', marginTop: 2,
                                textTransform: 'uppercase', letterSpacing: '0.04em',
                              }}>
                                {block.blockType}
                              </div>
                            </td>
                            {displaySubs.map(sub => {
                              const r = sub.responses.find(resp => resp.blockId === block.blockId)
                              const preview = r ? responsePreview(r) : '—'
                              const hasScore = r?.score != null
                              const isBestScore = hasScore && best != null && r!.score === best && best > 0
                              return (
                                <td key={sub.id} style={{
                                  padding: '10px 14px', textAlign: 'center',
                                  borderLeft: '1px solid rgba(0,0,0,0.05)',
                                  verticalAlign: 'top',
                                }}>
                                  <div style={{
                                    fontSize: 12, color: preview === '—' ? '#D1D5DB' : '#374151',
                                    lineHeight: 1.4, marginBottom: hasScore ? 4 : 0,
                                    wordBreak: 'break-word',
                                  }}>
                                    {preview === '▶ Video' ? (
                                      <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                        background: 'rgba(52,81,209,0.08)', color: '#3451D1',
                                        padding: '2px 7px', borderRadius: 5, fontSize: 11.5, fontWeight: 600,
                                      }}>
                                        ▶ Video
                                      </span>
                                    ) : preview === '📎 File' ? (
                                      <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                        background: 'rgba(107,114,128,0.08)', color: '#6B7280',
                                        padding: '2px 7px', borderRadius: 5, fontSize: 11.5, fontWeight: 600,
                                      }}>
                                        📎 File
                                      </span>
                                    ) : preview}
                                  </div>
                                  {hasScore && (
                                    <span style={{
                                      display: 'inline-block',
                                      fontSize: 11, fontWeight: 700,
                                      color: isBestScore ? '#16A34A' : '#6B7280',
                                      background: isBestScore ? 'rgba(22,163,74,0.10)' : 'rgba(0,0,0,0.05)',
                                      padding: '1px 6px', borderRadius: 4,
                                    }}>
                                      {r!.score}/10
                                    </span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {submissions.length > 6 && (
                  <div style={{
                    padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.06)',
                    fontSize: 12.5, color: '#6B7280', background: '#FAFAFA', textAlign: 'center',
                  }}>
                    Showing 6 of {submissions.length} candidates. Scroll to view all in the table above.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
