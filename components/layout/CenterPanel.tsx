'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useChat } from '@/hooks/useChat'
import { ChatMessage, StreamingMessage } from '@/components/center-panel/ChatMessage'
import { ChatInput } from '@/components/center-panel/ChatInput'
import { QuickPrompts } from '@/components/center-panel/QuickPrompts'
import { setPromptSelectHandler } from '@/components/layout/LeftPanel'
import { Upload, FileText, X } from 'lucide-react'
import type { AssessmentDraft, PolicyDocument } from '@/types'

function UploadedDocBadge({
  doc,
  onRemove,
}: {
  doc: PolicyDocument
  onRemove?: () => void
}) {
  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
      style={{
        background: 'rgba(79,110,247,0.1)',
        border: '1px solid rgba(79,110,247,0.25)',
        color: '#4F6EF7',
      }}
    >
      <FileText size={10} />
      <span className="max-w-[140px] truncate">{doc.title}</span>
    </div>
  )
}

function EmptyChatState({ teamName }: { teamName: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: '40px',
          height: '40px',
          background: 'var(--surface-hover)',
          border: '1px solid var(--border)',
        }}
      >
        <Upload size={18} style={{ color: 'var(--muted-subtle)' }} />
      </div>
      <div>
        <div
          className="text-sm font-medium mb-1"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          {teamName} workspace ready
        </div>
        <div
          className="text-xs leading-relaxed"
          style={{ color: 'var(--muted-faint)', maxWidth: '280px' }}
        >
          Upload a policy document or start chatting to generate an assessment draft
        </div>
      </div>
    </div>
  )
}

function NoTeamState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 px-8 text-center">
      <div
        className="text-sm"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        Select a team from the left panel to get started
      </div>
    </div>
  )
}

export function CenterPanel() {
  const { activeTeam, activeDraft, setActiveDraft, uploadedDocs, addDoc } = useWorkspace()
  const [inputValue, setInputValue] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const handleDraftUpdated = useCallback(
    (draft: AssessmentDraft) => {
      setActiveDraft(draft)
    },
    [setActiveDraft]
  )

  const { messages, streamingContent, isStreaming, sendMessage, addSystemMessage } = useChat({
    teamId: activeTeam?.id,
    draftId: activeDraft?.id,
    onDraftUpdated: handleDraftUpdated,
  })

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // Register prompt select handler for LeftPanel
  useEffect(() => {
    setPromptSelectHandler((text) => {
      setInputValue(text)
    })
  }, [])

  const handleSend = useCallback(
    async (text: string) => {
      setInputValue('')
      await sendMessage(text)
    },
    [sendMessage]
  )

  const handleUpload = useCallback(
    async (file: File) => {
      if (!activeTeam) return
      const formData = new FormData()
      formData.append('file', file)
      formData.append('teamId', activeTeam.id)

      try {
        const res = await fetch('/workspace/api/upload', {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        if (data.success) {
          const doc: PolicyDocument = {
            id: data.document.id,
            team_id: data.document.team_id,
            title: data.document.title,
            raw_text: '',
            uploaded_at: data.document.uploaded_at,
          }
          addDoc(doc)
          addSystemMessage(
            `Policy document "${data.document.title}" uploaded. I can now analyze it — try "Parse the uploaded policy" to get started.`
          )
        }
      } catch {
        addSystemMessage('Failed to upload document. Please try again.')
      }
    },
    [activeTeam, addDoc, addSystemMessage]
  )

  const teamDocs = uploadedDocs.filter((d) => d.team_id === activeTeam?.id)

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div>
            <span
              className="text-sm font-medium"
              style={{ color: activeTeam ? 'var(--foreground)' : 'var(--muted-subtle)' }}
            >
              {activeTeam ? activeTeam.name : 'No team selected'}
            </span>
            {activeDraft && (
              <span
                className="ml-2 text-xs"
                style={{ color: 'var(--muted-subtle)' }}
              >
                · {activeDraft.title}
              </span>
            )}
          </div>
        </div>

        {/* Uploaded docs */}
        {teamDocs.length > 0 && (
          <div className="flex items-center gap-1.5">
            {teamDocs.slice(0, 2).map((doc) => (
              <UploadedDocBadge key={doc.id} doc={doc} />
            ))}
            {teamDocs.length > 2 && (
              <span className="text-xs" style={{ color: 'var(--muted-subtle)' }}>
                +{teamDocs.length - 2} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {!activeTeam ? (
          <NoTeamState />
        ) : messages.length === 0 && !streamingContent ? (
          <EmptyChatState teamName={activeTeam.name} />
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {streamingContent && <StreamingMessage content={streamingContent} />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div
        className="flex-shrink-0 px-5 py-4"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="max-w-2xl mx-auto space-y-2.5">
          <QuickPrompts
            onSelect={(text) => setInputValue(text)}
            disabled={!activeTeam || isStreaming}
          />
          <ChatInput
            onSend={handleSend}
            onUpload={handleUpload}
            isDisabled={!activeTeam || isStreaming}
            placeholder={
              !activeTeam
                ? 'Select a team to start...'
                : isStreaming
                ? 'Generating...'
                : 'Message the assessment assistant...'
            }
            value={inputValue}
            onChange={setInputValue}
          />
        </div>
      </div>
    </div>
  )
}
