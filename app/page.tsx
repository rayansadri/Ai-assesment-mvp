'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0A0F1E',
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif',
    }}>
      {/* Top bar */}
      <header style={{
        height: 56, display: 'flex', alignItems: 'center',
        padding: '0 32px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/passagehq_logo.jpeg" alt="Passage" style={{ height: 30, width: 30, borderRadius: 7, objectFit: 'cover' }} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>Passage.</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <Link href="/marketplace" style={{
            height: 34, padding: '0 16px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
            color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500,
            display: 'flex', alignItems: 'center', textDecoration: 'none', gap: 6,
          }}>Browse programs</Link>
          <Link href="/admin" style={{
            height: 34, padding: '0 16px', borderRadius: 8,
            background: '#3451D1', border: '1px solid #3451D1',
            color: '#fff', fontSize: 13, fontWeight: 500,
            display: 'flex', alignItems: 'center', textDecoration: 'none', gap: 6,
          }}>Admin portal →</Link>
        </div>
      </header>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 48px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 20, marginBottom: 28,
          background: 'rgba(52,81,209,0.15)', border: '1px solid rgba(52,81,209,0.3)',
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#818CF8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>MVP — Assessment Platform</span>
        </div>

        <h1 style={{
          fontSize: 52, fontWeight: 800, color: '#fff',
          textAlign: 'center', lineHeight: 1.1, letterSpacing: '-0.03em',
          maxWidth: 640, marginBottom: 18,
        }}>
          The smarter way to<br />
          <span style={{ color: '#818CF8' }}>verify student fit</span>
        </h1>

        <p style={{
          fontSize: 17, color: 'rgba(255,255,255,0.5)', textAlign: 'center',
          maxWidth: 480, lineHeight: 1.65, marginBottom: 56,
        }}>
          Admins build AI-powered assessments in minutes. Students discover programs and prove their fit before applying.
        </p>

        {/* Two path cards */}
        <div style={{ display: 'flex', gap: 16, width: '100%', maxWidth: 680 }}>
          {/* Admin */}
          <Link href="/admin" style={{
            flex: 1, borderRadius: 16, padding: '28px 28px 24px',
            background: 'linear-gradient(135deg, #1a2b4a 0%, #0f1a2e 100%)',
            border: '1px solid rgba(52,81,209,0.3)',
            textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12,
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(52,81,209,0.25)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(52,81,209,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="1.8">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, marginBottom: 6, letterSpacing: '-0.01em' }}>Admin Portal</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.55 }}>
                Build AI assessments, publish to programs, review ranked student submissions.
              </div>
            </div>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Create assessments', 'AI generation', 'Student rankings'].map(t => (
                <span key={t} style={{
                  fontSize: 11, padding: '3px 9px', borderRadius: 20,
                  background: 'rgba(129,140,248,0.12)', color: '#818CF8',
                  fontWeight: 500, border: '1px solid rgba(129,140,248,0.2)',
                }}>{t}</span>
              ))}
            </div>
            <div style={{
              marginTop: 4, color: '#818CF8', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              Go to Admin →
            </div>
          </Link>

          {/* Student */}
          <Link href="/marketplace" style={{
            flex: 1, borderRadius: 16, padding: '28px 28px 24px',
            background: 'linear-gradient(135deg, #0f2a1a 0%, #0a1a10 100%)',
            border: '1px solid rgba(22,163,74,0.25)',
            textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12,
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(22,163,74,0.2)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(22,163,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="1.8">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, marginBottom: 6, letterSpacing: '-0.01em' }}>Student Marketplace</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.55 }}>
                Discover programs, take fit assessments, and stand out to admissions teams.
              </div>
            </div>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Browse programs', 'Fit score', 'Fast-track apply'].map(t => (
                <span key={t} style={{
                  fontSize: 11, padding: '3px 9px', borderRadius: 20,
                  background: 'rgba(74,222,128,0.1)', color: '#4ADE80',
                  fontWeight: 500, border: '1px solid rgba(74,222,128,0.2)',
                }}>{t}</span>
              ))}
            </div>
            <div style={{
              marginTop: 4, color: '#4ADE80', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              Browse programs →
            </div>
          </Link>
        </div>

        {/* Flow diagram */}
        <div style={{ marginTop: 56, display: 'flex', alignItems: 'center', gap: 0, opacity: 0.55 }}>
          {[
            { label: 'Admin creates', sub: 'AI assessment' },
            { label: 'Publishes to', sub: 'program page' },
            { label: 'Student takes', sub: 'fit check' },
            { label: 'Gets scored', sub: '& ranked' },
            { label: 'Admin reviews', sub: 'top candidates' },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', padding: '0 4px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>{step.label}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>{step.sub}</div>
              </div>
              {i < 4 && (
                <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.15)', margin: '0 4px', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 32px', borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Passage Assessment · MVP Demo</span>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link href="/admin" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Admin</Link>
          <Link href="/marketplace" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Marketplace</Link>
          <Link href="/assessments/new" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>New Assessment</Link>
        </div>
      </div>
    </div>
  )
}
