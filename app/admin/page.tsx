'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PROGRAMS, computeFitScore, getScoreLabel, getProgramByAssessmentId, seedDemoSubmissions } from '@/lib/programs'

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
  programId?: string
  startedAt: string
  submittedAt?: string
  status: string
  totalScore?: number
  responses: SubmissionResponse[]
}

interface ProgramStat {
  programId: string
  programName: string
  school: string
  assessmentId: string
  submissions: Submission[]
  topScore: number
  avgScore: number
  strongFitCount: number
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar() {
  return (
    <div style={{
      width: 220, minWidth: 220, height: '100vh',
      background: '#111827', display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, flexShrink: 0,
    }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <img src="/passagehq_logo.jpeg" alt="Passage" style={{ height: 28, width: 28, borderRadius: 6, objectFit: 'cover' }} />
          <div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>Passage.</span>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '10px 8px' }}>
        {[
          { href: '/admin', label: 'Programs', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', active: true },
          { href: '/admin', label: 'All Submissions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', active: false },
          { href: '/marketplace', label: 'Marketplace', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', active: false },
        ].map(item => (
          <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 7,
              background: item.active ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: item.active ? '#fff' : 'rgba(255,255,255,0.5)',
              fontSize: 13, fontWeight: item.active ? 600 : 400, margin: '1px 0', cursor: 'pointer',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={item.icon} />
              </svg>
              {item.label}
            </div>
          </Link>
        ))}
      </nav>

      <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Link href="/marketplace" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 7,
            background: 'transparent', color: 'rgba(255,255,255,0.45)',
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
            Student marketplace ↗
          </div>
        </Link>
        <Link href="/assessments/new" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 7,
            background: 'rgba(79,70,229,0.4)', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 4v16m8-8H4" />
            </svg>
            New Assessment
          </div>
        </Link>
      </div>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '18px 20px',
      border: '1px solid #E5E7EB', flex: 1, minWidth: 0,
    }}>
      <p style={{ fontSize: 11.5, color: '#9CA3AF', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800, color: color || '#111827', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#9CA3AF', margin: '5px 0 0' }}>{sub}</p>}
    </div>
  )
}

// ─── Program Card ─────────────────────────────────────────────────────────────
function ProgramCard({ stat }: { stat: ProgramStat }) {
  const strongPct = stat.submissions.length > 0 ? Math.round((stat.strongFitCount / stat.submissions.length) * 100) : 0
  const pending = stat.submissions.filter(s => s.status === 'submitted').length

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
      overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
    }}>
      {/* Header */}
      <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 2px', lineHeight: 1.3 }}>
              {stat.programName}
            </p>
            <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>{stat.school}</p>
          </div>
          {pending > 0 && (
            <span style={{
              flexShrink: 0, fontSize: 10.5, fontWeight: 700, color: '#92400E',
              background: '#FEF3C7', padding: '3px 8px', borderRadius: 20
            }}>
              {pending} pending
            </span>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '14px 18px', gap: 8 }}>
        {[
          { label: 'Students', value: stat.submissions.length },
          { label: 'Avg Score', value: stat.submissions.length > 0 ? stat.avgScore : '—' },
          { label: 'Strong Fit', value: stat.submissions.length > 0 ? `${strongPct}%` : '—' },
        ].map(item => (
          <div key={item.label} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>{item.value}</p>
            <p style={{ fontSize: 10.5, color: '#9CA3AF', margin: '2px 0 0' }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Top score bar */}
      {stat.submissions.length > 0 && (
        <div style={{ padding: '0 18px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#9CA3AF' }}>Top score</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{stat.topScore}</span>
          </div>
          <div style={{ height: 4, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${stat.topScore}%`, background: stat.topScore >= 85 ? '#10B981' : '#4F46E5', borderRadius: 2 }} />
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: '12px 18px', borderTop: '1px solid #F3F4F6', display: 'flex', gap: 8 }}>
        <Link href={`/admin/programs/${stat.programId}`} style={{ flex: 1, textDecoration: 'none' }}>
          <button style={{
            width: '100%', height: 34, borderRadius: 8, border: 'none',
            background: '#111827', color: '#fff', fontSize: 12.5, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit'
          }}>
            View leaderboard →
          </button>
        </Link>
        <Link href={`/admin/compare/${stat.assessmentId}`} style={{ textDecoration: 'none' }}>
          <button style={{
            height: 34, padding: '0 12px', borderRadius: 8,
            border: '1px solid #E5E7EB', background: '#fff',
            color: '#374151', fontSize: 12.5, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap'
          }}>
            Compare
          </button>
        </Link>
      </div>
    </div>
  )
}

// ─── Recent Submissions Row ───────────────────────────────────────────────────
function SubmissionRow({ s, score }: { s: Submission; score: number }) {
  const { label, color, bg } = getScoreLabel(score)
  return (
    <tr style={{ borderBottom: '1px solid #F9FAFB' }}>
      <td style={{ padding: '11px 16px' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>{s.studentName}</p>
        <p style={{ fontSize: 11.5, color: '#9CA3AF', margin: '1px 0 0' }}>{s.studentEmail}</p>
      </td>
      <td style={{ padding: '11px 16px' }}>
        <p style={{ fontSize: 12.5, color: '#374151', margin: 0 }}>
          {s.programName ? s.programName.split('::')[2] || s.programName.split(' — ')[0] || s.programName : '—'}
        </p>
      </td>
      <td style={{ padding: '11px 16px' }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: bg, color }}>
          {score > 0 ? label : '—'}
        </span>
      </td>
      <td style={{ padding: '11px 16px', fontSize: 20, fontWeight: 700, color: '#111827' }}>
        {score > 0 ? score : '—'}
      </td>
      <td style={{ padding: '11px 16px', fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
        {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) : '—'}
      </td>
      <td style={{ padding: '11px 16px' }}>
        <Link href={`/admin/submissions/${s.id}`} style={{ textDecoration: 'none' }}>
          <button style={{
            height: 30, padding: '0 12px', borderRadius: 6, border: 'none',
            background: 'rgba(79,70,229,0.08)', color: '#4F46E5',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
          }}>
            Review →
          </button>
        </Link>
      </td>
    </tr>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    seedDemoSubmissions()
    try {
      const stored: Submission[] = JSON.parse(localStorage.getItem('pa-submissions') || '[]')
      stored.sort((a, b) => new Date(b.submittedAt || b.startedAt).getTime() - new Date(a.submittedAt || a.startedAt).getTime())
      setSubmissions(stored)
    } catch {}
    setLoading(false)
  }, [])

  // Build per-program stats
  const programStats: ProgramStat[] = PROGRAMS.filter(p => p.hasAssessment && p.assessmentId).map(p => {
    const subs = submissions.filter(s => s.assessmentId === p.assessmentId)
    const scores = subs.map(s => computeFitScore(s.id, s.responses))
    const topScore = scores.length > 0 ? Math.max(...scores) : 0
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    const strongFitCount = scores.filter(sc => sc >= 85).length
    return {
      programId: p.id,
      programName: p.name,
      school: p.school,
      assessmentId: p.assessmentId!,
      submissions: subs,
      topScore,
      avgScore,
      strongFitCount,
    }
  })

  const totalSubmissions = submissions.length
  const totalPending = submissions.filter(s => s.status === 'submitted').length
  const totalStrongFit = submissions.filter(s => computeFitScore(s.id, s.responses) >= 85).length
  const programsWithSubmissions = programStats.filter(p => p.submissions.length > 0).length

  // Also include non-marketplace submissions (from custom assessments)
  const marketplaceAssessmentIds = new Set(PROGRAMS.map(p => p.assessmentId).filter(Boolean))
  const otherSubmissions = submissions.filter(s => !marketplaceAssessmentIds.has(s.assessmentId))

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F9FAFB', fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{
          background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '18px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.03em' }}>
              Program Dashboard
            </h1>
            <p style={{ fontSize: 12.5, color: '#9CA3AF', margin: '2px 0 0' }}>
              Manage fit assessments and review candidates per program
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/marketplace" style={{ textDecoration: 'none' }}>
              <button style={{
                height: 36, padding: '0 14px', borderRadius: 8,
                border: '1px solid #E5E7EB', background: '#fff',
                color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit'
              }}>
                View marketplace →
              </button>
            </Link>
            <Link href="/assessments/new" style={{ textDecoration: 'none' }}>
              <button style={{
                height: 36, padding: '0 14px', borderRadius: 8, border: 'none',
                background: '#111827', color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
              }}>
                + New Assessment
              </button>
            </Link>
          </div>
        </div>

        <div style={{ padding: '24px 28px', flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 24, height: 24, border: '2.5px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <StatCard label="Total Submissions" value={totalSubmissions} sub={`across ${programsWithSubmissions} programs`} />
                <StatCard label="Pending Review" value={totalPending} sub="awaiting admin review" color={totalPending > 0 ? '#D97706' : undefined} />
                <StatCard label="Strong Fit" value={totalStrongFit} sub="scored 85+ on their assessment" color="#065F46" />
                <StatCard label="Active Programs" value={programStats.length} sub="with fit assessments live" />
              </div>

              {/* Programs grid */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>
                    Programs with Fit Assessments
                  </p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
                    Click "View leaderboard" to see ranked candidates
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {programStats.map(stat => (
                    <ProgramCard key={stat.programId} stat={stat} />
                  ))}
                </div>
              </div>

              {/* Recent submissions table */}
              {submissions.length > 0 && (
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', margin: 0 }}>Recent Submissions</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>{totalSubmissions} total</p>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        {['Student', 'Program', 'Fit', 'Score', 'Date', ''].map(h => (
                          <th key={h} style={{
                            padding: '9px 16px', textAlign: 'left',
                            fontSize: 11, fontWeight: 600, color: '#9CA3AF',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                            borderBottom: '1px solid #F3F4F6'
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.slice(0, 15).map(s => (
                        <SubmissionRow key={s.id} s={s} score={computeFitScore(s.id, s.responses)} />
                      ))}
                    </tbody>
                  </table>
                  {submissions.length > 15 && (
                    <div style={{ padding: '12px 18px', borderTop: '1px solid #F9FAFB', textAlign: 'center' }}>
                      <span style={{ fontSize: 12.5, color: '#6B7280' }}>Showing 15 of {submissions.length} — click a program above to see full ranked list</span>
                    </div>
                  )}
                </div>
              )}

              {submissions.length === 0 && (
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '48px 32px', textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 6px' }}>No submissions yet</p>
                  <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 20px' }}>
                    Students can take fit assessments from the marketplace.
                  </p>
                  <Link href="/marketplace" style={{ textDecoration: 'none' }}>
                    <button style={{
                      height: 38, padding: '0 18px', borderRadius: 8, border: 'none',
                      background: '#111827', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                    }}>
                      View marketplace →
                    </button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
