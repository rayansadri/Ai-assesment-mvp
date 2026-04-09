'use client'
import { useState, useEffect, use, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────
type BlockType =
  | 'section' | 'intro' | 'video' | 'multiple-choice' | 'open-text'
  | 'scenario' | 'case-study' | 'document-check' | 'file-upload' | 'scoring-rule'

interface Block { id: string; type: BlockType; cfg: Record<string, unknown> }
interface Assessment {
  id: string
  name: string
  programLabel?: string
  published?: boolean
  builderBlocks?: Block[]
}

interface ResponsePayload {
  blockId: string
  blockType: BlockType
  blockTitle?: string
  textResponse?: string
  choiceResponse?: number | number[]
  videoUrl?: string
}

const MAX_VIOLATIONS = 3

// ─── Word Counter ─────────────────────────────────────────────────────────────
function wordCount(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

// ─── Block Components ─────────────────────────────────────────────────────────

function SectionBlock({ cfg }: { cfg: Record<string, unknown> }) {
  return (
    <div style={{
      borderTop: '3px solid #D97706',
      paddingTop: 16,
      marginBottom: 4
    }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
        {cfg.title as string || 'Section'}
      </h2>
      {typeof cfg.subtitle === 'string' && cfg.subtitle && (
        <p style={{ fontSize: 13.5, color: '#6B7280', marginTop: 6, marginBottom: 0, lineHeight: 1.5 }}>
          {cfg.subtitle}
        </p>
      )}
    </div>
  )
}

function IntroBlock({ cfg }: { cfg: Record<string, unknown> }) {
  return (
    <div style={{
      background: '#EFF6FF',
      border: '1px solid #BFDBFE',
      borderRadius: 10,
      padding: '16px 20px',
      display: 'flex',
      gap: 14,
      alignItems: 'flex-start'
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 8,
        background: '#DBEAFE',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      </div>
      <p style={{ fontSize: 13.5, color: '#1E3A8A', lineHeight: 1.65, margin: 0 }}>
        {cfg.text as string}
      </p>
    </div>
  )
}

function VideoBlock({
  block,
  response,
  onChange
}: {
  block: Block
  response: unknown
  onChange: (val: unknown) => void
}) {
  const cfg = block.cfg
  const maxDuration = (cfg.maxDuration as number) || 90
  const maxAttempts = (cfg.attempts as number) || 3

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [recording, setRecording] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [attemptsUsed, setAttemptsUsed] = useState(0)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [streamReady, setStreamReady] = useState(false)
  const [countdown, setCountdown] = useState(maxDuration)
  const [recordingDuration, setRecordingDuration] = useState(0)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      if (videoUrl) URL.revokeObjectURL(videoUrl)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEnableCamera = async () => {
    setPermissionError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream
      setStreamReady(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Safari requires explicit play() after srcObject is set
        videoRef.current.play().catch(() => {})
      }
    } catch {
      setPermissionError('Camera access is required. Please allow camera access in your browser settings.')
    }
  }

  const handleStartRecording = () => {
    if (!streamRef.current) return
    chunksRef.current = []
    // Safari doesn't support video/webm — detect best supported MIME type
    const mimeType = [
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=vp9',
      'video/webm',
      '',
    ].find(t => t === '' || MediaRecorder.isTypeSupported(t)) ?? ''
    const mr = mimeType ? new MediaRecorder(streamRef.current, { mimeType }) : new MediaRecorder(streamRef.current)
    mediaRecorderRef.current = mr

    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
    }

    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'video/webm' })
      const url = URL.createObjectURL(blob)
      setVideoBlob(blob)
      setVideoUrl(url)
      setRecorded(true)
      setRecording(false)
      setAttemptsUsed(prev => prev + 1)

      // Auto-upload
      setUploading(true)
      try {
        const fd = new FormData()
        fd.append('file', blob, 'response.webm')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const { url: remoteUrl } = await res.json()
        setUploadedUrl(remoteUrl)
        onChange({ recorded: true, videoUrl: remoteUrl, timestamp: new Date().toISOString() })
      } catch {
        // Upload failed — still mark as recorded with local blob url
        onChange({ recorded: true, videoUrl: url, timestamp: new Date().toISOString() })
      } finally {
        setUploading(false)
      }
    }

    setCountdown(maxDuration)
    setRecordingDuration(0)
    setRecording(true)
    mr.start(1000)

    let elapsed = 0
    timerRef.current = setInterval(() => {
      elapsed += 1
      setCountdown(maxDuration - elapsed)
      setRecordingDuration(elapsed)
      if (elapsed >= maxDuration) {
        clearInterval(timerRef.current!)
        timerRef.current = null
        mr.stop()
      }
    }, 1000)
  }

  const handleStopRecording = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  const handleReRecord = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    setVideoUrl(null)
    setVideoBlob(null)
    setRecorded(false)
    setRecording(false)
    setUploadedUrl(null)
    setUploading(false)
    setCountdown(maxDuration)
    setRecordingDuration(0)
    onChange(null)
    // Re-attach stream to preview (Safari needs explicit play())
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <div style={{
      background: '#111827',
      borderRadius: 12,
      padding: '20px 22px',
      border: '1px solid #374151'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: 'rgba(52,81,209,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#818CF8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Video Response
        </span>
        <span style={{ fontSize: 11, color: '#4B5563', marginLeft: 'auto' }}>
          Up to {maxDuration}s · {maxAttempts} attempt{maxAttempts !== 1 ? 's' : ''}
        </span>
      </div>

      <p style={{ fontSize: 14.5, color: '#F9FAFB', lineHeight: 1.65, marginBottom: 20 }}>
        {cfg.question as string}
      </p>

      {permissionError && (
        <div style={{
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 8, padding: '10px 14px', marginBottom: 14,
          fontSize: 13, color: '#FCA5A5'
        }}>
          {permissionError}
        </div>
      )}

      {/* Recorded state */}
      {recorded ? (
        <div>
          {videoUrl && (
            <video
              src={videoUrl}
              controls
              style={{ width: '100%', borderRadius: 8, maxHeight: 280, marginBottom: 12, background: '#000' }}
            />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)',
              borderRadius: 8, padding: '8px 14px'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={{ fontSize: 13, color: '#4ADE80', fontWeight: 500 }}>
                Video recorded ({recordingDuration}s)
              </span>
            </div>
            {uploading && (
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>Uploading...</span>
            )}
            {uploadedUrl && !uploading && (
              <span style={{ fontSize: 12, color: '#4ADE80', fontWeight: 500 }}>✓ Saved</span>
            )}
            {attemptsUsed < maxAttempts && (
              <button
                onClick={handleReRecord}
                style={{
                  fontSize: 12, color: '#6B7280', background: 'transparent', border: '1px solid #374151',
                  borderRadius: 7, padding: '7px 12px', cursor: 'pointer'
                }}
              >
                Re-record
              </button>
            )}
          </div>
        </div>
      ) : recording ? (
        /* Recording in progress */
        <div>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{ width: '100%', borderRadius: 8, maxHeight: 280, display: 'block', background: '#000' }}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
              borderRadius: '0 0 8px 8px', padding: '16px 12px 10px',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
              </svg>
              <span style={{ fontSize: 11.5, color: '#FCD34D', fontWeight: 600 }}>
                Please look at the screen — eye movement is monitored for integrity
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%', background: '#EF4444',
              animation: 'pulse 1s infinite', flexShrink: 0
            }} />
            <span style={{ fontSize: 13, color: '#EF4444', fontWeight: 500 }}>Recording</span>
            <span style={{ fontSize: 12, color: '#6B7280' }}>
              {formatTime(countdown)} remaining
            </span>
          </div>
          <button
            onClick={handleStopRecording}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 8,
              background: '#EF4444', border: 'none',
              color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer'
            }}
          >
            <span>⏹</span>
            Stop Recording
          </button>
        </div>
      ) : streamReady ? (
        /* Stream ready, not yet recording */
        <div>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{ width: '100%', borderRadius: 8, maxHeight: 280, display: 'block', background: '#000' }}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
              borderRadius: '0 0 8px 8px', padding: '16px 12px 10px',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
              </svg>
              <span style={{ fontSize: 11.5, color: '#FCD34D', fontWeight: 600 }}>
                Please look at the screen — eye movement is monitored for integrity
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', flexShrink: 0
            }} />
            <span style={{ fontSize: 12, color: '#6B7280' }}>Ready to record</span>
            {attemptsUsed > 0 && (
              <span style={{ fontSize: 11, color: '#4B5563', marginLeft: 'auto' }}>
                {attemptsUsed}/{maxAttempts} attempts used
              </span>
            )}
          </div>
          <button
            onClick={handleStartRecording}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 8,
              background: 'var(--accent, #3451D1)', border: 'none',
              color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer'
            }}
          >
            <span>⏺</span>
            Start Recording
          </button>
        </div>
      ) : (
        /* Permission phase */
        <button
          onClick={handleEnableCamera}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 8,
            background: 'var(--accent, #3451D1)', border: 'none',
            color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer'
          }}
        >
          <span>📷</span>
          Enable Camera
        </button>
      )}

      {typeof cfg.note === 'string' && cfg.note && (
        <p style={{ fontSize: 11.5, color: '#4B5563', marginTop: 12, marginBottom: 0, fontStyle: 'italic' }}>
          {cfg.note}
        </p>
      )}
    </div>
  )
}

