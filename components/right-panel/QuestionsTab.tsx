'use client'

import type { Question } from '@/types'

const TYPE_STYLES: Record<string, { label: string; color: string }> = {
  behavioral: { label: 'Behavioral', color: '#4F6EF7' },
  situational: { label: 'Situational', color: '#22C55E' },
  technical: { label: 'Technical', color: '#F59E0B' },
  values: { label: 'Values', color: '#A855F7' },
}

export function QuestionsTab({ questions }: { questions: Question[] }) {
  if (questions.length === 0) {
    return (
      <div className="p-4 text-xs" style={{ color: 'var(--muted-faint)' }}>
        No questions generated yet
      </div>
    )
  }

  // Group by dimension
  const byDimension: Record<string, Question[]> = {}
  questions.forEach((q) => {
    if (!byDimension[q.dimension]) byDimension[q.dimension] = []
    byDimension[q.dimension].push(q)
  })

  return (
    <div className="space-y-4 p-4">
      {Object.entries(byDimension).map(([dimension, qs]) => (
        <div key={dimension}>
          <div
            className="text-xs font-medium mb-2 flex items-center gap-2"
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            {dimension}
            <span style={{ color: 'var(--muted-faint)', fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: '10px' }}>
              {qs.length} question{qs.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {qs.map((q, i) => {
              const typeStyle = TYPE_STYLES[q.type] || TYPE_STYLES.behavioral
              return (
                <div
                  key={q.id}
                  className="rounded-lg p-3"
                  style={{
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: `${typeStyle.color}15`,
                        color: typeStyle.color,
                        fontSize: '10px',
                      }}
                    >
                      {typeStyle.label}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted-faint)', fontFamily: 'var(--font-geist-mono)', fontSize: '10px' }}>
                      Q{i + 1}
                    </span>
                  </div>
                  <p className="text-sm mb-2" style={{ color: 'var(--foreground)', lineHeight: '1.5' }}>
                    {q.text}
                  </p>
                  {q.intent && (
                    <p className="text-xs mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: '1.4' }}>
                      Intent: {q.intent}
                    </p>
                  )}
                  {q.follow_up_notes && (
                    <div
                      className="text-xs px-2 py-1.5 rounded"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border-subtle)',
                        color: 'rgba(255,255,255,0.35)',
                        lineHeight: '1.5',
                        fontStyle: 'italic',
                      }}
                    >
                      {q.follow_up_notes}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
