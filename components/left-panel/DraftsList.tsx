'use client'

import { useWorkspace } from '@/context/WorkspaceContext'
import { formatTime } from '@/lib/utils'
import { FileText } from 'lucide-react'
import type { AssessmentDraft } from '@/types'

function DraftItem({
  draft,
  isActive,
  onClick,
}: {
  draft: AssessmentDraft
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-md transition-all"
      style={{
        background: isActive ? 'var(--surface-hover)' : 'transparent',
        border: isActive ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      <div className="flex items-start gap-2">
        <FileText
          size={13}
          className="flex-shrink-0 mt-0.5"
          style={{ color: isActive ? '#4F6EF7' : 'var(--muted-subtle)' }}
        />
        <div className="min-w-0">
          <div
            className="text-xs font-medium truncate"
            style={{ color: isActive ? 'var(--foreground)' : 'rgba(255,255,255,0.6)' }}
          >
            {draft.title}
          </div>
          <div
            className="text-xs mt-0.5"
            style={{ color: 'var(--muted-faint)', fontSize: '11px' }}
          >
            {draft.questions.length}q · {formatTime(draft.updated_at)}
          </div>
        </div>
      </div>
    </button>
  )
}

export function DraftsList() {
  const { savedDrafts, activeDraft, setActiveDraft, activeTeam, isLoadingDrafts } =
    useWorkspace()

  if (!activeTeam) {
    return (
      <div
        className="text-xs px-3 py-2"
        style={{ color: 'var(--muted-faint)' }}
      >
        Select a team to view drafts
      </div>
    )
  }

  if (isLoadingDrafts) {
    return (
      <div className="space-y-1">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-9 rounded-md animate-pulse"
            style={{ background: 'var(--surface-hover)' }}
          />
        ))}
      </div>
    )
  }

  if (savedDrafts.length === 0) {
    return (
      <div
        className="text-xs px-3 py-2"
        style={{ color: 'var(--muted-faint)' }}
      >
        No saved drafts yet
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      {savedDrafts.map((draft) => (
        <DraftItem
          key={draft.id}
          draft={draft}
          isActive={activeDraft?.id === draft.id}
          onClick={() => setActiveDraft(draft)}
        />
      ))}
    </div>
  )
}