function MultipleChoiceBlock({
  block,
  response,
  onChange
}: {
  block: Block
  response: unknown
  onChange: (val: unknown) => void
}) {
  const cfg = block.cfg
  const options = (cfg.options as string[]) || []
  const isMulti = cfg.multi as boolean

  const handleSelect = (idx: number) => {
    if (isMulti) {
      const current = (response as number[]) || []
      const next = current.includes(idx)
        ? current.filter(i => i !== idx)
        : [...current, idx]
      onChange(next)
    } else {
      onChange(idx)
    }
  }

  const isSelected = (idx: number) => {
    if (isMulti) return ((response as number[]) || []).includes(idx)
    return response === idx
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '20px 22px' }}>
      <p style={{ fontSize: 14.5, fontWeight: 600, color: '#111827', lineHeight: 1.55, marginBottom: 16 }}>
        {cfg.question as string}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map((opt, idx) => {
          const selected = isSelected(idx)
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '11px 14px', borderRadius: 8, cursor: 'pointer',
                border: `1.5px solid ${selected ? 'var(--accent, #3451D1)' : '#E5E7EB'}`,
                background: selected ? 'rgba(52,81,209,0.06)' : '#fff',
                textAlign: 'left', transition: 'all 0.12s', width: '100%', fontFamily: 'inherit'
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: isMulti ? 4 : '50%',
                border: `2px solid ${selected ? 'var(--accent, #3451D1)' : '#D1D5DB'}`,
                background: selected ? 'var(--accent, #3451D1)' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1, transition: 'all 0.12s'
              }}>
                {selected && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 13.5, color: selected ? '#1E40AF' : '#374151', lineHeight: 1.5 }}>
                {opt}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function OpenTextBlock({
  block,
  response,
  onChange
}: {
  block: Block
  response: unknown
  onChange: (val: unknown) => void
}) {
  const cfg = block.cfg
  const text = (response as string) || ''
  const words = wordCount(text)
  const limit = cfg.wordLimit as number

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '20px 22px' }}>
      <p style={{ fontSize: 14.5, fontWeight: 600, color: '#111827', lineHeight: 1.55, marginBottom: 14 }}>
        {cfg.question as string}
      </p>
      <textarea
        value={text}
        onChange={e => onChange(e.target.value)}
        placeholder="Type your response here..."
        rows={6}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 8,
          border: '1.5px solid #E5E7EB', outline: 'none', resize: 'vertical',
          fontSize: 13.5, color: '#111827', fontFamily: 'inherit', lineHeight: 1.6,
          background: '#FAFAFA', transition: 'border-color 0.12s, box-shadow 0.12s',
          boxSizing: 'border-box'
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent, #3451D1)'; e.target.style.boxShadow = '0 0 0 3px rgba(52,81,209,0.1)' }}
        onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
        <span style={{
          fontSize: 11.5, color: words > limit ? '#EF4444' : '#9CA3AF'
        }}>
          {words} / {limit} words
        </span>
      </div>
    </div>
  )
}

