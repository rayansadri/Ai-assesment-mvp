'use client'
import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { getProgramById, computeFitScore, getScoreLabel, PROGRAMS } from '@/lib/programs'

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
  studentName: string
  submittedAt: string
  responses: SubmissionResponse[]
}

interface RankedEntry {
  submissionId: string
  name: string
  score: number
  isYou: boolean
  submittedAt: string
}

// Synthesize a realistic cohort from a seed
function generateCohort(assessmentId: string, realEntries: RankedEntry[]): RankedEntry[] {
  const seed = assessmentId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const fakeNames = [
    'Aisha K.', 'Marcus T.', 'Priya S.', 'Daniel R.', 'Fatima A.',
    'James O.', 'Mei L.', 'Carlos B.', 'Amara D.', 'Noah M.',
    'Leila H.', 'Omar F.', 'Ingrid P.', 'Kofi N.', 'Yuki T.',
    'Benita A.', 'Raj V.', 'Sofia E.', 'Kevin W.', 'Nadia C.',
  ]

  const fakeEntries: RankedEntry[] = fakeNames.map((name, i) => {
    const fakeSeed = seed + i * 17
    const score = Math.min(95, Math.max(52, 65 + (fakeSeed % 30)))
    return {
      submissionId: `fake-${i}`,
      name,
      score,
      isYou: false,
      submittedAt: new Date(Date.now() - (i + 1) * 3600000 * 2).toISOString(),
    }
  })

  const all = [...fakeEntries, ...realEntries]
  return all.sort((a, b) => b.score - a.score)
}

