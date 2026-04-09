'use client'

import { useState } from 'react'
import { TeamsList } from '@/components/left-panel/TeamsList'
import { DraftsList } from '@/components/left-panel/DraftsList'
import { PromptLibrary } from '@/components/left-panel/PromptLibrary'
import { ChevronDown } from 'lucide-react'

interface LeftPanelProps {
  onPromptSelect?: (text: string) => void
}

function Section({
  label,
  children,
  defaultOpen = true,
}: {
  label: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 group"
      >
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--muted-subtle)',
          }}
        >
          {label}
        </span>
        <ChevronDown
          size={12}
          style={{
            color: 'var(--muted-faint)',
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.15s',
          }}
        />
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  )
}

// Store prompt callback globally so CenterPanel can register it
let _onPromptSelect: ((text: string) => void) | null = null
export function setPromptSelectHandler(fn: (text: string) => void) {
  _onPromptSelect = fn
}

export function LeftPanel() {
  return (
    <div className="flex flex-col h-full">
      {/* Logo / wordmark */}
      <div
        className="flex items-center px-4 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded"
            style={{
              width: '22px',
              height: '22px',
              background: '#4F6EF720',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                background: '#4F6EF7',
              }}
            />
          </div>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--foreground)',
              letterSpacing: '-0.01em',
            }}
          >
            Passage
          </span>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--muted-subtle)',
              fontWeight: 400,
            }}
          >
            Assessment
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        <Section label="Teams">
          <TeamsList />
        </Section>

        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '8px 12px' }} />

        <Section label="Drafts" defaultOpen={true}>
          <DraftsList />
        </Section>

        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '8px 12px' }} />

        <Section label="Prompt Library" defaultOpen={false}>
          <PromptLibrary
            onSelectPrompt={(text) => {
              if (_onPromptSelect) _onPromptSelect(text)
            }}
          />
        </Section>
      </div>
    </div>
  )
}
