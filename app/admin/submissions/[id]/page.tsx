'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'

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
      {/* Logo */}
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

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        <NavLink href="/admin" label="Dashboard" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" active={active === 'dashboard'} />
        <NavLink href="/admin" label="All Submissions" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" active={active === 'submissions'} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 7,
          color: 'rgba(255,255,255,0.3)', fontSize: 13.5,
          cursor: 'not-allowed', margin: '1px 0',
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
      fontSize: 11.5, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color }} />
      {s.label}
    </span>
  )
}

// ─── Block Type Colors & Labels ───────────────────────────────────────────────
const BLOCK_META: Record<string, { color: string; label: string }> = {
  'video':           { color: '#3451D1', label: 'Video Response' },
  'open-text':       { color: '#0891B2', label: 'Open Text' },
  'multiple-choice': { color: '#7C3AED', label: 'Multiple Choice' },
  'scenario':        { color: '#16A34A', label: 'Scenario' },
  'case-study':      { color: '#9D174D', label: 'Case Study' },
  'document-check':  { color: '#0369A1', label: 'Document Check' },
  'file-upload':     { color: '#6B7280', label: 'File Upload' },
  'section':         { color: '#D97706', label: 'Section' },
  'intro':           { color: '#6B7280', label: 'Intro' },
  'scoring-rule':    { color: '#D97706', label: 'Scoring Rule' },
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

// ─── Response Block ───────────────────────────────────────────────────────────
function ResponseBlock({
  response,
  submissionId,
  onUpdate,
}: {
  response: SubmissionResponse
  submissionId: string
  onUpdate: (blockId: string, score: number | undefined, notes: string) => void
}) {
  const [score, setScore] = useState<string>(response.score != null ? String(response.score) : '')
  const [notes, setNotes] = useState(response.rubricNotes || '')
  const meta = BLOCK_META[response.blockType] || { color: '#6B7280', label: response.blockType }

  // Skip structural blocks
  if (response.blockType === 'section' || response.blockType === 'intro' || response.blockType === 'scoring-rule') {
    return null
  }

  const handleBlur = () => {
    const numScore = score !== '' ? Number(score) : undefined
    onUpdate(response.blockId, numScore, notes)
    fetch(`/api/submissions/${submissionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        responseUpdate: {
          blockId: response.blockId,
          score: numScore,
          rubricNotes: notes,
        },
      }),
    })
  }

  return (
    <div style={{
      background: '#FFFFFF', borderRadius: 10,
      border: '1px solid rgba(0,0,0,0.08)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      overflow: 'hidden', marginBottom: 16,
    }}>
      {/* Block header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        display: 'flex', alignItems: 'flex-start', gap: 10,
        background: '#FAFAFA',
      }}>
        <span style={{
          display: 'inline-block',
          background: `${meta.color}18`,
          color: meta.color,
          fontSize: 10.5, fontWeight: 700,
          padding: '3px 8px', borderRadius: 5,
          letterSpacing: '0.04em', textTransform: 'uppercase',
          flexShrink: 0,
        }}>
          {meta.label}
        </span>
        {response.blockTitle && (
          <span style={{ fontSize: 13.5, color: '#374151', fontWeight: 600, lineHeight: 1.4 }}>
            {response.blockTitle}
          </span>
        )}
      </div>

      {/* Response content */}
      <div style={{ padding: '16px 18px' }}>
        {response.blockType === 'video' && (
          response.videoUrl ? (
            <div style={{
              background: '#111827', borderRadius: 8,
              overflow: 'hidden', position: 'relative',
            }}>
              <video
                src={response.videoUrl}
                controls
                style={{ width: '100%', maxHeight: 360, display: 'block' }}
              />
            </div>
          ) : (
            <div style={{
              background: '#111827', borderRadius: 8, padding: '24px',
              color: 'rgba(255,255,255,0.4)', fontSize: 13.5,
              textAlign: 'center',
            }}>
              No video recorded
            </div>
          )
        )}

        {(response.blockType === 'open-text' || response.blockType === 'scenario' || response.blockType === 'case-study') && (
          response.textResponse ? (
            <div style={{
              background: '#F9FAFB', borderRadius: 7,
              border: '1px solid rgba(0,0,0,0.08)',
              padding: '12px 14px', fontSize: 13.5,
              color: '#374151', lineHeight: 1.65,
              whiteSpace: 'pre-wrap', minHeight: 60,
            }}>
              {response.textResponse}
            </div>
          ) : (
            <div style={{ color: '#D1D5DB', fontSize: 13, fontStyle: 'italic' }}>No response provided</div>
          )
        )}

        {response.blockType === 'multiple-choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {response.choiceResponse != null ? (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(52,81,209,0.08)', color: '#3451D1',
                padding: '8px 14px', borderRadius: 7, fontSize: 13.5, fontWeight: 600,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 12l2 2 4-4" />
                </svg>
                Option {Array.isArray(response.choiceResponse)
                  ? (response.choiceResponse as number[]).map(n => n + 1).join(', ')
                  : (response.choiceResponse as number) + 1
                } selected
              </div>
            ) : (
              <div style={{ color: '#D1D5DB', fontSize: 13, fontStyle: 'italic' }}>No selection made</div>
            )}
          </div>
        )}

        {(response.blockType === 'document-check' || response.blockType === 'file-upload') && (
          response.fileUrl ? (
            <a
              href={response.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(52,81,209,0.08)', color: '#3451D1',
                padding: '8px 14px', borderRadius: 7,
                fontSize: 13.5, fontWeight: 600, textDecoration: 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download File
            </a>
          ) : (
            <div style={{ color: '#D1D5DB', fontSize: 13, fontStyle: 'italic' }}>No file uploaded</div>
          )
        )}
      </div>

      {/* Scoring row */}
      <div style={{
        padding: '12px 18px 14px',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        background: '#FDFCFF',
        display: 'flex', gap: 14, alignItems: 'flex-start',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Score
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <input
              type="number"
              min={0}
              max={10}
              value={score}
              onChange={e => setScore(e.target.value)}
              onBlur={handleBlur}
              placeholder="—"
              style={{
                width: 56, padding: '6px 8px', borderRadius: 6,
                border: '1px solid rgba(0,0,0,0.12)', fontSize: 13.5,
                fontWeight: 600, color: '#111827',
                outline: 'none', background: '#fff', textAlign: 'center',
              }}
            />
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>/10</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Rubric Notes
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={handleBlur}
            placeholder="Add notes, feedback, or rubric observations…"
            rows={2}
            style={{
              width: '100%', padding: '7px 10px',
              border: '1px solid rgba(0,0,0,0.12)', borderRadius: 6,
              fontSize: 13, color: '#374151', background: '#fff',
              lineHeight: 1.5, resize: 'vertical',
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubmissionReview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [totalScore, setTotalScore] = useState<string>('')
  const [statusVal, setStatusVal] = useState<string>('submitted')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const stored: Submission[] = JSON.parse(localStorage.getItem('pa-submissions') || '[]')
      const found = stored.find(s => s.id === id)
      if (found) {
        setSubmission(found)
        setTotalScore(found.totalScore != null ? String(found.totalScore) : '')
        setStatusVal(found.status || 'submitted')
      } else {
        setNotFound(true)
      }
    } catch {
      setNotFound(true)
    }
    setLoading(false)
  }, [id])

  const saveToLocalStorage = (updated: Submission) => {
    try {
      const stored: Submission[] = JSON.parse(localStorage.getItem('pa-submissions') || '[]')
      const idx = stored.findIndex(s => s.id === id)
      if (idx >= 0) stored[idx] = updated
      localStorage.setItem('pa-submissions', JSON.stringify(stored))
    } catch {}
  }

  const handleResponseUpdate = (blockId: string, score: number | undefined, notes: string) => {
    if (!submission) return
    const updated = {
      ...submission,
      responses: submission.responses.map(r =>
        r.blockId === blockId ? { ...r, score, rubricNotes: notes } : r
      ),
    }
    setSubmission(updated)
    saveToLocalStorage(updated)
  }

  const handleSaveGrade = async () => {
    setSaving(true)
    const numScore = totalScore !== '' ? Number(totalScore) : undefined
    if (submission) {
      const updated = { ...submission, totalScore: numScore, status: statusVal as Submission['status'] }
      setSubmission(updated)
      saveToLocalStorage(updated)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const programDisplay = submission?.programName?.split('::')[2] || submission?.programName || ''

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F0F2F5', overflow: 'hidden' }}>
      <Sidebar active="submissions" />

      {/* Main */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 32 }}><Spinner /></div>
        ) : notFound ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <p style={{ fontSize: 15, color: '#6B7280' }}>Submission not found.</p>
            <Link href="/admin" style={{ color: '#3451D1', textDecoration: 'none', fontSize: 13.5 }}>← Back to Dashboard</Link>
          </div>
        ) : submission ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
            {/* Content */}
            <div style={{ flex: 1, minWidth: 0, padding: '28px 28px 40px' }}>
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

              {/* Header card */}
              <div style={{
                background: '#FFFFFF', borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                padding: '22px 24px', marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', letterSpacing: '-0.03em', margin: '0 0 4px' }}>
                      {submission.studentName}
                    </h1>
                    <div style={{ fontSize: 13.5, color: '#6B7280', marginBottom: 12 }}>
                      {submission.studentEmail}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                      {programDisplay && (
                        <span style={{
                          background: 'rgba(52,81,209,0.08)', color: '#3451D1',
                          fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                        }}>
                          {programDisplay}
                        </span>
                      )}
                      <span style={{ fontSize: 13, color: '#374151' }}>{submission.assessmentTitle}</span>
                      {submission.submittedAt && (
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                          Submitted {new Date(submission.submittedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                      <StatusBadge status={submission.status} />
                    </div>
                  </div>
                  {submission.totalScore != null && (
                    <div style={{
                      textAlign: 'center', flexShrink: 0,
                      background: 'rgba(52,81,209,0.06)', borderRadius: 10, padding: '10px 18px',
                    }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: '#3451D1', letterSpacing: '-0.04em' }}>
                        {submission.totalScore}%
                      </div>
                      <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>Score</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Responses */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Responses · {submission.responses.filter(r => !['section','intro','scoring-rule'].includes(r.blockType)).length} blocks
                </div>
                {submission.responses.map(r => (
                  <ResponseBlock
                    key={r.blockId}
                    response={r}
                    submissionId={id}
                    onUpdate={handleResponseUpdate}
                  />
                ))}
                {submission.responses.filter(r => !['section','intro','scoring-rule'].includes(r.blockType)).length === 0 && (
                  <div style={{
                    background: '#FFFFFF', borderRadius: 10, padding: '32px 24px',
                    textAlign: 'center', border: '1px solid rgba(0,0,0,0.08)',
                    color: '#9CA3AF', fontSize: 13.5,
                  }}>
                    No responses in this submission.
                  </div>
                )}
              </div>
            </div>

            {/* Grade panel (sticky) */}
            <div style={{
              width: 260, flexShrink: 0,
              padding: '28px 20px 28px 0',
              position: 'sticky', top: 0,
            }}>
              <div style={{
                background: '#FFFFFF', borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                padding: '20px',
              }}>
                <h3 style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Grade</h3>

                {/* Total score */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                    Total Score (0–100)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={totalScore}
                      onChange={e => setTotalScore(e.target.value)}
                      placeholder="—"
                      style={{
                        flex: 1, padding: '8px 10px', borderRadius: 7,
                        border: '1px solid rgba(0,0,0,0.12)', fontSize: 15,
                        fontWeight: 700, color: '#111827', outline: 'none',
                        background: '#fff', textAlign: 'center',
                      }}
                    />
                    <span style={{ fontSize: 13, color: '#9CA3AF' }}>%</span>
                  </div>
                </div>

                {/* Status */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>
                    Status
                  </label>
                  <select
                    value={statusVal}
                    onChange={e => setStatusVal(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 10px', borderRadius: 7,
                      border: '1px solid rgba(0,0,0,0.12)', fontSize: 13.5,
                      color: '#111827', outline: 'none', background: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="submitted">Submitted</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="in-progress">In Progress</option>
                  </select>
                </div>

                <button
                  onClick={handleSaveGrade}
                  disabled={saving}
                  style={{
                    width: '100%', padding: '10px 0', borderRadius: 8,
                    background: saved ? '#16A34A' : '#3451D1',
                    color: '#fff', border: 'none', fontSize: 13.5,
                    fontWeight: 700, cursor: saving ? 'wait' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Grade'}
                </button>

                {submission.submittedAt && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                    <div style={{ fontSize: 11, color: '#D1D5DB', fontWeight: 500, marginBottom: 4 }}>Submitted</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                      {new Date(submission.submittedAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
