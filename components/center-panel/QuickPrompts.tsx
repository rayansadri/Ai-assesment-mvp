'use client'

import { Sparkles, FileSearch, RefreshCw, Shield } from 'lucide-react'

const QUICK_ACTIONS = [
  { icon: FileSearch, label: 'Parse policy', text: 'Parse the uploaded policy and identify the key evaluation criteria and dimensions' },
  { icon: Sparkles, label: 'Generate assessment', text: 'Generate a complete assessment draft based on the uploaded policy and team context' },
  { icon: RefreshCw, label: 'Improve questions', text: 'Review the current questions and improve them to be more behaviorally anchored and specific' },
  { icon: Shield, label: 'Integrity checks', text: 'Generate comprehensive integrity checks and anti-gaming measures for this assessment' },
]

interface QuickPromptsProps {
  onSelect: (text: string) => void
  disabled?: boolean
}

export function QuickPrompts({ onSelect, disabled }: QuickPromptsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon
        return (
          <button
            key={action.label}
            onClick={() => !disabled && onSelect(action.text)}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
            style={{
              background: 'var(--surface-hover)',
              border: '1px solid var(--border)',
              color: 'rgba(255,255,255,0.55)',
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.borderColor = 'rgba(79,110,247,0.4)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
            }}
          >
            <Icon size={12} />
            {action.label}
          </button>
        )
      })}
    </div>
  )
}
