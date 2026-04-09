'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { MODULES, CATEGORIES, CATEGORY_COLORS, type AssessmentModule, type ModuleCategory } from '../../../../lib/modules'
import { STARTER_PACKS, PROGRAM_FAMILIES, type StarterPack, type ProgramFamily } from '../../../../lib/starter-packs'

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICONS: Record<string, string> = {
  video:     'M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z',
  text:      'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  scenario:  'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7',
  mc:        'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  doc:       'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  code:      'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  collab:    'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  analytics: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
}

// ─── Module → program family + skill dimension mapping ─────────────────────────
const MODULE_META: Record<string, { programFamilies: ProgramFamily[] | 'all'; skillDimension: string }> = {
  'mod-video-comm':       { programFamilies: 'all', skillDimension: 'Communication' },
  'mod-ethical-reasoning':{ programFamilies: 'all', skillDimension: 'Ethics' },
  'mod-scenario-pressure':{ programFamilies: ['business', 'trades', 'general'], skillDimension: 'Ethics' },
  'mod-mc-logic':         { programFamilies: 'all', skillDimension: 'Analytics' },
  'mod-doc-verify':       { programFamilies: ['healthcare', 'business'], skillDimension: 'Technical' },
  'mod-tech-coding':      { programFamilies: ['stem'], skillDimension: 'Technical' },
  'mod-collab-group':     { programFamilies: ['business', 'general'], skillDimension: 'Communication' },
  'mod-mc-verbal':        { programFamilies: 'all', skillDimension: 'Analytics' },
  'mod-case-business':    { programFamilies: ['business', 'stem'], skillDimension: 'Analytics' },
  'mod-video-situational':{ programFamilies: ['healthcare', 'trades', 'general'], skillDimension: 'Ethics' },
  'mod-analytics-data':   { programFamilies: ['stem', 'business'], skillDimension: 'Analytics' },
  'mod-opentext-motivation':{ programFamilies: 'all', skillDimension: 'Motivation' },
}

const SKILL_DIMENSIONS = ['All Skills', 'Communication', 'Critical Thinking', 'Motivation', 'Ethics', 'Professionalism', 'Analytics', 'Technical', 'Grit']

// ─── Sidebar ──────────────────────────────────────────────────────────────────
type NavId = 'home' | 'library' | 'analytics'

