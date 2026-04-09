'use client'

import { PROMPT_LIBRARY } from '@/lib/prompts'
import type { PromptItem } from '@/types'

const CATEGORY_COLORS: Record<string, string> = {
  Analysis: '#4F6EF7',
  Generation: '#22C55E',
  Refinement: '#F59E0B',
}

interface PromptLibraryProps {
  onSelectPrompt: (text: string) => void
}

export function PromptLibrary({ onSelectPrompt }: PromptLibraryProps) {
  const categories = ['Analysis', 'Generation', 'Refinement'] as const

  return (
    <div className="space-y-3">
      {categories.map((category) => {
        const prompts = PROMPT_LIBRARY.filter((p) => p.category === category)
        const color = CATEGORY_COLORS[category]
        return (
          <div key={category}>
            <div
              className="text-xs font-medium px-3 mb-1"
              style={{ color, fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >
              {category}
            </div>
            <div className="space-y-0.5">
              {prompts.map((prompt: PromptItem) => (
                <button
                  key={prompt.id}
                  onClick={() => onSelectPrompt(prompt.text)}
                  className="w-full text-left px-3 py-1.5 rounded transition-colors"
                  style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '12px',
                    lineHeight: '1.4',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface-hover)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                  }}
                >
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