export default function LeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: programId } = use(params)
  const searchParams = useSearchParams()
  const mySubmissionId = searchParams.get('submissionId')
  const program = getProgramById(programId)

  const [entries, setEntries] = useState<RankedEntry[]>([])
  const [myEntry, setMyEntry] = useState<RankedEntry | null>(null)
  const [myRank, setMyRank] = useState<number | null>(null)

  useEffect(() => {
    try {
      const stored: Submission[] = JSON.parse(localStorage.getItem('pa-submissions') || '[]')
      const assessmentId = program?.assessmentId || ''

      const real: RankedEntry[] = stored
        .filter(s => s.assessmentId === assessmentId)
        .map(s => ({
          submissionId: s.id,
          name: s.id === mySubmissionId ? 'You' : s.studentName || 'Anonymous',
          score: computeFitScore(s.id, s.responses),
          isYou: s.id === mySubmissionId,
          submittedAt: s.submittedAt,
        }))

      const cohort = generateCohort(assessmentId, real)
      setEntries(cohort)

      const meIdx = cohort.findIndex(e => e.submissionId === mySubmissionId)
      if (meIdx !== -1) {
        setMyEntry(cohort[meIdx])
        setMyRank(meIdx + 1)
      }
    } catch {}
  }, [programId, mySubmissionId, program?.assessmentId])

  if (!program) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6B7280' }}>Program not found.</p>
      </div>
    )
  }

  const total = entries.length
  const percentile = myRank ? Math.round(((total - myRank) / total) * 100) : null

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Nav */}
      <nav style={{
        background: '#fff', borderBottom: '1px solid #E5E7EB',
        height: 52, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12
      }}>
        <Link href="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <img src="/passagehq_logo.jpeg" alt="Passage" style={{ height: 26, width: 26, borderRadius: 5, objectFit: 'cover' }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Passage.</span>
        </Link>
        <span style={{ color: '#D1D5DB' }}>›</span>
        <span style={{ fontSize: 13, color: '#6B7280' }}>{program.name}</span>
        <span style={{ color: '#D1D5DB' }}>›</span>
        <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>Cohort Comparison</span>
      </nav>

      <div style={{ maxWidth: 580, margin: '0 auto', padding: '28px 24px 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 6px', letterSpacing: '-0.03em' }}>
            How you compare
          </h1>
          <p style={{ fontSize: 13.5, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
            {program.name} · {total} students have taken this assessment
          </p>
        </div>

        {/* Your position card */}
        {myEntry && myRank && percentile !== null && (
          <div style={{
            background: 'linear-gradient(135deg, #1E40AF 0%, #4F46E5 100%)',
            borderRadius: 16, padding: '20px 24px', marginBottom: 16,
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4
          }}>
            {[
              { label: 'Your Score', value: myEntry.score.toString() },
              { label: 'Your Rank', value: `#${myRank} of ${total}` },
              { label: 'Percentile', value: `Top ${100 - percentile}%` },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{item.value}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', margin: '3px 0 0', fontWeight: 500 }}>{item.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Distribution bar */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '20px 24px',
          border: '1px solid #E5E7EB', marginBottom: 14
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Score distribution</p>
          {(['85–95', '72–84', '60–71', '52–59'] as const).map((range, ri) => {
            const [lo, hi] = range.split('–').map(Number)
            const count = entries.filter(e => e.score >= lo && e.score <= hi).length
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            const colors = ['#10B981', '#4F46E5', '#F59E0B', '#EF4444']
            const labels = ['Strong Fit', 'Good Fit', 'Developing Fit', 'Early Stage']
            const myInRange = myEntry && myEntry.score >= lo && myEntry.score <= hi

            return (
              <div key={range} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>{range}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: colors[ri] }}>{labels[ri]}</span>
                    {myInRange && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#1E40AF',
                        background: '#DBEAFE', padding: '1px 6px', borderRadius: 10
                      }}>
                        You
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>{count} students ({pct}%)</span>
                </div>
                <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${pct}%`, background: colors[ri],
                    borderRadius: 4, transition: 'width 0.6s ease', opacity: myInRange ? 1 : 0.6
                  }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Top performers note */}
        <div style={{
          background: '#ECFDF5', borderRadius: 12, padding: '12px 16px',
          border: '1px solid #A7F3D0', marginBottom: 20
        }}>
          <p style={{ fontSize: 13, color: '#065F46', margin: 0, lineHeight: 1.5 }}>
            <strong>Note:</strong> This comparison is private — only you can see your rank. We share cohort distributions with programs to help them calibrate assessments, not to rank students publicly.
          </p>
        </div>

        {/* Ranking list (top 10 visible) */}
        <div style={{
          background: '#fff', borderRadius: 16, overflow: 'hidden',
          border: '1px solid #E5E7EB', marginBottom: 20
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>Top performers in this cohort</p>
          </div>
          {entries.slice(0, 10).map((entry, i) => {
            const { label, color, bg } = getScoreLabel(entry.score)
            return (
              <div key={entry.submissionId} style={{
                display: 'flex', alignItems: 'center', padding: '12px 20px', gap: 12,
                borderBottom: i < 9 ? '1px solid #F9FAFB' : 'none',
                background: entry.isYou ? '#F0F4FF' : '#fff'
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: i === 0 ? '#FEF3C7' : i === 1 ? '#F3F4F6' : i === 2 ? '#FEF3C7' : '#F9FAFB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                  color: i === 0 ? '#D97706' : i === 1 ? '#6B7280' : i === 2 ? '#B45309' : '#9CA3AF'
                }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: entry.isYou ? 700 : 500, color: entry.isYou ? '#1E40AF' : '#111827', margin: 0 }}>
                    {entry.name} {entry.isYou && <span style={{ fontSize: 11, fontWeight: 600, color: '#3B82F6', marginLeft: 4 }}>← You</span>}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: bg, color, fontWeight: 600 }}>
                    {label}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', width: 30, textAlign: 'right' }}>
                    {entry.score}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 10 }}>
          {mySubmissionId && (
            <Link href={`/marketplace/programs/${programId}/results/${mySubmissionId}`} style={{ flex: 1, textDecoration: 'none' }}>
              <button style={{
                width: '100%', height: 42, borderRadius: 10, border: '1.5px solid #E5E7EB',
                background: '#fff', fontSize: 13.5, fontWeight: 600, color: '#374151',
                cursor: 'pointer', fontFamily: 'inherit'
              }}>
                ← Back to my results
              </button>
            </Link>
          )}
          <Link href={`/marketplace/programs/${programId}`} style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{
              width: '100%', height: 42, borderRadius: 10, border: 'none',
              background: '#111827', fontSize: 13.5, fontWeight: 600, color: '#fff',
              cursor: 'pointer', fontFamily: 'inherit'
            }}>
              View program →
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
