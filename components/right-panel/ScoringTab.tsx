'use client'

import type { ScoringRule } from '@/types'

const SCORE_STYLES = {
  1: { label: '1 — Insufficient', color: '#EF4444', bg: 'rgba(239,68,68,0.06)' },
  3: { label: '3 — Adequate', color: '#F59E0B', bg: 'rgba(245,158,11,0.06)' },
  5: { label: '5 — Exceptional', color: '#22C55E', bg: 'rgba(34,197,94,0.06)' },
}

export function ScoringTab({ scoring_logic }: { scoring_logic: ScoringRule[] }) {
  if (scoring_logic.length === 0) {
    return (
      <div className="p-4 text-xs" style={{ color: 'var(--muted-faint)' }}>
        No scoring logic generated yet
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {scoring_logic.map((rule, i) => (
        <div
          key={i}
          className="rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          <div
            className="px-3 py-2"
            style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}
          >
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--foreground)' }}
            >
              {rule.dimension}
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {([1, 3, 5] as const).map((score) => {
              const style = SCORE_STYLES[score]
              const definition =
                score === 1
                  ? rule.score_1_definition
                  : score === 3
                  ? rule.score_3_definition
                  : rule.score_5_definition
              return (
                <div
                  key={score}
                  className="px-3 py-2.5"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <div
                    className="text-xs font-medium mb-1"
                    style={{ color: style.color, fontSize: '10px' }}
                  >
                    {style.label}
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>
                    {definition}
                  </p>
                </div>
              )
            })}
            {rule.required_evidence && (
              <div
                className="px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border-subtle)' }}
              >
                <span className="text-xs" style={{ color: '#4F6EF7', fontSize: '10px', fontWeight: 500 }}>
                  Required evidence:{' '}
                </span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {rule.required_evidence}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
