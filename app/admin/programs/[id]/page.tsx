'use client'
import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { getProgramById, computeFitScore, getScoreLabel } from '@/lib/programs'

interface SubmissionResponse {
  blockId: string
  blockType: string
  textResponse?: string
  videoUrl?: string
  choiceResponse?: number | number[]
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
  status: string
  responses: SubmissionResponse[]
}

interface RankedStudent {
  submission: Submission
  score: number
  rank: number
}

type FilterTier = 'all' | 'strong' | 'good' | 'developing'

export default function AdminProgramLeaderboard({ params }: { params: Promise<{ id: string }> }) {
  const { id: programId } = use(params)
  const program = getProgramById(programId)
  const [students, setStudents] = useState<RankedStudent[]>([])
  const [filter, setFilter] = useState<FilterTier>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!program?.assessmentId) { setLoading(false); return }
    try {
      const stored: Submission[] = JSON.parse(localStorage.getItem('pa-submissions') || '[]')
      const relevant = stored.filter(s => s.assessmentId === program.assessmentId)
      const scored = relevant
        .map(s => ({ submission: s, score: computeFitScore(s.id, s.responses), rank: 0 }))
        .sort((a, b) => b.score - a.score)
        .map((s, i) => ({ ...s, rank: i + 1 }))
      setStudents(scored)
    } catch {}
    setLoading(false)
  }, [program?.assessmentId])

  const filtered = students.filter(s => {
    if (filter === 'strong') return s.score >= 85
    if (filter === 'good') return s.score >= 72 && s.score < 85
    if (filter === 'developing') return s.score < 72
    return true
  })

  const strongCount = students.filter(s => s.score >= 85).length
  const goodCount = students.filter(s => s.score >= 72 && s.score < 85).length
  const avgScore = students.length > 0 ? Math.round(students.reduce((a, s) => a + s.score, 0) / students.length) : 0
  const topScore = students.length > 0 ? students[0].score : 0

  if (!program) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <p style={{ color: '#6B7280' }}>Program not found. <Link href="/admin">← Back</Link></p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F9FAFB', fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{
        width: 220, minWidth: 220, height: '100vh',
        background: '#111827', display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, flexShrink: 0,
      }}>
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <img src="/passagehq_logo.jpeg" alt="Passage" style={{ height: 28, width: 28, borderRadius: 6, objectFit: 'cover' }} />
            <div>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Passage.</span>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '10px 8px' }}>
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 7, color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '1px 0', cursor: 'pointer' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              All Programs
            </div>
          </Link>
          <div style={{ padding: '8px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, fontWeight: 600, margin: '1px 0' }}>
            {program.name}
          </div>
        </nav>
        <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href={`/assessments/${program.assessmentId}/builder`} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 7, background: 'rgba(79,70,229,0.4)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Edit Assessment
            </div>
          </Link>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '18px 28px', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 2px', letterSpacing: '-0.03em' }}>
                {program.name}
              </h1>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
                {program.school} · {students.length} student{students.length !== 1 ? 's' : ''} assessed
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href={`/marketplace/programs/${programId}`} style={{ textDecoration: 'none' }}>
                <button style={{
                  height: 34, padding: '0 12px', borderRadius: 8, border: '1px solid #E5E7EB',
                  background: '#fff', color: '#374151', fontSize: 12.5, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit'
                }}>
                  View student page →
                </button>
              </Link>
              <Link href={`/admin/compare/${program.assessmentId}`} style={{ textDecoration: 'none' }}>
                <button style={{
                  height: 34, padding: '0 12px', borderRadius: 8, border: 'none',
                  background: '#111827', color: '#fff', fontSize: 12.5, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit'
                }}>
                  Compare side-by-side
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 28px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 24, height: 24, border: '2.5px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : students.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '48px 32px', textAlign: 'center' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>No students yet</p>
              <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 20px' }}>
                Share the program page so students can take the fit assessment.
              </p>
              <Link href={`/marketplace/programs/${programId}`} style={{ textDecoration: 'none' }}>
                <button style={{ height: 36, padding: '0 16px', borderRadius: 8, border: 'none', background: '#111827', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  View program page →
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* Stats row */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total Students', value: students.length, color: undefined },
                  { label: 'Top Score', value: topScore, color: topScore >= 85 ? '#065F46' : '#1E40AF' },
                  { label: 'Avg Score', value: avgScore, color: '#374151' },
                  { label: 'Strong Fit', value: strongCount, color: '#065F46' },
                  { label: 'Good Fit', value: goodCount, color: '#1E40AF' },
                ].map(item => (
                  <div key={item.label} style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: item.color || '#111827', margin: 0, letterSpacing: '-0.03em' }}>{item.value}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', margin: '3px 0 0', fontWeight: 500 }}>{item.label}</p>
                  </div>
                ))}
              </div>

              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {([
                  { key: 'all', label: `All (${students.length})`, color: '#fff', bg: '#111827' },
                  { key: 'strong', label: `Strong Fit (${strongCount})`, color: '#065F46', bg: '#D1FAE5' },
                  { key: 'good', label: `Good Fit (${goodCount})`, color: '#1E40AF', bg: '#DBEAFE' },
                  { key: 'developing', label: `Developing (${students.length - strongCount - goodCount})`, color: '#92400E', bg: '#FEF3C7' },
                ] as const).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    style={{
                      height: 32, padding: '0 14px', borderRadius: 20, cursor: 'pointer',
                      border: filter === tab.key ? 'none' : '1px solid #E5E7EB',
                      background: filter === tab.key ? tab.bg : '#fff',
                      color: filter === tab.key ? tab.color : '#6B7280',
                      fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Leaderboard table */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      {['Rank', 'Student', 'Score', 'Fit', 'Responses', 'Date', 'Action'].map(h => (
                        <th key={h} style={{
                          padding: '10px 16px', textAlign: 'left',
                          fontSize: 11, fontWeight: 600, color: '#9CA3AF',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                          borderBottom: '1px solid #F3F4F6', whiteSpace: 'nowrap'
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((entry) => {
                      const { label, color, bg } = getScoreLabel(entry.score)
                      const filled = entry.submission.responses.filter(r =>
                        (r.textResponse && r.textResponse.length > 5) || r.videoUrl || r.choiceResponse !== undefined
                      ).length
                      const total = entry.submission.responses.length
                      const isTop = entry.rank <= 3

                      return (
                        <tr key={entry.submission.id} style={{
                          borderBottom: '1px solid #F9FAFB',
                          background: entry.score >= 85 ? '#FAFFF9' : '#fff'
                        }}>
                          <td style={{ padding: '13px 16px' }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: isTop ? (entry.rank === 1 ? '#FEF3C7' : entry.rank === 2 ? '#F3F4F6' : '#FEF3C7') : '#F9FAFB',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: isTop ? 14 : 12, fontWeight: 700,
                              color: isTop ? (entry.rank === 1 ? '#D97706' : entry.rank === 2 ? '#6B7280' : '#B45309') : '#9CA3AF'
                            }}>
                              {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                            </div>
                          </td>
                          <td style={{ padding: '13px 16px' }}>
                            <p style={{ fontSize: 13.5, fontWeight: 600, color: '#111827', margin: 0 }}>{entry.submission.studentName}</p>
                            <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>{entry.submission.studentEmail}</p>
                          </td>
                          <td style={{ padding: '13px 16px' }}>
                            <span style={{ fontSize: 22, fontWeight: 800, color: entry.score >= 85 ? '#065F46' : entry.score >= 72 ? '#1E40AF' : '#92400E', letterSpacing: '-0.03em' }}>
                              {entry.score}
                            </span>
                          </td>
                          <td style={{ padding: '13px 16px' }}>
                            <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: bg, color }}>
                              {label}
                            </span>
                          </td>
                          <td style={{ padding: '13px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ width: 60, height: 5, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${total > 0 ? (filled / total) * 100 : 0}%`, background: '#4F46E5', borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: 11.5, color: '#6B7280' }}>{filled}/{total}</span>
                            </div>
                            {entry.submission.responses.some(r => r.videoUrl) && (
                              <span style={{ fontSize: 10, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                                </svg>
                                video
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '13px 16px', fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                            {entry.submission.submittedAt
                              ? new Date(entry.submission.submittedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
                              : '—'}
                          </td>
                          <td style={{ padding: '13px 16px' }}>
                            <Link href={`/admin/submissions/${entry.submission.id}`} style={{ textDecoration: 'none' }}>
                              <button style={{
                                height: 32, padding: '0 14px', borderRadius: 7, border: 'none',
                                background: entry.score >= 85 ? '#D1FAE5' : 'rgba(79,70,229,0.08)',
                                color: entry.score >= 85 ? '#065F46' : '#4F46E5',
                                fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                whiteSpace: 'nowrap'
                              }}>
                                {entry.score >= 85 ? '⭐ Review' : 'Review →'}
                              </button>
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <div style={{ padding: '28px', textAlign: 'center' }}>
                    <p style={{ fontSize: 13.5, color: '#9CA3AF', margin: 0 }}>No students in this tier yet.</p>
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
