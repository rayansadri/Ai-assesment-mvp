'use client'

import type { Dimension } from '@/types'

const IMPORTANCE_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: 'High', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  medium: { label: 'Medium', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  low: { label: 'Low', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
}

export function DimensionsTab({ dimensions }: { dimensions: Dimension[] }) {
  if (dimensions.length === 0) {
    return (
      <div className="p-4 text-xs" style={{ color: 'var(--muted-faint)' }}>
        No dimensions generated yet
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      {dimensions.map((dim, i) => {
        const style = IMPORTANCE_STYLES[dim.importance] || IMPORTANCE_STYLES.medium
        return (
          <div
            key={i}
            className="rounded-lg p-3"
            style={{
              background: 'var(--surface-hover)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--foreground)' }}
              >
                {dim.name}
              </span>
              <span
                className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: style.bg,
                  color: style.color,
                  fontSize: '10px',
                }}
              >
                {style.label}
              </span>
            </div>
            <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>
              {dim.description}
            </p>
            {dim.evidence_signals.length > 0 && (
              <div className="space-y-1">
                {dim.evidence_signals.map((signal, j) => (
                  <div key={j} className="flex items-start gap-1.5">
                    <span style={{ color: '#4F6EF7', fontSize: '10px', marginTop: '2px' }}>·</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: '1.4' }}>
                      {signal}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
