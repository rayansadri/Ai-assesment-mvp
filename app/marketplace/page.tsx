'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PROGRAMS, CATEGORY_CONFIG, SCHOOLS, seedMarketplaceAssessments, seedDemoSubmissions, type Program } from '@/lib/programs'

// ─── Nav ──────────────────────────────────────────────────────────────────────
function MarketplaceNav() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: '#fff', borderBottom: '1px solid #E5E7EB',
      height: 56, display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16
    }}>
      <Link href="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
        <img src="/passagehq_logo.jpeg" alt="Passage" style={{ height: 28, width: 28, borderRadius: 6, objectFit: 'cover' }} />
        <span style={{ fontSize: 16, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>Passage.</span>
      </Link>

      <div style={{ flex: 1, maxWidth: 480, position: 'relative' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"
          style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          placeholder="What opportunity are you looking for?"
          style={{
            width: '100%', height: 36, paddingLeft: 36, paddingRight: 12,
            borderRadius: 20, border: '1px solid #E5E7EB', background: '#F9FAFB',
            fontSize: 13, color: '#111827', outline: 'none', fontFamily: 'inherit',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link href="/admin" style={{
          height: 34, padding: '0 14px', borderRadius: 20,
          border: '1px solid #E5E7EB', background: '#fff',
          fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none'
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
          </svg>
          Admin portal
        </Link>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', background: '#111827',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer'
        }}>
          S
        </div>
      </div>
    </nav>
  )
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────
function HeroBanner() {
  const cards = [
    {
      gradient: 'linear-gradient(145deg, #1E40AF 0%, #0891B2 100%)',
      eyebrow: 'Fit Assessment',
      heading: 'Verify your fit for a program',
      sub: 'Take a 15-minute check and know where you stand.',
      cta: 'Take a fit check',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      gradient: 'linear-gradient(145deg, #065F46 0%, #0F766E 100%)',
      eyebrow: 'Strong Fit',
      heading: 'Show strong fit and move faster',
      sub: 'High performers get priority in the admissions funnel.',
      cta: 'See how it works',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    },
    {
      gradient: 'linear-gradient(145deg, #6D28D9 0%, #4F46E5 100%)',
      eyebrow: 'Not sure?',
      heading: 'Not sure which program fits you?',
      sub: 'Browse by category or talk to Jackie, our AI advisor.',
      cta: 'Talk to Jackie',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, padding: '20px 24px 0' }}>
      {cards.map((card, i) => (
        <div key={i} style={{
          background: card.gradient, borderRadius: 14, padding: '22px 22px 20px',
          minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          overflow: 'hidden', position: 'relative', cursor: 'pointer'
        }}>
          {/* Decorative circle */}
          <div style={{
            position: 'absolute', right: -20, bottom: -20,
            width: 120, height: 120, borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)'
          }} />
          <div style={{
            position: 'absolute', right: 20, top: 16, opacity: 0.2
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d={card.icon} />
            </svg>
          </div>

          <div>
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6
            }}>
              {card.eyebrow}
            </span>
            <h3 style={{
              fontSize: 17, fontWeight: 700, color: '#fff',
              margin: 0, lineHeight: 1.3, letterSpacing: '-0.02em'
            }}>
              {card.heading}
            </h3>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', margin: '6px 0 0', lineHeight: 1.5 }}>
              {card.sub}
            </p>
          </div>
          <button style={{
            marginTop: 16, alignSelf: 'flex-start', height: 30, padding: '0 14px',
            borderRadius: 20, border: 'none', background: 'rgba(255,255,255,0.2)',
            color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            backdropFilter: 'blur(4px)'
          }}>
            {card.cta}
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── Schools Row ──────────────────────────────────────────────────────────────
function SchoolsRow() {
  return (
    <div style={{ padding: '24px 24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Our schools</span>
          <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 8 }}>Top Canadian schools that Passage partners with</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.75">
          <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
        </svg>
      </div>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {SCHOOLS.map(school => {
          const abbrev = school.split(' ').filter(w => !['College', 'of', 'and', 'the', 'Community'].includes(w)).map(w => w[0]).join('').slice(0, 3)
          return (
            <div key={school} style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7,
              padding: '6px 12px', borderRadius: 20, border: '1px solid #E5E7EB',
              background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap'
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6, background: '#F3F4F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: '#374151'
              }}>
                {abbrev}
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>
                {school.replace(' College', '').replace(' Polytechnic', '')}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Program Card ─────────────────────────────────────────────────────────────
function ProgramCard({ program }: { program: Program }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 178, flexShrink: 0, borderRadius: 12,
        border: `1px solid ${hovered ? '#D1D5DB' : '#E5E7EB'}`,
        background: '#fff', overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.15s', transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.09)' : '0 1px 3px rgba(0,0,0,0.04)'
      }}
    >
      {/* Image area */}
      <div style={{
        height: 110, position: 'relative', overflow: 'hidden',
        background: program.gradient
      }}>
        {/* Decorative icon */}
        <div style={{
          position: 'absolute', right: -8, bottom: -8, opacity: 0.15
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
            <path d={program.iconPath} />
          </svg>
        </div>

        {/* Badges row */}
        <div style={{ position: 'absolute', top: 7, left: 7, display: 'flex', gap: 4 }}>
          {program.loanAvailable && (
            <span style={{
              fontSize: 9, fontWeight: 700, color: '#fff',
              background: 'rgba(234,88,12,0.9)', padding: '2px 6px',
              borderRadius: 4, letterSpacing: '0.04em', backdropFilter: 'blur(4px)'
            }}>
              LOAN ✓
            </span>
          )}
          {program.hasAssessment && (
            <span style={{
              fontSize: 9, fontWeight: 700, color: '#fff',
              background: 'rgba(79,70,229,0.9)', padding: '2px 6px',
              borderRadius: 4, letterSpacing: '0.04em', backdropFilter: 'blur(4px)'
            }}>
              FIT CHECK
            </span>
          )}
        </div>

        {/* School badge */}
        <div style={{
          position: 'absolute', bottom: 7, left: 7,
          background: 'rgba(255,255,255,0.92)', borderRadius: 4, padding: '2px 7px',
          backdropFilter: 'blur(4px)'
        }}>
          <span style={{ fontSize: 9.5, fontWeight: 600, color: '#374151' }}>
            {program.school.replace(' College', '').replace(' Polytechnic', '')}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '10px 11px 12px' }}>
        <Link href={`/marketplace/programs/${program.id}`} style={{ textDecoration: 'none' }}>
          <p style={{
            fontSize: 12.5, fontWeight: 700, color: '#111827', margin: '0 0 4px',
            lineHeight: 1.35,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {program.name}
          </p>
        </Link>
        <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 1px', lineHeight: 1.4 }}>
          {program.school.replace(' College', ' C.')}
        </p>
        <p style={{ fontSize: 11, color: '#6B7280', margin: '0 0 1px', lineHeight: 1.4 }}>
          {program.credential}
        </p>
        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, lineHeight: 1.4 }}>
          {program.location.split(',')[1]?.trim() || program.location} · {program.duration}
        </p>

        {program.hasAssessment && (
          <Link href={`/marketplace/programs/${program.id}`} style={{ textDecoration: 'none' }}>
            <div style={{
              marginTop: 9, display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 600, color: '#4F46E5'
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Take fit check →
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── Program Row ──────────────────────────────────────────────────────────────
function ProgramRow({ categoryKey, label, description }: { categoryKey: string; label: string; description: string }) {
  let programs: Program[]
  if (categoryKey === 'trending') {
    programs = PROGRAMS.filter(p => p.trending)
  } else if (categoryKey === 'loan') {
    programs = PROGRAMS.filter(p => p.loanAvailable)
  } else {
    programs = PROGRAMS.filter(p => p.category === categoryKey)
  }

  if (programs.length === 0) return null

  return (
    <div style={{ padding: '24px 24px 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{label}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>{description}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {programs.map(program => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MarketplacePage() {
  useEffect(() => {
    seedMarketplaceAssessments()
    seedDemoSubmissions()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <MarketplaceNav />

      <main style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
        <HeroBanner />
        <SchoolsRow />

        {CATEGORY_CONFIG.map(cat => (
          <ProgramRow key={cat.key} categoryKey={cat.key} label={cat.label} description={cat.description} />
        ))}
      </main>

      {/* Bottom nav indicator */}
      <div style={{
        position: 'fixed', bottom: 20, right: 20,
        background: '#111827', borderRadius: '50%', width: 44, height: 44,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
    </div>
  )
}