function ScenarioBlock({
  block,
  response,
  onChange
}: {
  block: Block
  response: unknown
  onChange: (val: unknown) => void
}) {
  const cfg = block.cfg
  const text = (response as string) || ''

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
      <div style={{
        background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
        padding: '16px 22px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="2">
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7" />
          </svg>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#6EE7B7', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Scenario
          </span>
        </div>
        <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#ECFDF5', margin: '0 0 8px' }}>
          {cfg.title as string}
        </h3>
        <p style={{ fontSize: 13, color: '#A7F3D0', lineHeight: 1.65, margin: 0 }}>
          {cfg.context as string}
        </p>
      </div>
      <div style={{ padding: '18px 22px' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12, lineHeight: 1.5 }}>
          {cfg.question as string}
        </p>
        <textarea
          value={text}
          onChange={e => onChange(e.target.value)}
          placeholder="Describe your approach in detail..."
          rows={6}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 8,
            border: '1.5px solid #E5E7EB', outline: 'none', resize: 'vertical',
            fontSize: 13.5, color: '#111827', fontFamily: 'inherit', lineHeight: 1.6,
            background: '#FAFAFA', transition: 'border-color 0.12s, box-shadow 0.12s',
            boxSizing: 'border-box'
          }}
          onFocus={e => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.1)' }}
          onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
        />
      </div>
    </div>
  )
}

