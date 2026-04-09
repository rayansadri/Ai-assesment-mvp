'use client'

import { DraftViewer } from '@/components/right-panel/DraftViewer'

export function RightPanel() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--muted-subtle)',
          }}
        >
          Assessment Draft
        </span>
      </div>

      {/* Draft viewer */}
      <div className="flex-1 overflow-hidden">
        <DraftViewer />
      </div>
    </div>
  )
}
