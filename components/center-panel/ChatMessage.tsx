'use client'

import { Zap, CheckCircle, AlertCircle } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/types'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end animate-fade-up">
        <div
          className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm"
          style={{
            background: 'var(--surface-hover)',
            border: '1px solid var(--border)',
            color: 'var(--foreground)',
            lineHeight: '1.5',
          }}
        >
          {message.content}
        </div>
      </div>
    )
  }

  if (message.role === 'tool') {
    const isDone = message.toolStatus === 'done'
    const isRunning = message.toolStatus === 'running'

    return (
      <div className="flex items-center gap-2 py-1 animate-fade-in">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: isDone ? 'rgba(34,197,94,0.08)' : 'rgba(79,110,247,0.08)',
            border: `1px solid ${isDone ? 'rgba(34,197,94,0.2)' : 'rgba(79,110,247,0.2)'}`,
          }}
        >
          {isRunning ? (
            <Zap size={11} style={{ color: '#4F6EF7' }} className="pulse-dot" />
          ) : isDone ? (
            <CheckCircle size={11} style={{ color: '#22C55E' }} />
          ) : (
            <AlertCircle size={11} style={{ color: '#EF4444' }} />
          )}
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-geist-mono)',
              color: isDone ? '#22C55E' : isRunning ? '#4F6EF7' : '#EF4444',
              letterSpacing: '0.02em',
            }}
          >
            {message.toolSummary || message.toolName}
          </span>
        </div>
      </div>
    )
  }

  // Assistant message
  return (
    <div className="flex justify-start animate-fade-up">
      <div
        className="max-w-[85%] text-sm"
        style={{
          color: 'rgba(255,255,255,0.85)',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
        }}
      >
        {message.content}
      </div>
    </div>
  )
}

export function StreamingMessage({ content }: { content: string }) {
  if (!content) return null
  return (
    <div className="flex justify-start">
      <div
        className="max-w-[85%] text-sm"
        style={{
          color: 'rgba(255,255,255,0.85)',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
        }}
      >
        {content}
        <span
          className="inline-block ml-0.5 align-middle pulse-dot"
          style={{
            width: '6px',
            height: '14px',
            background: '#4F6EF7',
            borderRadius: '1px',
          }}
        />
      </div>
    </div>
  )
}
