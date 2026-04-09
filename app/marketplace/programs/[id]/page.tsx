'use client'
import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getProgramById, seedMarketplaceAssessments } from '@/lib/programs'
import { useEffect } from 'react'

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const program = getProgramById(id)

  useEffect(() => {
    seedMarketplaceAssessments()
  }, [])

  if (!program) {
    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6B7280', fontSize: 15 }}>Program not found.</p>
          <Link href="/marketplace" style={{ color: '#4F46E5', fontSize: 13, marginTop: 8, display: 'block' }}>← Back to marketplace</Link>
        </div>
      </div>
    )
  }

  const infoItems = [
    { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'Intakes', value: program.intakes.join(', ') },
    { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Program length', value: program.duration },
    { icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', label: 'Credential', value: program.credential },
    { icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064', label: 'PGWP eligible', value: program.pgwpEligible ? 'Yes — post-graduation work permit' : 'Not eligible' },
    { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Tuition fee', value: program.tuition },
    { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Est. living costs', value: program.livingCosts },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#fff', borderBottom: '1px solid #E5E7EB',
        height: 52, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12
      }}>
        <Link href="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
          <img src="/passagehq_logo.jpeg" alt="Passage" style={{ height: 26, width: 26, borderRadius: 5, objectFit: 'cover' }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Passage.</span>
        </Link>
        <span style={{ color: '#D1D5DB' }}>›</span>
        <Link href="/marketplace" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }}>Programs</Link>
        <span style={{ color: '#D1D5DB' }}>›</span>
        <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{program.name}</span>
      </nav>

      {/* Hero */}
      <div style={{
        height: 280, background: program.gradient, position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />

        {/* Decorative background icon */}
        <div style={{ position: 'absolute', right: -40, top: -40, opacity: 0.08 }}>
          <svg width="280" height="280" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.5">
            <path d={program.iconPath} />
          </svg>
        </div>

        {/* School badge */}
        <div style={{
          position: 'absolute', bottom: 20, left: 24,
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
          borderRadius: 8, padding: '8px 14px', border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#111827'
          }}>
            {program.school.split(' ').filter(w => !['College', 'of', 'Polytechnic'].includes(w)).map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', margin: 0 }}>{program.school}</p>
            <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.75)', margin: 0 }}>📍 {program.location}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>

        {/* Partnership banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#F0F4FF', borderRadius: 12, padding: '14px 18px',
          marginTop: 24, border: '1px solid #C7D2FE'
        }}>
          <img src="/passagehq_logo.jpeg" alt="Passage" style={{ height: 28, width: 28, borderRadius: 6, objectFit: 'cover' }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#1E40AF' }}>
              {program.school} has partnered with Passage
            </span>
            <p style={{ fontSize: 12, color: '#3730A3', margin: '2px 0 0', lineHeight: 1.4 }}>
              to offer international student education financing and fit assessments for this program.
            </p>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginTop: 24 }}>
          {program.description}
        </p>

        {/* Info grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 12, marginTop: 24,
          background: '#F9FAFB', borderRadius: 14, padding: 20,
          border: '1px solid #E5E7EB'
        }}>
          {infoItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: '#fff',
                border: '1px solid #E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.75">
                  <path d={item.icon} />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{item.label}</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', margin: '2px 0 0' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Loan note */}
        {!program.loanAvailable && (
          <p style={{ fontSize: 12.5, color: '#D97706', marginTop: 14, background: '#FFFBEB', padding: '10px 14px', borderRadius: 8, border: '1px solid #FDE68A' }}>
            Passage does not currently offer a loan for this program.
          </p>
        )}

        {/* Fit Assessment section */}
        {program.hasAssessment && program.assessmentId ? (
          <div style={{
            marginTop: 28, border: '2px solid #4F46E5', borderRadius: 16, overflow: 'hidden'
          }}>
            <div style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>Fit Assessment Available</p>
                  <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.75)', margin: 0 }}>15–20 minutes · Free · No technical background needed</p>
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 24px', background: '#fff' }}>
              <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.6, margin: '0 0 16px' }}>
                This program uses a structured fit assessment to help the admissions team understand how you think, communicate, and handle real-world situations. Strong performance can help you move faster in the admissions process.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {[
                  { icon: '✓', text: 'Verify your fit for this program' },
                  { icon: '✓', text: 'Show strong fit and move faster in the funnel' },
                  { icon: '✓', text: 'Complete this to strengthen your application' },
                  { icon: '✓', text: 'Strong fit scores can accelerate loan review' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#4F46E5', fontWeight: 700 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, color: '#374151' }}>{item.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push(`/take/${program.assessmentId}?programId=${program.id}`)}
                style={{
                  width: '100%', height: 48, borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
                  color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: 'inherit', letterSpacing: '-0.01em'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Take Fit Check — {program.name}
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            marginTop: 28, background: '#F9FAFB', borderRadius: 14,
            padding: '20px 24px', border: '1px solid #E5E7EB'
          }}>
            <p style={{ fontSize: 13.5, color: '#6B7280', margin: 0 }}>
              No fit assessment is available for this program yet. You can still apply directly.
            </p>
          </div>
        )}

        {/* Intake selector */}
        <div style={{ marginTop: 28 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Select your intake</p>
          <div style={{ display: 'flex', gap: 10 }}>
            {program.intakes.map((intake, i) => (
              <div key={i} style={{
                flex: 1, padding: '12px 16px', borderRadius: 10,
                border: `1.5px solid ${i === 0 ? '#111827' : '#E5E7EB'}`,
                background: i === 0 ? '#111827' : '#fff', cursor: 'pointer'
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: i === 0 ? '#fff' : '#111827', margin: 0 }}>{intake}</p>
                <p style={{ fontSize: 11.5, color: i === 0 ? 'rgba(255,255,255,0.6)' : '#9CA3AF', margin: '2px 0 0' }}>
                  Starts in {intake.split(' ')[0]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button style={{
            flex: 1, height: 44, borderRadius: 10, border: 'none',
            background: '#111827', color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit'
          }}>
            Create application
          </button>
          <button style={{
            flex: 1, height: 44, borderRadius: 10,
            border: '1.5px solid #E5E7EB', background: '#fff',
            color: '#111827', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit'
          }}>
            Apply now
          </button>
        </div>

        {/* Other programs from same school */}
        <div style={{ marginTop: 40 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>
            {program.school} programs →
          </p>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>More from this school on Passage</p>
        </div>
      </div>
    </div>
  )
}