function CaseStudyBlock({
  block,
  response,
  onChange
}: {
  block: Block
  response: unknown
  onChange: (val: unknown) => void
}) {
  const cfg = block.cfg
  const tasks = (cfg.tasks as string[]) || []
  const answers = (response as Record<number, string>) || {}

  const setAnswer = (idx: number, val: string) => {
    onChange({ ...answers, [idx]: val })
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
      <div style={{
        background: 'linear-gradient(135deg, #4A1942 0%, #6B2157 100%)',
        padding: '16px 22px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F9A8D4" strokeWidth="2">
            <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#F9A8D4', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Case Study
          </span>
        </div>
        <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#FDF4FF', margin: '0 0 8px' }}>
          {cfg.title as string}
        </h3>
        <p style={{ fontSize: 13, color: '#E879F9', lineHeight: 1.65, margin: 0, opacity: 0.85 }}>
          {cfg.context as string}
        </p>
      </div>
      <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {tasks.map((task, idx) => (
          <div key={idx}>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 22, height: 22, borderRadius: '50%', background: 'rgba(124,58,237,0.1)',
                color: '#7C3AED', fontSize: 11, fontWeight: 700, marginRight: 8
              }}>{idx + 1}</span>
              {task}
            </p>
            <textarea
              value={answers[idx] || ''}
              onChange={e => setAnswer(idx, e.target.value)}
              placeholder="Your answer..."
              rows={4}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8,
                border: '1.5px solid #E5E7EB', outline: 'none', resize: 'vertical',
                fontSize: 13.5, color: '#111827', fontFamily: 'inherit', lineHeight: 1.6,
                background: '#FAFAFA', transition: 'border-color 0.12s, box-shadow 0.12s',
                boxSizing: 'border-box'
              }}
              onFocus={e => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)' }}
              onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function DocumentCheckBlock({ block }: { block: Block }) {
  const cfg = block.cfg
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75">
            <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{cfg.label as string}</p>
          {typeof cfg.instructions === 'string' && cfg.instructions && (
            <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0' }}>{cfg.instructions}</p>
          )}
        </div>
      </div>
      <div style={{
        border: '2px dashed #BFDBFE', borderRadius: 10, padding: '24px 16px',
        textAlign: 'center', background: '#F8FAFF', cursor: 'pointer'
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="1.5" style={{ margin: '0 auto 8px', display: 'block' }}>
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <p style={{ fontSize: 13, color: '#3B82F6', fontWeight: 500, margin: '0 0 4px' }}>
          Click to upload or drag and drop
        </p>
        <p style={{ fontSize: 11.5, color: '#9CA3AF', margin: 0 }}>
          Accepted: {(cfg.accepted as string) || 'PDF, JPG, PNG'}
        </p>
      </div>
    </div>
  )
}

function FileUploadBlock({ block }: { block: Block }) {
  const cfg = block.cfg
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.75">
            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>{cfg.label as string}</p>
      </div>
      <div style={{
        border: '2px dashed #D1D5DB', borderRadius: 10, padding: '24px 16px',
        textAlign: 'center', background: '#FAFAFA', cursor: 'pointer'
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" style={{ margin: '0 auto 8px', display: 'block' }}>
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, margin: '0 0 4px' }}>
          Click to upload or drag and drop
        </p>
        <p style={{ fontSize: 11.5, color: '#9CA3AF', margin: 0 }}>
          {cfg.types as string} · Max {cfg.maxSize as string}
        </p>
      </div>
    </div>
  )
}

// ─── Block Dispatcher ─────────────────────────────────────────────────────────
function StudentBlock({
  block,
  response,
  onChange
}: {
  block: Block
  response: unknown
  onChange: (val: unknown) => void
}) {
  switch (block.type) {
    case 'section': return <SectionBlock cfg={block.cfg} />
    case 'intro': return <IntroBlock cfg={block.cfg} />
    case 'video': return <VideoBlock block={block} response={response} onChange={onChange} />
    case 'multiple-choice': return <MultipleChoiceBlock block={block} response={response} onChange={onChange} />
    case 'open-text': return <OpenTextBlock block={block} response={response} onChange={onChange} />
    case 'scenario': return <ScenarioBlock block={block} response={response} onChange={onChange} />
    case 'case-study': return <CaseStudyBlock block={block} response={response} onChange={onChange} />
    case 'document-check': return <DocumentCheckBlock block={block} />
    case 'file-upload': return <FileUploadBlock block={block} />
    case 'scoring-rule': return null
    default: return null
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TakePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const isPreview = searchParams.get('preview') === 'true'
  const programId = searchParams.get('programId')
  const router = useRouter()

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [responses, setResponses] = useState<Record<string, unknown>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submittedAt, setSubmittedAt] = useState<string | null>(null)
  const [terminated, setTerminated] = useState(false)
  const [violations, setViolations] = useState(0)
  const [warningVisible, setWarningVisible] = useState(false)
  const [warningReason, setWarningReason] = useState('')
  const [confirmingSubmit, setConfirmingSubmit] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Student info
  const [studentName, setStudentName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [showStudentForm, setShowStudentForm] = useState(true)
  const [studentFormNameInput, setStudentFormNameInput] = useState('')
  const [studentFormEmailInput, setStudentFormEmailInput] = useState('')

  // Start time — set when assessment loads (student form submitted)
  const startTimeRef = useRef<Date>(new Date())

  const violationsRef = useRef(0)

  // Load student info from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pa-student-info')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.name && parsed.email) {
          setStudentName(parsed.name)
          setStudentEmail(parsed.email)
          setStudentFormNameInput(parsed.name)
          setStudentFormEmailInput(parsed.email)
          setShowStudentForm(false)
          startTimeRef.current = new Date()
        }
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('pa-assessments') || '[]')
      const found = stored.find((a: { id: string }) => a.id === id)
      if (!found) { setNotFound(true); return }
      if (!isPreview && !found.published) { setNotFound(true); return }
      setAssessment(found)
    } catch {
      setNotFound(true)
    }
  }, [id, isPreview])

  const handleStudentFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = studentFormNameInput.trim()
    const email = studentFormEmailInput.trim()
    if (!name || !email) return
    setStudentName(name)
    setStudentEmail(email)
    setShowStudentForm(false)
    startTimeRef.current = new Date()
    try {
      localStorage.setItem('pa-student-info', JSON.stringify({ name, email }))
    } catch {
      // ignore
    }
  }

  const triggerViolation = useCallback((reason: string) => {
    violationsRef.current += 1
    const newCount = violationsRef.current
    setViolations(newCount)
    if (newCount >= MAX_VIOLATIONS) {
      setTerminated(true)
      setWarningVisible(false)
    } else {
      setWarningReason(reason)
      setWarningVisible(true)
    }
  }, [])

  useEffect(() => {
    if (isPreview || submitted || terminated || !assessment) return
    const onVisibility = () => {
      if (document.hidden) triggerViolation('You switched to another tab or application.')
    }
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      triggerViolation('Copying text is not allowed during this assessment.')
    }
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('copy', onCopy)
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('copy', onCopy)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [isPreview, submitted, terminated, assessment, triggerViolation])

  const setResponse = (blockId: string, val: unknown) => {
    setResponses(prev => ({ ...prev, [blockId]: val }))
  }

  const hasAnyResponse = Object.keys(responses).length > 0

  const handleSubmit = async () => {
    if (!assessment) return
    setSubmitting(true)
    setConfirmingSubmit(false)

    const blocks = assessment.builderBlocks || []

    const responsesArray: ResponsePayload[] = blocks
      .filter(b => b.type !== 'scoring-rule' && b.type !== 'section' && b.type !== 'intro' && b.type !== 'document-check' && b.type !== 'file-upload')
      .map(b => {
        const r = responses[b.id]
        const payload: ResponsePayload = {
          blockId: b.id,
          blockType: b.type,
          blockTitle: (b.cfg.question as string) || (b.cfg.title as string) || undefined,
        }
        if (b.type === 'multiple-choice') {
          payload.choiceResponse = r as number | number[]
        } else if (b.type === 'video') {
          const vr = r as { videoUrl?: string } | null
          payload.videoUrl = vr?.videoUrl
        } else {
          payload.textResponse = r as string
        }
        return payload
      })

    const submission = {
      id: Math.random().toString(36).slice(2, 10),
      assessmentId: id,
      assessmentTitle: assessment.name,
      studentName,
      studentEmail,
      programName: assessment.programLabel || '',
      programId: programId || undefined,
      startedAt: startTimeRef.current.toISOString(),
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      responses: responsesArray,
    }

    // Save to localStorage (primary - works cross-session on same device)
    try {
      const stored = JSON.parse(localStorage.getItem('pa-submissions') || '[]')
      stored.push(submission)
      localStorage.setItem('pa-submissions', JSON.stringify(stored))
    } catch {}

    // Also POST to API (secondary - for future DB integration)
    try {
      await fetch('/api/submissions', {
        method: 'POST',
        body: JSON.stringify(submission),
        headers: { 'Content-Type': 'application/json' },
      })
    } catch {
      // proceed to completion screen regardless
    }

    setSubmitting(false)

    // If launched from marketplace, redirect to results page
    if (programId) {
      router.push(`/marketplace/programs/${programId}/results/${submission.id}`)
      return
    }

    const now = new Date().toISOString()
    setSubmittedAt(now)
    setSubmitted(true)
  }

  if (notFound) {
    return (
      <div style={{
        minHeight: '100vh', background: '#F6F7F9',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
      }}>
        <div style={{
          background: '#fff', borderRadius: 16, padding: '48px 40px',
          maxWidth: 420, width: '100%', textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: '#FEF2F2',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>
            Assessment Not Available
          </h2>
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
            This assessment link is no longer active or has not been published yet. Please contact the admissions team for assistance.
          </p>
        </div>
      </div>
    )
  }

  if (terminated) {
    return (
      <div style={{
        minHeight: '100vh', background: '#111827',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
      }}>
        <div style={{
          background: '#fff', borderRadius: 16, padding: '48px 40px',
          maxWidth: 440, width: '100%', textAlign: 'center',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🚫</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>
            Assessment Terminated
          </h2>
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.65, margin: '0 0 16px' }}>
            Your assessment has been terminated due to {MAX_VIOLATIONS} security violations detected during the session. This includes actions such as switching tabs, copying content, or attempting to leave the assessment.
          </p>
          <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.6, margin: 0 }}>
            If you believe this was an error, please contact the admissions team to discuss your options.
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh', background: '#F6F7F9',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
      }}>
        <div style={{
          background: '#fff', borderRadius: 16, padding: '48px 40px',
          maxWidth: 440, width: '100%', textAlign: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>
            Assessment Submitted!
          </h2>
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.65, margin: '0 0 20px' }}>
            Thanks {studentName}! Your assessment has been submitted and will be reviewed by the admissions team. You will hear back from us soon.
          </p>
          <div style={{
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            borderRadius: 8, padding: '10px 16px',
            fontSize: 12, color: '#15803D'
          }}>
            Submitted at {submittedAt ? new Date(submittedAt).toLocaleString() : ''}
          </div>
        </div>
      </div>
    )
  }

  if (!assessment) return null

  // Show student info form before assessment
  if (showStudentForm) {
    return (
      <div style={{
        minHeight: '100vh', background: '#F6F7F9',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
      }}>
        <div style={{
          background: '#fff', borderRadius: 16, padding: '48px 40px',
          maxWidth: 440, width: '100%',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
        }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
              Before we begin
            </h2>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
              Please enter your name and email to start
            </p>
          </div>
          <form onSubmit={handleStudentFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={studentFormNameInput}
                onChange={e => setStudentFormNameInput(e.target.value)}
                placeholder="Your full name"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1.5px solid #E5E7EB', outline: 'none',
                  fontSize: 14, color: '#111827', fontFamily: 'inherit',
                  background: '#FAFAFA', boxSizing: 'border-box',
                  transition: 'border-color 0.12s, box-shadow 0.12s'
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent, #3451D1)'; e.target.style.boxShadow = '0 0 0 3px rgba(52,81,209,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={studentFormEmailInput}
                onChange={e => setStudentFormEmailInput(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1.5px solid #E5E7EB', outline: 'none',
                  fontSize: 14, color: '#111827', fontFamily: 'inherit',
                  background: '#FAFAFA', boxSizing: 'border-box',
                  transition: 'border-color 0.12s, box-shadow 0.12s'
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent, #3451D1)'; e.target.style.boxShadow = '0 0 0 3px rgba(52,81,209,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <button
              type="submit"
              style={{
                marginTop: 4, padding: '12px 0', borderRadius: 9, border: 'none',
                background: 'var(--accent, #3451D1)', color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                transition: 'opacity 0.15s'
              }}
            >
              Start Assessment →
            </button>
          </form>
        </div>
      </div>
    )
  }

  const blocks = assessment.builderBlocks || []
  const visibleBlocks = blocks.filter(b => b.type !== 'scoring-rule')

  return (
    <div style={{ minHeight: '100vh', background: '#F6F7F9', fontFamily: 'inherit' }}>

      {/* ── Warning Overlay ── */}
      {warningVisible && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: '36px 32px',
            maxWidth: 420, width: '100%', textAlign: 'center',
            boxShadow: '0 8px 48px rgba(0,0,0,0.4)'
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 19, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>
              Do not leave this screen
            </h2>
            <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.65, margin: '0 0 16px' }}>
              {warningReason}
            </p>
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 8, padding: '8px 14px', marginBottom: 20,
              fontSize: 12.5, color: '#EF4444', fontWeight: 600
            }}>
              Violation {violations} of {MAX_VIOLATIONS} — further violations will terminate your assessment.
            </div>
            <button
              onClick={() => setWarningVisible(false)}
              style={{
                padding: '11px 28px', borderRadius: 9, border: 'none',
                background: 'var(--accent, #3451D1)', color: '#fff',
                fontSize: 13.5, fontWeight: 600, cursor: 'pointer', width: '100%'
              }}
            >
              I understand — continue
            </button>
          </div>
        </div>
      )}

      {/* ── Submit Confirmation Dialog ── */}
      {confirmingSubmit && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 8000,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
        }}>
          <div style={{
            background: '#fff', borderRadius: 14, padding: '32px 28px',
            maxWidth: 380, width: '100%', textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>
              Submit your assessment?
            </h3>
            <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.6, margin: '0 0 24px' }}>
              This cannot be undone. Your responses will be submitted to the admissions team for review.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmingSubmit(false)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 8,
                  border: '1px solid #E5E7EB', background: '#fff',
                  color: '#374151', fontSize: 13.5, cursor: 'pointer', fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 8,
                  border: 'none', background: submitting ? '#9CA3AF' : 'var(--accent, #3451D1)',
                  color: '#fff', fontSize: 13.5, cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 600
                }}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview Banner ── */}
      {isPreview && (
        <div style={{
          background: '#FEF3C7', borderBottom: '1px solid #FDE68A',
          padding: '9px 20px', textAlign: 'center',
          fontSize: 12.5, color: '#92400E', fontWeight: 600
        }}>
          PREVIEW MODE — This is how students will see the assessment. Anti-cheating is disabled in preview.
        </div>
      )}

      {/* ── Header ── */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #E5E7EB',
        padding: '0 28px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7, background: 'var(--accent, #3451D1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>
            {assessment.name}
          </span>
          {assessment.programLabel && (
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 5,
              background: 'rgba(52,81,209,0.08)', color: 'var(--accent, #3451D1)', fontWeight: 500
            }}>
              {assessment.programLabel.split(' — ')[0]}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {programId && (
            <a href={`/marketplace/programs/${programId}`} style={{
              fontSize: 12, color: '#6B7280', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Back to program
            </a>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>Secure Session</span>
          </div>
        </div>
      </div>

      {/* ── Anti-Cheat Strip ── */}
      {!isPreview && (
        <div style={{
          background: '#FFFBEB', borderBottom: '1px solid #FDE68A',
          padding: '6px 20px', textAlign: 'center',
          fontSize: 12, color: '#78350F', fontWeight: 500
        }}>
          🔒 This is a secure assessment. Tab switching, copying, and screen capture are monitored.
        </div>
      )}

      {/* ── Content ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 120px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {visibleBlocks.map(block => (
            <StudentBlock
              key={block.id}
              block={block}
              response={responses[block.id]}
              onChange={val => setResponse(block.id, val)}
            />
          ))}
        </div>

        {/* ── Submit Button ── */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#fff', borderTop: '1px solid #E5E7EB',
          padding: '14px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 12.5, color: '#9CA3AF' }}>
              {visibleBlocks.length} question{visibleBlocks.length !== 1 ? 's' : ''} in this assessment
            </span>
            <button
              onClick={() => setConfirmingSubmit(true)}
              disabled={!hasAnyResponse}
              style={{
                padding: '10px 24px', borderRadius: 9, border: 'none',
                background: hasAnyResponse ? 'var(--accent, #3451D1)' : '#E5E7EB',
                color: hasAnyResponse ? '#fff' : '#9CA3AF',
                fontSize: 13.5, fontWeight: 600,
                cursor: hasAnyResponse ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s'
              }}
            >
              Submit Assessment →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
