'use client'

import { useRef, useState, useEffect } from 'react'
import { Send, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (text: string) => void
  onUpload: (file: File) => void
  isDisabled?: boolean
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

export function ChatInput({
  onSend,
  onUpload,
  isDisabled,
  placeholder = 'Ask about this assessment...',
  value,
  onChange,
}: ChatInputProps) {
  const [internalValue, setInternalValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const currentValue = value !== undefined ? value : internalValue
  const handleChange = onChange || setInternalValue

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px'
    }
  }, [currentValue])

  const handleSend = () => {
    const text = currentValue.trim()
    if (!text || isDisabled) return
    onSend(text)
    handleChange('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
      e.target.value = ''
    }
  }

  return (
    <div
      className="flex items-end gap-2 p-3 rounded-xl"
      style={{
        background: 'var(--surface-hover)',
        border: '1px solid var(--border)',
      }}
    >
      {/* File upload */}
      <input
        ref={fileRef}
        type="file"
        accept=".txt,.md,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="flex-shrink-0 p-1.5 rounded-md transition-colors"
        style={{ color: 'var(--muted-subtle)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--border)'
          e.currentTarget.style.color = 'var(--foreground)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--muted-subtle)'
        }}
        title="Upload policy document"
      >
        <Paperclip size={15} />
      </button>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={currentValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className={cn('flex-1 bg-transparent text-sm outline-none border-none', 'placeholder:opacity-30')}
        style={{
          color: 'var(--foreground)',
          lineHeight: '1.5',
          fontFamily: 'inherit',
          maxHeight: '160px',
          overflowY: 'auto',
        }}
        disabled={isDisabled}
      />

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!currentValue.trim() || isDisabled}
        className="flex-shrink-0 p-1.5 rounded-md transition-all"
        style={{
          background: currentValue.trim() && !isDisabled ? '#4F6EF7' : 'transparent',
          color: currentValue.trim() && !isDisabled ? 'white' : 'var(--muted-faint)',
          opacity: isDisabled ? 0.5 : 1,
        }}
      >
        <Send size={14} />
      </button>
    </div>
  )
}
