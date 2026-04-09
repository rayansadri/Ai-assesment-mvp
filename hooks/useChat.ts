'use client'

import { useState, useCallback, useRef } from 'react'
import { generateId } from '@/lib/utils'
import type { ChatMessage, AssessmentDraft } from '@/types'

interface UseChatOptions {
  teamId?: string
  draftId?: string
  onDraftUpdated?: (draft: AssessmentDraft) => void
}

interface UseChatReturn {
  messages: ChatMessage[]
  streamingContent: string
  isStreaming: boolean
  activeToolCall: { name: string; status: 'running' | 'done' } | null
  sendMessage: (text: string) => Promise<void>
  addSystemMessage: (text: string) => void
  clearMessages: () => void
}

export function useChat({
  teamId,
  draftId,
  onDraftUpdated,
}: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [activeToolCall, setActiveToolCall] = useState<{
    name: string
    status: 'running' | 'done'
  } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const addSystemMessage = useCallback((text: string) => {
    const msg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: text,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, msg])
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setStreamingContent('')
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return

      // Add user message
      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMsg])
      setStreamingContent('')
      setIsStreaming(true)

      // Build API message history
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.role === 'tool' ? `[Tool: ${m.toolName}] ${m.content}` : m.content,
      }))

      abortRef.current = new AbortController()

      try {
        const response = await fetch('/workspace/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            teamId,
            draftId,
          }),
          signal: abortRef.current.signal,
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        if (!response.body) throw new Error('No response body')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let fullText = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk

          // Split on data: events
          const parts = buffer.split('\ndata:')
          buffer = parts[parts.length - 1] // keep incomplete last part

          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i]
            // Check if this is a data event
            const dataStr = part.startsWith('data:') ? part.slice(5) : part
            try {
              const event = JSON.parse(dataStr.trim())
              if (event.type === 'tool_start') {
                setActiveToolCall({ name: event.tool, status: 'running' })
                const toolMsg: ChatMessage = {
                  id: `tool-${event.id}`,
                  role: 'tool',
                  content: '',
                  toolName: event.tool,
                  toolStatus: 'running',
                  toolSummary: formatToolName(event.tool),
                  timestamp: new Date().toISOString(),
                }
                setMessages((prev) => [...prev, toolMsg])
              } else if (event.type === 'tool_end') {
                setActiveToolCall({ name: event.tool, status: 'done' })
                // Update tool message status
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === `tool-${event.id}`
                      ? {
                          ...m,
                          toolStatus: 'done',
                          toolSummary: event.result?.summary || formatToolName(event.tool) + ' done',
                        }
                      : m
                  )
                )
                // If a draft was updated/created, notify parent
                if (event.result?.draft && onDraftUpdated) {
                  onDraftUpdated(event.result.draft as AssessmentDraft)
                }
              } else if (event.type === 'done') {
                setActiveToolCall(null)
              }
            } catch {
              // Not a JSON event — treat as text
              const textPart = part.startsWith('\n') ? part.slice(1) : part
              if (textPart && !textPart.includes('data:')) {
                fullText += textPart
                setStreamingContent(fullText)
              }
            }
          }

          // Handle non-event text in buffer
          const nonEventText = buffer.replace(/\ndata:\{[^}]*\}\n/g, '')
          if (nonEventText && !nonEventText.includes('"type"')) {
            fullText += nonEventText
            buffer = ''
            setStreamingContent(fullText)
          }
        }

        // Finalize: add assistant message
        if (fullText.trim()) {
          const assistantMsg: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: fullText,
            timestamp: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, assistantMsg])
        }
        setStreamingContent('')
        setActiveToolCall(null)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        const errMsg: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: 'Something went wrong. Please check your API key and try again.',
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errMsg])
        setStreamingContent('')
        setActiveToolCall(null)
      } finally {
        setIsStreaming(false)
      }
    },
    [messages, isStreaming, teamId, draftId, onDraftUpdated]
  )

  return {
    messages,
    streamingContent,
    isStreaming,
    activeToolCall,
    sendMessage,
    addSystemMessage,
    clearMessages,
  }
}

function formatToolName(tool: string): string {
  return tool.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
