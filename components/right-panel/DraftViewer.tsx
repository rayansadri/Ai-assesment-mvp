'use client'

import { useState } from 'react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { DimensionsTab } from './DimensionsTab'
import { QuestionsTab } from './QuestionsTab'
import { ScoringTab } from './ScoringTab'
import { IntegrityTab } from './IntegrityTab'
import { formatTime } from '@/lib/utils'
import { Save, CheckCircle } from 'lucide-react'

const TABS = ['Questions', 'Scoring', 'Integrity', 'Dimensions'] as const
type Tab = (typeof TABS)[number]

export function DraftViewer() {
  const { activeDraft, refreshDrafts } = useWorkspace()
  const [activeTab, setActiveTab] = useState<Tab>('Questions')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!activeDraft) return
    setSaving(true)
    try {
      await fetch(`/workspace/api/drafts/${activeDraft.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeDraft),
      })
      await refreshDrafts()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // silent fail for MVP
    } finally {
      setSaving(false)
    }
  }

  if (!activeDraft) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
        <div
          className="rounded-lg flex items-center justify-center"
          style={{
            width: '36px',
            height: '36px',
            background: 'var(--surface-hover)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '3px',
              border: '1.5px solid var(--muted-faint)',
            }}
          />
        </div>
        <div>
          <div
            className="text-sm mb-1"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            No draft yet
          </div>
          <div
            className="text-xs leading-relaxed"
            style={{ color: 'var(--muted-faint)', maxWidth: '200px' }}
          >
            Generate an assessment via chat to see it here
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Draft header */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
              {activeDraft.title}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted-subtle)' }}>
              {activeDraft.dimensions.length} dimensions · {activeDraft.questions.length} questions
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-all"
            style={{
              background: saved ? 'rgba(34,197,94,0.12)' : 'var(--surface-hover)',
              border: `1px solid ${saved ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
              color: saved ? '#22C55E' : 'rgba(255,255,255,0.6)',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saved ? <CheckCircle size={12} /> : <Save size={12} />}
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>

        {activeDraft.objective && (
          <p
            className="text-xs mt-1.5 leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            {activeDraft.objective}
          </p>
        )}

        <div className="text-xs mt-1" style={{ color: 'var(--muted-faint)', fontSize: '10px' }}>
          Updated {formatTime(activeDraft.updated_at)}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab
          const count =
            tab === 'Questions'
              ? activeDraft.questions.length
              : tab === 'Scoring'
              ? activeDraft.scoring_logic.length
              : tab === 'Integrity'
              ? activeDraft.integrity_checks.length
              : activeDraft.dimensions.length

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 text-xs transition-colors relative"
              style={{
                color: isActive ? 'var(--foreground)' : 'rgba(255,255,255,0.35)',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {tab}
              {count > 0 && (
                <span
                  className="ml-1"
                  style={{
                    fontSize: '10px',
                    color: isActive ? 'rgba(255,255,255,0.4)' : 'var(--muted-faint)',
                  }}
                >
                  {count}
                </span>
              )}
              {isActive && (
                <div
                  className="absolute bottom-0 left-2 right-2 rounded-t"
                  style={{ height: '1.5px', background: 'rgba(255,255,255,0.5)' }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'Questions' && <QuestionsTab questions={activeDraft.questions} />}
        {activeTab === 'Scoring' && <ScoringTab scoring_logic={activeDraft.scoring_logic} />}
        {activeTab === 'Integrity' && <IntegrityTab integrity_checks={activeDraft.integrity_checks} />}
        {activeTab === 'Dimensions' && <DimensionsTab dimensions={activeDraft.dimensions} />}
      </div>

      {/* Notes */}
      {activeDraft.notes && (
        <div
          className="flex-shrink-0 px-4 py-3 text-xs"
          style={{
            borderTop: '1px solid var(--border)',
            color: 'rgba(255,255,255,0.4)',
            lineHeight: '1.5',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 500, fontSize: '10px' }}>
            NOTES
          </span>
          <p className="mt-1">{activeDraft.notes}</p>
        </div>
      )}
    </div>
  )
}
