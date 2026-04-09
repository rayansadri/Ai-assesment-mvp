'use client'
import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getProgramById, computeFitScore, getScoreLabel, STRENGTHS_BY_CATEGORY } from '@/lib/programs'

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
  submittedAt: string
  status: string
  responses: SubmissionResponse[]
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    // Animate count-up
    let frame = 0
    const total = 40
    const interval = setInterval(() => {
      frame++
      setDisplayed(Math.round((score * frame) / total))
      if (frame >= total) clearInterval(interval)
    }, 18)
    return () => clearInterval(interval)
  }, [score])

  const dash = (displayed / 100) * circ

  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#F3F4F6" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={score >= 85 ? '#10B981' : score >= 72 ? '#4F46E5' : '#F59E0B'}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.05s' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ fontSize: 30, fontWeight: 800, color: '#111827', lineHeight: 1, letterSpacing: '-0.03em' }}>
          {displayed}
        </span>
        <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>/ 100</span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResultsPage({ params }: { params: Promise<{ id: string; submissionId: string }> }) {
  const { id: programId, submissionId } = use(params)
  const router = useRouter()
  const program = getProgramById(programId)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored: Submission[] = JSON.parse(localStorage.getItem('pa-submissions') || '[]')
      const found = stored.find(s => s.id === submissionId)
      setSubmission(found || null)
    } catch {}
    setLoading(false)
  }, [submissionId])

  if (loading) return null

  if (!submission || !program) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6B7280', fontSize: 15 }}>Results not found.</p>
          <Link href="/marketplace" style={{ color: '#4F46E5', fontSize: 13 }}>← Back to marketplace</Link>
        </div>
      </div>
    )
  }

  const score = computeFitScore(submissionId, submission.responses)
  const { label: scoreLabel, color: scoreColor, bg: scoreBg } = getScoreLabel(score)
  const allStrengths = STRENGTHS_BY_CATEGORY[program.category] || STRENGTHS_BY_CATEGORY['business']

  // Assign strengths and weaknesses based on submission characteristics
  const hasVideo = submission.responses.some(r => r.videoUrl)
  const hasText = submission.responses.some(r => r.textResponse && r.textResponse.length > 30)
  const hasChoice = submission.responses.some(r => r.choiceResponse !== undefined)

  const strengths = allStrengths.slice(0, score >= 80 ? 3 : 2)
  const improvements = allStrengths.slice(score >= 80 ? 3 : 2, score >= 80 ? 4 : 4)

  const isStrongFit = score >= 85

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
        <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>Your Results</span>
      </nav>

      <div style={{ maxWidth: 580, margin: '0 auto', padding: '32px 24px 60px' }}>

        {/* Verified badge for strong fit */}
        {isStrongFit && (
          <div style={{
            background: 'linear-gradient(135deg, #065F46 0%, #0F766E 100%)',
            borderRadius: 14, padding: '16px 20px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 12
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>
                Verified Fit for {program.name}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: '2px 0 0' }}>
                Your result qualifies you for priority review and faster loan assessment.
              </p>
            </div>
          </div>
        )}

        {/* Score card */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '28px 24px',
          border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          marginBottom: 16
        }}>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 20px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Your Fit Result
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <ScoreRing score={score} />
            <div>
              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                background: scoreBg, color: scoreColor,
                fontSize: 13, fontWeight: 700, marginBottom: 8
              }}>
                {scoreLabel}
              </span>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {program.name}
              </h1>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>{program.school}</p>
              <p style={{ fontSize: 12, color: '#9CA3AF', margin: '3px 0 0' }}>
                Submitted {new Date(submission.submittedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Strengths */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '20px 24px',
          border: '1px solid #E5E7EB', marginBottom: 12
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Your strengths</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {strengths.map(s => (
              <span key={s} style={{
                padding: '5px 12px', borderRadius: 20,
                background: '#D1FAE5', color: '#065F46',
                fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 5
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {s}
              </span>
            ))}
          </div>
          {improvements.length > 0 && (
            <>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '16px 0 10px' }}>Areas to develop</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {improvements.map(s => (
                  <span key={s} style={{
                    padding: '5px 12px', borderRadius: 20,
                    background: '#FEF3C7', color: '#92400E',
                    fontSize: 13, fontWeight: 600
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Response summary */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '20px 24px',
          border: '1px solid #E5E7EB', marginBottom: 20
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Assessment summary</p>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'Questions answered', value: submission.responses.filter(r => r.textResponse || r.videoUrl || r.choiceResponse !== undefined).length + ' of ' + submission.responses.length },
              { label: 'Video responses', value: submission.responses.filter(r => r.videoUrl).length.toString() },
              { label: 'Written answers', value: submission.responses.filter(r => r.textResponse).length.toString() },
            ].map((item, i) => (
              <div key={i} style={{
                flex: 1, padding: '12px 14px', borderRadius: 10,
                background: '#F9FAFB', border: '1px solid #F3F4F6', textAlign: 'center'
              }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>{item.value}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: '3px 0 0' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Next steps */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '20px 24px',
          border: '1px solid #E5E7EB', marginBottom: 16
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>What to do next</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isStrongFit ? (
              <>
                <ActionCard
                  icon="M13 10V3L4 14h7v7l9-11h-7z"
                  iconBg="#D1FAE5" iconColor="#065F46"
                  title="Move faster in the funnel"
                  sub="Your strong fit score qualifies you for priority admissions review."
                  cta="Continue application"
                  primary
                />
                <ActionCard
                  icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  iconBg="#DBEAFE" iconColor="#1E40AF"
                  title="Loan review can start sooner"
                  sub="Verified fit scores can accelerate your loan eligibility check."
                  cta="Check loan eligibility"
                />
              </>
            ) : (
              <>
                <ActionCard
                  icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  iconBg="#EDE9FE" iconColor="#5B21B6"
                  title="Talk to Jackie"
                  sub="Our AI advisor can help you explore programs that might be a stronger fit."
                  cta="Chat with Jackie"
                  primary
                />
                <ActionCard
                  icon="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  iconBg="#FEF3C7" iconColor="#92400E"
                  title="Improve your profile first"
                  sub="Work on the development areas above, then retake the assessment."
                  cta="View tips"
                />
              </>
            )}

            {/* Always show comparison */}
            <button
              onClick={() => router.push(`/marketplace/programs/${programId}/leaderboard?submissionId=${submissionId}`)}
              style={{
                width: '100%', padding: '14px 18px', borderRadius: 12,
                border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit'
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 9, background: '#F3F4F6', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: '#111827', margin: 0 }}>See how you compare</p>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>Compare your score with others who took this assessment</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <Link href={`/marketplace/programs/${programId}`} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: '#6B7280', textDecoration: 'none'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to {program.name}
          </Link>
          <Link href="/marketplace" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 13, color: '#4F46E5', textDecoration: 'none', fontWeight: 600
          }}>
            Browse more programs →
          </Link>
        </div>
      </div>
    </div>
  )
}

function ActionCard({
  icon, iconBg, iconColor, title, sub, cta, primary
}: {
  icon: string; iconBg: string; iconColor: string;
  title: string; sub: string; cta: string; primary?: boolean
}) {
  return (
    <button style={{
      width: '100%', padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
      border: primary ? 'none' : '1.5px solid #E5E7EB',
      background: primary ? '#111827' : '#fff',
      display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'inherit'
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9, background: primary ? 'rgba(255,255,255,0.12)' : iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={primary ? '#fff' : iconColor} strokeWidth="2">
          <path d={icon} />
        </svg>
      </div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: primary ? '#fff' : '#111827', margin: 0 }}>{title}</p>
        <p style={{ fontSize: 12, color: primary ? 'rgba(255,255,255,0.65)' : '#9CA3AF', margin: '2px 0 0' }}>{sub}</p>
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: primary ? 'rgba(255,255,255,0.7)' : '#6B7280', whiteSpace: 'nowrap' }}>
        {cta} →
      </span>
    </button>
  )
}