function Sidebar({ active, onNav, id }: { active: NavId; onNav: (n: NavId) => void; id: string }) {
  const router = useRouter()
  const sb = (a: number) => `rgba(255,255,255,${a})`

  const navItems: { id: NavId; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'library', label: 'Library', icon: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 016.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z' },
    { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ]

  return (
    <div style={{
      width: 220, flexShrink: 0, background: 'var(--sb-bg)', display: 'flex',
      flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'sticky', top: 0
    }}>
      {/* Brand */}
      <div style={{ padding: '22px 18px 20px', borderBottom: `1px solid ${sb(0.08)}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: sb(0.9), letterSpacing: '-0.01em' }}>Passage</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: sb(0.4), letterSpacing: '0.08em', textTransform: 'uppercase' }}>Assessment</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '14px 10px', flex: 1, overflowY: 'auto' }}>
        {navItems.map(item => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: isActive ? sb(0.12) : 'transparent',
                color: isActive ? sb(0.9) : sb(0.5),
                fontSize: 13, fontWeight: isActive ? 500 : 400, marginBottom: 2,
                transition: 'background 0.12s, color 0.12s'
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = sb(0.06); e.currentTarget.style.color = sb(0.75) } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = sb(0.5) } }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d={item.icon} />
              </svg>
              {item.label}
            </button>
          )
        })}

        <div style={{ marginTop: 12, borderTop: `1px solid ${sb(0.08)}`, paddingTop: 12 }}>
          <button
            onClick={() => router.push('/assessments/new')}
            style={{
              width: '100%', padding: '9px 12px', borderRadius: 7, border: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Assessment
          </button>
        </div>
      </nav>

      {/* Bottom */}
      <div style={{ padding: '14px 10px', borderTop: `1px solid ${sb(0.08)}` }}>
        {[
          { label: 'Support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
          { label: 'Settings', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zm0 0v3m0-9V6m4.22 8.22l2.12 2.12M5.64 9.64L3.52 7.52M18.36 9.64l2.12-2.12M5.64 14.36L3.52 16.48' },
        ].map(item => (
          <button key={item.label} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
            background: 'transparent', color: sb(0.45), fontSize: 13, marginBottom: 2,
            transition: 'background 0.12s'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = sb(0.06); e.currentTarget.style.color = sb(0.7) }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = sb(0.45) }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Starter Pack Card ────────────────────────────────────────────────────────
function StarterPackCard({
  pack,
  id,
  onUsePack,
}: {
  pack: StarterPack
  id: string
  onUsePack: (pack: StarterPack) => void
}) {
  const family = PROGRAM_FAMILIES.find(f => f.id === pack.programFamily)
  const diffColor = pack.difficulty === 'Easy' ? '#16A34A' : pack.difficulty === 'Moderate' ? '#D97706' : '#DC2626'
  const diffBg = pack.difficulty === 'Easy' ? '#F0FDF4' : pack.difficulty === 'Moderate' ? '#FFFBEB' : '#FEF2F2'
  const router = useRouter()

  const applyPackAndGo = (pack: StarterPack, destination: string) => {
    onUsePack(pack)
    setTimeout(() => router.push(destination), 50)
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1px solid var(--border, #E5E7EB)',
      padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'box-shadow 0.15s'
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)')}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: `${family?.color ?? '#6B7280'}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={family?.color ?? '#6B7280'} strokeWidth="1.75">
            <path d={family?.icon ?? ''} />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{
              fontSize: 10.5, fontWeight: 700, color: family?.color ?? '#6B7280',
              letterSpacing: '0.04em', textTransform: 'uppercase'
            }}>
              {family?.label ?? pack.programFamily}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
              background: diffBg, color: diffColor
            }}>
              {pack.difficulty}
            </span>
          </div>
          <h3 style={{
            fontSize: 13.5, fontWeight: 700, color: '#111827', margin: 0,
            lineHeight: 1.35, letterSpacing: '-0.01em'
          }}>
            {pack.name}
          </h3>
        </div>
      </div>

      {/* Skill badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {pack.skillFocus.map(skill => (
          <span key={skill} style={{
            fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 5,
            background: '#F3F4F6', color: '#374151'
          }}>
            {skill}
          </span>
        ))}
      </div>

      {/* Description */}
      <p style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
        {pack.description}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        <span style={{ fontSize: 11.5, color: '#9CA3AF' }}>{pack.estimatedDuration}</span>
        <span style={{ fontSize: 11.5, color: '#D1D5DB' }}>·</span>
        <span style={{ fontSize: 11.5, color: '#9CA3AF' }}>{pack.blocks.filter(b => b.type !== 'scoring-rule' && b.type !== 'intro').length} questions</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 7, marginTop: 2 }}>
        <button
          onClick={() => {
            onUsePack(pack)
            setTimeout(() => window.open(`/take/${id}?preview=true`, '_blank'), 50)
          }}
          style={{
            flex: 1, padding: '7px 0', borderRadius: 7,
            border: '1px solid var(--border2, #D1D5DB)', background: '#fff',
            color: '#374151', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.12s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
        >
          Preview
        </button>
        <button
          onClick={() => applyPackAndGo(pack, `/assessments/${id}/builder`)}
          style={{
            flex: 1, padding: '7px 0', borderRadius: 7,
            border: `1px solid ${family?.color ?? '#6B7280'}40`, background: `${family?.color ?? '#6B7280'}08`,
            color: family?.color ?? '#6B7280', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.12s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${family?.color ?? '#6B7280'}14` }}
          onMouseLeave={e => { e.currentTarget.style.background = `${family?.color ?? '#6B7280'}08` }}
        >
          Edit in Builder
        </button>
        <button
          onClick={() => applyPackAndGo(pack, `/assessments/${id}/builder`)}
          style={{
            flex: '1.4', padding: '7px 0', borderRadius: 7,
            border: 'none', background: 'var(--accent, #3451D1)',
            color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            transition: 'background 0.12s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover, #2C46C0)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent, #3451D1)' }}
        >
          Use this Pack →
        </button>
      </div>
    </div>
  )
}

// ─── Module Card ──────────────────────────────────────────────────────────────
function ModuleCard({
  mod, added, onAdd, onRemove
}: {
  mod: AssessmentModule
  added: boolean
  onAdd: () => void
  onRemove: () => void
}) {
  const cat = CATEGORY_COLORS[mod.category]

  return (
    <div
      style={{
        background: '#fff', borderRadius: 12, border: `1px solid ${added ? 'var(--accent)' : 'var(--border, #E5E7EB)'}`,
        boxShadow: added ? '0 0 0 1px var(--accent), 0 1px 4px rgba(0,0,0,0.06)' : '0 1px 4px rgba(0,0,0,0.05)',
        padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
        transition: 'border-color 0.15s, box-shadow 0.15s', position: 'relative'
      }}
    >
      {mod.isPremium && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
          padding: '2px 6px', borderRadius: 4,
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          color: '#fff', textTransform: 'uppercase'
        }}>
          Premium
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 9, background: cat.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cat.text} strokeWidth="1.75">
            <path d={ICONS[mod.icon]} />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', padding: '2px 7px', borderRadius: 5,
            background: cat.bg, color: cat.text, fontSize: 10, fontWeight: 600,
            letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4
          }}>
            {mod.category}
          </div>
          <h3 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text, #111827)', lineHeight: 1.35, paddingRight: mod.isPremium ? 60 : 0 }}>
            {mod.name}
          </h3>
        </div>
      </div>

      <p style={{ fontSize: 12.5, color: 'var(--text2, #6B7280)', lineHeight: 1.6, flex: 1 }}>
        {mod.description}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text3, #9CA3AF)" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <span style={{ fontSize: 11, color: 'var(--text3, #9CA3AF)' }}>{mod.duration}</span>
          <span style={{ fontSize: 11, color: 'var(--border2, #D1D5DB)' }}>·</span>
          <span style={{ fontSize: 11, color: 'var(--text3, #9CA3AF)' }}>{mod.format}</span>
        </div>

        {added ? (
          <button
            onClick={onRemove}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 7, border: '1px solid var(--accent)',
              background: 'var(--accent-light, rgba(52,81,209,0.07))', color: 'var(--accent, #3451D1)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEECEC'; e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#EF4444' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-light, rgba(52,81,209,0.07))'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Added ✓
          </button>
        ) : (
          <button
            onClick={onAdd}
            style={{
              padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border2, #D1D5DB)',
              background: '#fff', color: 'var(--text, #111827)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent, #3451D1)'; e.currentTarget.style.borderColor = 'var(--accent, #3451D1)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'var(--border2, #D1D5DB)'; e.currentTarget.style.color = 'var(--text, #111827)' }}
          >
            Add
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Program Family Filter Pill ───────────────────────────────────────────────
function FamilyPill({
  family,
  label,
  color,
  icon,
  count,
  active,
  onClick,
}: {
  family: string
  label: string
  color: string
  icon: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none',
        background: active ? `${color}12` : 'transparent',
        cursor: 'pointer', textAlign: 'left', marginBottom: 2,
        transition: 'background 0.1s',
        borderLeft: `3px solid ${active ? color : 'transparent'}`
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={active ? color : '#9CA3AF'} strokeWidth="1.75">
        <path d={icon} />
      </svg>
      <span style={{ flex: 1, fontSize: 12.5, fontWeight: active ? 600 : 400, color: active ? color : '#374151' }}>
        {label}
      </span>
      <span style={{
        fontSize: 10.5, fontWeight: 600, padding: '1px 6px', borderRadius: 10,
        background: active ? `${color}18` : '#F3F4F6',
        color: active ? color : '#9CA3AF'
      }}>
        {count}
      </span>
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ModulesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [nav, setNav] = useState<NavId>('library')
  const [activeTab, setActiveTab] = useState<'packs' | 'modules'>('packs')
  const [familyFilter, setFamilyFilter] = useState<ProgramFamily | 'all'>('all')
  const [skillFilter, setSkillFilter] = useState('All Skills')
  const [search, setSearch] = useState('')
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [assessment, setAssessment] = useState<{ name: string; programLabel: string } | null>(null)
  const [moduleAddedFlash, setModuleAddedFlash] = useState<string | null>(null)
  const [publishSaved, setPublishSaved] = useState(false)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('pa-assessments') || '[]')
      const found = stored.find((a: { id: string }) => a.id === id)
      if (found) setAssessment({ name: found.name, programLabel: found.programLabel })
    } catch {}
  }, [id])

  // ── Starter Packs logic ──
  const filteredPacks = STARTER_PACKS.filter(pack =>
    familyFilter === 'all' || pack.programFamily === familyFilter
  )

  const packCountByFamily = (fam: ProgramFamily | 'all') =>
    fam === 'all' ? STARTER_PACKS.length : STARTER_PACKS.filter(p => p.programFamily === fam).length

  const applyPack = (pack: StarterPack) => {
    try {
      const stored = JSON.parse(localStorage.getItem('pa-assessments') || '[]')
      const idx = stored.findIndex((a: { id: string }) => a.id === id)
      if (idx !== -1) {
        stored[idx].builderBlocks = pack.blocks
        stored[idx].name = stored[idx].name || pack.name
      } else {
        stored.push({ id, name: pack.name, programLabel: '', builderBlocks: pack.blocks })
      }
      localStorage.setItem('pa-assessments', JSON.stringify(stored))
    } catch {}
  }

  // ── Modules logic ──
  const filteredModules = MODULES.filter(mod => {
    const meta = MODULE_META[mod.id]
    const matchFamily = familyFilter === 'all' || !meta || meta.programFamilies === 'all' ||
      (Array.isArray(meta.programFamilies) && meta.programFamilies.includes(familyFilter))
    const matchSkill = skillFilter === 'All Skills' || (meta && meta.skillDimension === skillFilter)
    const q = search.toLowerCase()
    const matchSearch = !q || mod.name.toLowerCase().includes(q) || mod.description.toLowerCase().includes(q) || mod.category.toLowerCase().includes(q)
    return matchFamily && matchSkill && matchSearch
  })

  const moduleCountByFamily = (fam: ProgramFamily | 'all') => {
    if (fam === 'all') return MODULES.length
    return MODULES.filter(mod => {
      const meta = MODULE_META[mod.id]
      return !meta || meta.programFamilies === 'all' ||
        (Array.isArray(meta.programFamilies) && meta.programFamilies.includes(fam))
    }).length
  }

  const addModuleToAssessment = (mod: AssessmentModule) => {
    try {
      const stored = JSON.parse(localStorage.getItem('pa-assessments') || '[]')
      const idx = stored.findIndex((a: { id: string }) => a.id === id)
      const newBlock = {
        id: `mod-${mod.id}-${Date.now()}`,
        type: mod.format.toLowerCase().includes('video') ? 'video' :
              mod.format.toLowerCase().includes('multiple') ? 'multiple-choice' :
              mod.format.toLowerCase().includes('scenario') ? 'scenario' :
              mod.format.toLowerCase().includes('case') ? 'case-study' :
              mod.format.toLowerCase().includes('coding') ? 'open-text' :
              mod.format.toLowerCase().includes('upload') ? 'document-check' :
              'open-text',
        cfg: { question: mod.name, label: mod.name, text: mod.description }
      }
      if (idx !== -1) {
        stored[idx].builderBlocks = [...(stored[idx].builderBlocks || []), newBlock]
        localStorage.setItem('pa-assessments', JSON.stringify(stored))
        setAddedIds(prev => new Set([...prev, mod.id]))
        setModuleAddedFlash(mod.id)
        setTimeout(() => setModuleAddedFlash(null), 2000)
      }
    } catch {}
  }

  const removeModule = (modId: string) => {
    setAddedIds(prev => { const n = new Set(prev); n.delete(modId); return n })
  }

  const handlePublish = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('pa-assessments') || '[]')
      const idx = stored.findIndex((a: { id: string }) => a.id === id)
      if (idx !== -1) {
        stored[idx].published = true
        localStorage.setItem('pa-assessments', JSON.stringify(stored))
      }
    } catch {}
    setPublishSaved(true)
    setTimeout(() => setPublishSaved(false), 2000)
  }

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 20px', borderRadius: 8, border: 'none',
    background: active ? '#fff' : 'transparent',
    color: active ? 'var(--text, #111827)' : 'var(--text2, #6B7280)',
    fontSize: 13, fontWeight: active ? 600 : 400,
    cursor: 'pointer',
    boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
    transition: 'all 0.12s'
  })

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg, #F6F7F9)' }}>
      <Sidebar active={nav} onNav={setNav} id={id} />

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Topbar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', height: 56, background: '#fff', borderBottom: '1px solid var(--border, #E5E7EB)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => router.push(`/assessments/${id}/builder`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border, #E5E7EB)',
                background: 'transparent', color: 'var(--text2, #6B7280)', fontSize: 12,
                cursor: 'pointer', transition: 'background 0.12s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg, #F6F7F9)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
              Builder
            </button>
            <span style={{ color: 'var(--border2, #D1D5DB)', fontSize: 14 }}>/</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text, #111827)' }}>
              {assessment?.name || 'Assessment'}
            </span>
            {assessment?.programLabel && (
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 5,
                background: 'var(--accent-light, rgba(52,81,209,0.08))', color: 'var(--accent, #3451D1)', fontWeight: 500
              }}>
                {assessment.programLabel.split(' — ')[0]}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => window.open(`/take/${id}?preview=true`, '_blank')}
              style={{
                padding: '7px 16px', borderRadius: 7, border: '1px solid var(--border2, #D1D5DB)',
                background: 'transparent', color: 'var(--text2, #6B7280)', fontSize: 13, cursor: 'pointer'
              }}
            >
              Preview
            </button>
            <button
              onClick={handlePublish}
              style={{
                padding: '7px 20px', borderRadius: 7, border: 'none',
                background: publishSaved ? '#16A34A' : 'var(--accent, #3451D1)', color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              {publishSaved && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {publishSaved ? 'Published!' : 'Publish'}
            </button>
          </div>
        </div>

        {/* ── Body layout ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ── Left filter panel ── */}
          <div style={{
            width: 210, flexShrink: 0, borderRight: '1px solid var(--border, #E5E7EB)',
            background: '#fff', padding: '20px 14px', overflowY: 'auto'
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 10px 4px' }}>
              Program Family
            </p>
            <FamilyPill
              family="all"
              label="All Programs"
              color="#6B7280"
              icon="M4 6h16M4 10h16M4 14h16M4 18h16"
              count={activeTab === 'packs' ? STARTER_PACKS.length : MODULES.length}
              active={familyFilter === 'all'}
              onClick={() => setFamilyFilter('all')}
            />
            {PROGRAM_FAMILIES.map(fam => (
              <FamilyPill
                key={fam.id}
                family={fam.id}
                label={fam.label}
                color={fam.color}
                icon={fam.icon}
                count={activeTab === 'packs' ? packCountByFamily(fam.id) : moduleCountByFamily(fam.id)}
                active={familyFilter === fam.id}
                onClick={() => setFamilyFilter(fam.id)}
              />
            ))}

            {/* Skill dimension filter (modules tab only) */}
            {activeTab === 'modules' && (
              <>
                <div style={{ borderTop: '1px solid var(--border, #E5E7EB)', margin: '16px 0 14px' }} />
                <p style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 10px 4px' }}>
                  Skill Dimension
                </p>
                {SKILL_DIMENSIONS.map(skill => (
                  <button
                    key={skill}
                    onClick={() => setSkillFilter(skill)}
                    style={{
                      display: 'block', width: '100%', padding: '7px 12px', borderRadius: 7, border: 'none',
                      background: skillFilter === skill ? 'rgba(52,81,209,0.08)' : 'transparent',
                      color: skillFilter === skill ? 'var(--accent, #3451D1)' : '#374151',
                      fontSize: 12.5, fontWeight: skillFilter === skill ? 600 : 400,
                      cursor: 'pointer', textAlign: 'left', marginBottom: 1,
                      transition: 'background 0.1s'
                    }}
                  >
                    {skill}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* ── Main content ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 48px' }}>

            {/* Page header + tabs */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text, #111827)', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
                    {activeTab === 'packs' ? 'Starter Packs' : 'Module Library'}
                  </h1>
                  <p style={{ fontSize: 13.5, color: 'var(--text2, #6B7280)', margin: 0, lineHeight: 1.5 }}>
                    {activeTab === 'packs'
                      ? 'Begin with a pre-built assessment designed for your program.'
                      : 'Add individual modules to build high-precision candidate assessments.'}
                  </p>
                </div>
                <div style={{
                  display: 'flex', gap: 1, padding: 3, borderRadius: 10,
                  background: '#F3F4F6', flexShrink: 0
                }}>
                  <button style={tabBtnStyle(activeTab === 'packs')} onClick={() => setActiveTab('packs')}>
                    Starter Packs
                    <span style={{
                      marginLeft: 6, fontSize: 10.5, fontWeight: 700,
                      padding: '1px 5px', borderRadius: 4,
                      background: activeTab === 'packs' ? 'var(--accent, #3451D1)' : '#D1D5DB',
                      color: activeTab === 'packs' ? '#fff' : '#6B7280'
                    }}>
                      {STARTER_PACKS.length}
                    </span>
                  </button>
                  <button style={tabBtnStyle(activeTab === 'modules')} onClick={() => setActiveTab('modules')}>
                    Modules
                    <span style={{
                      marginLeft: 6, fontSize: 10.5, fontWeight: 700,
                      padding: '1px 5px', borderRadius: 4,
                      background: activeTab === 'modules' ? 'var(--accent, #3451D1)' : '#D1D5DB',
                      color: activeTab === 'modules' ? '#fff' : '#6B7280'
                    }}>
                      {MODULES.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* Search (modules tab) */}
              {activeTab === 'modules' && (
                <div style={{ position: 'relative', maxWidth: 340 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3, #9CA3AF)', pointerEvents: 'none' }}>
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search modules..."
                    style={{
                      width: '100%', paddingLeft: 34, paddingRight: 14, paddingTop: 8, paddingBottom: 8,
                      borderRadius: 8, border: '1px solid var(--border2, #D1D5DB)', fontSize: 13,
                      outline: 'none', color: 'var(--text, #111827)', background: '#fff',
                      transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box'
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--accent, #3451D1)'; e.target.style.boxShadow = '0 0 0 3px rgba(52,81,209,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border2, #D1D5DB)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              )}
            </div>

            {/* ── Starter Packs Grid ── */}
            {activeTab === 'packs' && (
              <>
                {filteredPacks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3, #9CA3AF)' }}>
                    <p style={{ fontSize: 15, marginBottom: 6 }}>No packs for this program</p>
                    <p style={{ fontSize: 13 }}>Try selecting a different program family</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 16
                  }}>
                    {filteredPacks.map(pack => (
                      <StarterPackCard
                        key={pack.id}
                        pack={pack}
                        id={id}
                        onUsePack={applyPack}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── Modules Grid ── */}
            {activeTab === 'modules' && (
              <>
                {filteredModules.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3, #9CA3AF)' }}>
                    <p style={{ fontSize: 15, marginBottom: 6 }}>No modules match your filters</p>
                    <p style={{ fontSize: 13 }}>Try adjusting the skill or program filter</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 16
                  }}>
                    {filteredModules.map(mod => (
                      <ModuleCard
                        key={mod.id}
                        mod={mod}
                        added={addedIds.has(mod.id) || moduleAddedFlash === mod.id}
                        onAdd={() => addModuleToAssessment(mod)}
                        onRemove={() => removeModule(mod.id)}
                      />
                    ))}
                    {/* Request Module Card */}
                    <div style={{
                      background: 'var(--bg, #F6F7F9)', borderRadius: 12, border: '1px dashed var(--border2, #D1D5DB)',
                      padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', gap: 10, minHeight: 180, textAlign: 'center'
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 9, background: '#fff', border: '1px solid var(--border2, #D1D5DB)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3, #9CA3AF)" strokeWidth="1.75">
                          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text, #111827)', marginBottom: 4 }}>Request New Module</p>
                        <p style={{ fontSize: 12, color: 'var(--text3, #9CA3AF)', lineHeight: 1.5 }}>
                          Can&apos;t find what you need?<br />Our team can build custom blocks.
                        </p>
                      </div>
                      <button style={{
                        padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border2, #D1D5DB)',
                        background: '#fff', color: 'var(--accent, #3451D1)', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.15s'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent, #3451D1)'; e.currentTarget.style.borderColor = 'var(--accent, #3451D1)'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'var(--border2, #D1D5DB)'; e.currentTarget.style.color = 'var(--accent, #3451D1)' }}
                      >
                        Contact Solutions
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
