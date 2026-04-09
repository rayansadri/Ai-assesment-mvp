'use client'

import type { IntegrityCheck } from '@/types'
import { AlertTriangle } from 'lucide-react'

export function IntegrityTab({ integrity_checks }: { integrity_checks: IntegrityCheck[] }) {
  if (integrity_checks.length === 0) {
    return (
      <div className="p-4 text-xs" style={{ color: 'var(--muted-faint)' }}>
        No integrity checks generated yet
      </div>
    )
  }

  return (
    <div className="space-y-2.5 p-4">
      {integrity_checks.map((check, i) => (
        <div
          key={i}
          className="rounded-lg p-3"
          style={{
            background: 'var(--surface-hover)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle
              size={12}
              className="flex-shrink-0 mt-0.5"
              style={{ color: '#F59E0B' }}
            />
            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              {check.name}
            </span>
          </div>
          <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>
            {check.description}
          </p>
          <div className="space-y-1.5">
            <div
              className="text-xs px-2 py-1.5 rounded"
              style={{
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.15)',
              }}
            >
              <span style={{ color: '#F59E0B', fontWeight: 500, fontSize: '10px' }}>Trigger: </span>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{check.trigger_condition}</span>
            </div>
            <div
              className="text-xs px-2 py-1.5 rounded"
              style={{
                background: 'rgba(79,110,247,0.06)',
                border: '1px solid rgba(79,110,247,0.15)',
              }}
            >
              <span style={{ color: '#4F6EF7', fontWeight: 500, fontSize: '10px' }}>Action: </span>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{check.response_action}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
