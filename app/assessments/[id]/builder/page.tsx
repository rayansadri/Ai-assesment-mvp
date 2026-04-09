'use client'
import { useState, useRef, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────
type BlockType =
  | 'section' | 'intro' | 'video' | 'multiple-choice' | 'open-text'
  | 'scenario' | 'case-study' | 'document-check' | 'file-upload' | 'scoring-rule'

interface Block { id: string; type: BlockType; cfg: Record<string, unknown> }

const uid = () => Math.random().toString(36).slice(2, 8)

// ─── Defaults per block type ──────────────────────────────────────────────────
const DEFAULTS: Record<BlockType, Record<string, unknown>> = {
  'section':          { title: 'New Section', subtitle: '' },
  'intro':            { text: 'Please read the following instructions carefully before starting.' },
  'video':            { question: '', maxDuration: 60, attempts: 3, note: '' },
  'multiple-choice':  { question: '', options: ['', ''], correct: -1, multi: false },
  'open-text':        { question: '', wordLimit: 500 },
  'scenario':         { title: '', context: '', question: '' },
  'case-study':       { title: '', context: '', tasks: [''] },
  'document-check':   { label: 'Upload credential document', instructions: '', required: true, accepted: 'PDF, JPG, PNG' },
  'file-upload':      { label: 'Upload your work sample', types: 'PDF, DOCX, XLSX', maxSize: '10MB' },
  'scoring-rule':     { pillar: '', weight: 33, passing: 3.0, note: '' },
}

// ─── Slash commands catalog ───────────────────────────────────────────────────
const CMDS: { type: BlockType; label: string; desc: string; color: string; kw: string; icon: string }[] = [
  { type: 'section',          label: 'Section',              desc: 'Titled section separator',            color: '#D97706', kw: 'section header divider title', icon: 'M4 6h16M4 10h16M4 14h8' },
  { type: 'intro',            label: 'Intro',                desc: 'Instructions for candidates',         color: '#6B7280', kw: 'intro text instructions context note', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { type: 'video',            label: 'Video Response',       desc: 'Timed video answer recording',        color: '#3451D1', kw: 'video response record camera film', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z' },
  { type: 'multiple-choice',  label: 'Multiple Choice',      desc: 'Single or multi-select question',     color: '#7C3AED', kw: 'multiple choice mc quiz select option', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { type: 'open-text',        label: 'Open Text',            desc: 'Long-form written response',          color: '#0891B2', kw: 'open text essay written long form', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { type: 'scenario',         label: 'Scenario',             desc: 'Situational judgement challenge',     color: '#16A34A', kw: 'scenario situational judgement case judge', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7' },
  { type: 'case-study',       label: 'Case Study',           desc: 'Document or data analysis task',      color: '#9D174D', kw: 'case study analysis data document research', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { type: 'document-check',   label: 'Document Check',       desc: 'Request & verify credentials',        color: '#0369A1', kw: 'document check verify credential certificate diploma', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { type: 'file-upload',      label: 'File Upload',          desc: 'Request a portfolio or work sample',  color: '#6B7280', kw: 'file upload portfolio work sample pdf', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  { type: 'scoring-rule',     label: 'Scoring Rule',         desc: 'Pillar weights & passing thresholds', color: '#D97706', kw: 'scoring rule weight pillar threshold rubric grade', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
]

const COLOR: Record<BlockType, string> = Object.fromEntries(CMDS.map(c => [c.type, c.color])) as Record<BlockType, string>
const LABEL: Record<BlockType, string> = Object.fromEntries(CMDS.map(c => [c.type, c.label])) as Record<BlockType, string>
const ICON:  Record<BlockType, string> = Object.fromEntries(CMDS.map(c => [c.type, c.icon])) as Record<BlockType, string>

// ─── Shared input style ───────────────────────────────────────────────────────
const IS: React.CSSProperties = {
  width: '100%', padding: '7px 10px', borderRadius: 6, fontSize: 13.5, lineHeight: 1.5,
  border: '1px solid rgba(0,0,0,0.13)', outline: 'none', background: '#fff',
  color: '#111827', fontFamily: 'inherit', transition: 'border-color 0.12s, box-shadow 0.12s'
}

function focusColor(el: HTMLElement, color: string) { el.style.borderColor = color; el.style.boxShadow = `0 0 0 2.5px ${color}22` }
function blurReset(el: HTMLElement) { el.style.borderColor = 'rgba(0,0,0,0.13)'; el.style.boxShadow = 'none' }

const iconBtn: React.CSSProperties = {
  width: 24, height: 24, borderRadius: 5, border: '1px solid rgba(0,0,0,0.1)',
  background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
  justifyContent: 'center', color: '#6B7280'
}

// ─── Slash Menu ───────────────────────────────────────────────────────────────
function SlashMenu({ query, selIdx, onSelect }: { query: string; selIdx: number; onSelect: (t: BlockType) => void }) {
  const q = query.toLowerCase()
  const filtered = CMDS.filter(c => !q || c.label.toLowerCase().includes(q) || c.kw.includes(q) || c.type.includes(q))
  if (!filtered.length) return (
    <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 200, background: '#fff', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: '12px 16px', fontSize: 13, color: '#9CA3AF' }}>
      No matching blocks for &quot;{query}&quot;
    </div>
  )
  return (
    <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 200, background: '#fff', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 10px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden', width: 330 }}>
      <div style={{ padding: '8px 14px 4px', fontSize: 9.5, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
        BLOCKS · {filtered.length} result{filtered.length !== 1 ? 's' : ''}
      </div>
      {filtered.map((cmd, i) => (
        <button key={cmd.type} onMouseDown={e => { e.preventDefault(); onSelect(cmd.type) }}
          style={{
            width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            background: i === selIdx ? `${cmd.color}10` : 'transparent',
            borderLeft: `3px solid ${i === selIdx ? cmd.color : 'transparent'}`,
          }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 7, flexShrink: 0, background: `${cmd.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cmd.color} strokeWidth="1.75"><path d={cmd.icon} /></svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: i === selIdx ? 600 : 500, color: '#111827' }}>{cmd.label}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{cmd.desc}</div>
          </div>
        </button>
      ))}
      <div style={{ padding: '6px 12px 8px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: 12, marginTop: 2 }}>
        {[['↑↓', 'navigate'], ['↵', 'insert'], ['esc', 'close']].map(([k, v]) => (
          <span key={k} style={{ fontSize: 11, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 4 }}>
            <kbd style={{ background: '#F3F4F6', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 3, padding: '1px 5px', fontSize: 10, fontFamily: 'inherit' }}>{k}</kbd> {v}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Block content components ─────────────────────────────────────────────────
type CP = { cfg: Record<string, unknown>; upd: (k: string, v: unknown) => void; color: string }

function SectionContent({ cfg, upd }: CP) {
  return (
    <div>
      <input value={cfg.title as string} onChange={e => upd('title', e.target.value)} placeholder="Section title…"
        style={{ width: '100%', fontSize: 17, fontWeight: 700, color: '#111827', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', padding: '0' }} />
      <input value={cfg.subtitle as string} onChange={e => upd('subtitle', e.target.value)} placeholder="Subtitle or description (optional)…"
        style={{ width: '100%', fontSize: 13, color: '#6B7280', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', padding: '0', marginTop: 3 }} />
    </div>
  )
}

function IntroContent({ cfg, upd, color }: CP) {
  return (
    <textarea value={cfg.text as string} onChange={e => upd('text', e.target.value)} rows={3}
      placeholder="Add instructions or context for candidates…"
      style={{ ...IS }} onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
  )
}

function VideoContent({ cfg, upd, color }: CP) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <textarea value={cfg.question as string} onChange={e => upd('question', e.target.value)} rows={2}
        placeholder="Enter the video question…" style={{ ...IS }}
        onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { label: 'Max Duration (sec)', key: 'maxDuration', type: 'number', min: 10, max: 600 },
          { label: 'Attempts Allowed', key: 'attempts', type: 'number', min: 1, max: 10 },
        ].map(f => (
          <label key={f.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</span>
            <input type={f.type} value={cfg[f.key] as number} min={f.min} max={f.max}
              onChange={e => upd(f.key, +e.target.value)} style={{ ...IS }}
              onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
          </label>
        ))}
      </div>
      <input value={cfg.note as string} onChange={e => upd('note', e.target.value)}
        placeholder="Candidate note (optional) — e.g. 'You may re-record before submitting'"
        style={{ ...IS }} onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
    </div>
  )
}

function MCContent({ cfg, upd, color }: CP) {
  const opts = cfg.options as string[]
  const correct = cfg.correct as number
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <textarea value={cfg.question as string} onChange={e => upd('question', e.target.value)} rows={2}
        placeholder="Enter the question…" style={{ ...IS }}
        onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {opts.map((opt, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => upd('correct', correct === i ? -1 : i)}
              style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                border: `2px solid ${correct === i ? color : 'rgba(0,0,0,0.2)'}`,
                background: correct === i ? color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {correct === i && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
            </button>
            <input value={opt} onChange={e => { const n = [...opts]; n[i] = e.target.value; upd('options', n) }}
              placeholder={`Option ${i + 1}…`} style={{ ...IS, flex: 1 }}
              onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
            {opts.length > 2 && (
              <button onClick={() => { upd('options', opts.filter((_, j) => j !== i)); if (correct === i) upd('correct', -1) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '2px 4px', lineHeight: 1 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => upd('options', [...opts, ''])}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: `1.5px dashed ${color}60`, background: `${color}08`, color, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add option
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: '#6B7280' }}>
          <input type="checkbox" checked={cfg.multi as boolean} onChange={e => upd('multi', e.target.checked)}
            style={{ accentColor: color, width: 14, height: 14 }} />
          Allow multiple selections
        </label>
      </div>
    </div>
  )
}

function OpenTextContent({ cfg, upd, color }: CP) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <textarea value={cfg.question as string} onChange={e => upd('question', e.target.value)} rows={2}
        placeholder="Enter the open-text question…" style={{ ...IS }}
        onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>Word limit:</span>
        <input type="number" value={cfg.wordLimit as number} onChange={e => upd('wordLimit', +e.target.value)}
          style={{ ...IS, width: 90 }} min={50} step={50}
          onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
      </label>
    </div>
  )
}

function ScenarioContent({ cfg, upd, color }: CP) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input value={cfg.title as string} onChange={e => upd('title', e.target.value)} placeholder="Scenario title…"
        style={{ ...IS, fontWeight: 600 }} onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
      <textarea value={cfg.context as string} onChange={e => upd('context', e.target.value)} rows={3}
        placeholder="Describe the situation / context for the candidate…" style={{ ...IS }}
        onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
      <textarea value={cfg.question as string} onChange={e => upd('question', e.target.value)} rows={2}
        placeholder="What should the candidate do or decide?" style={{ ...IS }}
        onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
    </div>
  )
}

function CaseStudyContent({ cfg, upd, color }: CP) {
  const tasks = cfg.tasks as string[]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input value={cfg.title as string} onChange={e => upd('title', e.target.value)} placeholder="Case study title…"
        style={{ ...IS, fontWeight: 600 }} onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
      <textarea value={cfg.context as string} onChange={e => upd('context', e.target.value)} rows={4}
        placeholder="Paste the case context, data, or document excerpt here…" style={{ ...IS }}
        onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Tasks</div>
        {tasks.map((task, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 16 }}>{i + 1}.</span>
            <input value={task} onChange={e => { const n = [...tasks]; n[i] = e.target.value; upd('tasks', n) }}
              placeholder={`Task ${i + 1}…`} style={{ ...IS, flex: 1 }}
              onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
            {tasks.length > 1 && (
              <button onClick={() => upd('tasks', tasks.filter((_, j) => j !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '2px 4px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            )}
          </div>
        ))}
        <button onClick={() => upd('tasks', [...tasks, ''])}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 5, border: `1.5px dashed ${color}60`, background: `${color}08`, color, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add task
        </button>
      </div>
    </div>
  )
}

function DocCheckContent({ cfg, upd, color }: CP) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input value={cfg.label as string} onChange={e => upd('label', e.target.value)}
        placeholder="Label — e.g. Upload your diploma or transcript" style={{ ...IS }}
        onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
      <input value={cfg.instructions as string} onChange={e => upd('instructions', e.target.value)}
        placeholder="Instructions (optional)" style={{ ...IS }}
        onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input value={cfg.accepted as string} onChange={e => upd('accepted', e.target.value)}
          placeholder="Accepted types: PDF, JPG, PNG" style={{ ...IS, flex: 1 }}
          onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap', cursor: 'pointer' }}>
          <input type="checkbox" checked={cfg.required as boolean} onChange={e => upd('required', e.target.checked)}
            style={{ accentColor: color, width: 14, height: 14 }} />
          Required
        </label>
      </div>
    </div>
  )
}

function FileUploadContent({ cfg, upd, color }: CP) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input value={cfg.label as string} onChange={e => upd('label', e.target.value)}
        placeholder="Label — e.g. Upload your portfolio PDF" style={{ ...IS }}
        onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
      <div style={{ display: 'flex', gap: 10 }}>
        <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accepted Types</span>
          <input value={cfg.types as string} onChange={e => upd('types', e.target.value)}
            placeholder="PDF, DOCX, XLSX" style={{ ...IS }}
            onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
        </label>
        <label style={{ width: 100, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max Size</span>
          <input value={cfg.maxSize as string} onChange={e => upd('maxSize', e.target.value)}
            placeholder="10MB" style={{ ...IS }}
            onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
        </label>
      </div>
    </div>
  )
}

function ScoringRuleContent({ cfg, upd, color }: CP) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <label style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pillar Name</span>
          <input value={cfg.pillar as string} onChange={e => upd('pillar', e.target.value)}
            placeholder="e.g. Education Fit, Industry Experience" style={{ ...IS }}
            onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
        </label>
        <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weight (%)</span>
          <input type="number" value={cfg.weight as number} onChange={e => upd('weight', +e.target.value)}
            style={{ ...IS }} min={0} max={100}
            onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
        </label>
        <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Passing (1–5)</span>
          <input type="number" value={cfg.passing as number} onChange={e => upd('passing', +e.target.value)}
            style={{ ...IS }} min={1} max={5} step={0.1}
            onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
        </label>
      </div>
      <input value={cfg.note as string} onChange={e => upd('note', e.target.value)}
        placeholder="Rubric note — e.g. describe scoring anchors for 1, 3, 5" style={{ ...IS }}
        onFocus={e => focusColor(e.target, color)} onBlur={e => blurReset(e.target)} />
    </div>
  )
}

// ─── Block Card ───────────────────────────────────────────────────────────────
function BlockCard({ block, index, total, onUpdate, onDelete, onMove }: {
  block: Block; index: number; total: number
  onUpdate: (id: string, cfg: Record<string, unknown>) => void
  onDelete: (id: string) => void
  onMove: (id: string, dir: 'up' | 'down') => void
}) {
  const [hover, setHover] = useState(false)
  const color = COLOR[block.type]
  const label = LABEL[block.type]
  const upd = (k: string, v: unknown) => onUpdate(block.id, { ...block.cfg, [k]: v })
  const cp: CP = { cfg: block.cfg, upd, color }

  const renderContent = () => {
    switch (block.type) {
      case 'section':          return <SectionContent {...cp} />
      case 'intro':            return <IntroContent {...cp} />
      case 'video':            return <VideoContent {...cp} />
      case 'multiple-choice':  return <MCContent {...cp} />
      case 'open-text':        return <OpenTextContent {...cp} />
      case 'scenario':         return <ScenarioContent {...cp} />
      case 'case-study':       return <CaseStudyContent {...cp} />
      case 'document-check':   return <DocCheckContent {...cp} />
      case 'file-upload':      return <FileUploadContent {...cp} />
      case 'scoring-rule':     return <ScoringRuleContent {...cp} />
    }
  }

  const controls = hover && (
    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
      {index > 0 && (
        <button onClick={() => onMove(block.id, 'up')} style={iconBtn} title="Move up">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="18 15 12 9 6 15" /></svg>
        </button>
      )}
      {index < total - 1 && (
        <button onClick={() => onMove(block.id, 'down')} style={iconBtn} title="Move down">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
      )}
      <button onClick={() => onDelete(block.id)} style={{ ...iconBtn, color: '#DC2626' }} title="Delete">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" /></svg>
      </button>
    </div>
  )

  // Section block — no card, just a styled heading row
  if (block.type === 'section') {
    return (
      <div className="fade-up" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '20px 0 10px', borderTop: `2px solid ${color}25`, marginTop: 8 }}>
        <div style={{ width: 3, height: 22, borderRadius: 2, background: color, flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
          {renderContent()}
        </div>
        {controls}
      </div>
    )
  }

  return (
    <div className="fade-up" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff', borderRadius: 10, overflow: 'hidden',
        border: `1px solid ${hover ? color + '45' : 'rgba(0,0,0,0.08)'}`,
        boxShadow: hover ? `0 2px 14px ${color}18, 0 1px 3px rgba(0,0,0,0.06)` : '0 1px 3px rgba(0,0,0,0.06)',
        display: 'flex', transition: 'border-color 0.15s, box-shadow 0.15s'
      }}>
      <div style={{ width: 4, background: color, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75"><path d={ICON[block.type]} /></svg>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</span>
          </div>
          {controls}
        </div>
        {renderContent()}
      </div>
    </div>
  )
}

// ─── Add Row (slash command trigger) ─────────────────────────────────────────
function AddRow({ onInsert }: { onInsert: (type: BlockType, text?: string) => void }) {
  const [value, setValue] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [selIdx, setSelIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const isSlash = value.startsWith('/')
  const query = isSlash ? value.slice(1) : ''
  // Show menu when value starts with '/' — no focus state dependency
  const showMenu = isSlash

  const filtered = CMDS.filter(c => {
    const q = query.toLowerCase()
    return !q || c.label.toLowerCase().includes(q) || c.kw.includes(q) || c.type.includes(q)
  })

  const insert = (type: BlockType) => {
    onInsert(type)
    setValue('')
    setSelIdx(0)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showMenu && filtered.length) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelIdx(i => Math.min(i + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelIdx(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter')     { e.preventDefault(); insert(filtered[selIdx]?.type ?? filtered[0].type) }
      if (e.key === 'Escape')    { setValue(''); setSelIdx(0) }
    } else if (e.key === 'Enter' && value.trim() && !isSlash) {
      e.preventDefault()
      onInsert('intro', value.trim())
      setValue('')
    }
  }

  // Close menu on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setValue('')
        setSelIdx(0)
      }
    }
    if (showMenu) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  useEffect(() => { setSelIdx(0) }, [query])

  return (
    <div ref={wrapRef} style={{ position: 'relative', marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderRadius: 8 }}>
        <button
          onMouseDown={e => { e.preventDefault(); setValue('/'); inputRef.current?.focus() }}
          style={{ width: 24, height: 24, borderRadius: 6, border: '1.5px dashed rgba(0,0,0,0.18)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.1s, border-color 0.1s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,81,209,0.07)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
        <input
          ref={inputRef}
          value={value}
          onChange={e => { setValue(e.target.value); setSelIdx(0) }}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={inputFocused ? "Type / for a block, or type to add an intro…" : "Press / or click + to insert a block…"}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#111827', fontFamily: 'inherit', padding: 0 }}
        />
        {value && (
          <button onClick={() => { setValue(''); setSelIdx(0) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '2px 4px', lineHeight: 1 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        )}
      </div>
      {showMenu && <SlashMenu query={query} selIdx={selIdx} onSelect={insert} />}
    </div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '10px 12px', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '10px 10px 10px 2px', width: 'fit-content' }}>
      <style>{`
        @keyframes copilot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: '#9CA3AF', display: 'block',
          animation: `copilot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`
        }} />
      ))}
    </div>
  )
}

// ─── Copilot Panel ────────────────────────────────────────────────────────────
// ─── Copilot types ────────────────────────────────────────────────────────────
type CopilotMode = 'generate_questions' | 'rubric' | 'intro' | 'improve_block' | 'harder_to_game' | 'variant' | 'chat'

interface QuestionSuggestion {
  title: string; prompt: string; whyItFits: string
  measures: string[]; blockType: string; difficulty: string; scoringNote: string
}
interface RubricDimension { name: string; weight: number; strong: string; neutral: string; weak: string; watchFor: string }
interface Improvement { blockRef: string; original: string; improved: string; whyBetter: string }

type ParsedAI =
  | { type: 'questions'; suggestions: QuestionSuggestion[] }
  | { type: 'rubric'; dimensions: RubricDimension[] }
  | { type: 'improvements'; suggestions: Improvement[] }
  | { type: 'intro'; text: string }
  | { type: 'text'; content: string }

interface CopilotMessage { role: 'user' | 'ai'; content: string; parsed?: ParsedAI; mode?: CopilotMode }

// ─── Measure tag colors ───────────────────────────────────────────────────────
const MEASURE_COLORS: Record<string, string> = {
  'Communication': '#2563EB', 'Empathy': '#059669', 'Judgment': '#D97706',
  'Professionalism': '#7C3AED', 'Critical Thinking': '#0891B2', 'Technical Reasoning': '#3451D1',
  'Integrity': '#9D174D', 'Grit': '#B45309', 'Adaptability': '#16A34A',
  'Collaboration': '#0369A1', 'Ethics': '#6D28D9', 'Problem Solving': '#0F766E',
}
const BLOCK_TYPE_MAP: Record<string, BlockType> = {
  'video': 'video', 'video response': 'video', 'multiple-choice': 'multiple-choice',
  'multiple choice': 'multiple-choice', 'open-text': 'open-text', 'open text': 'open-text',
  'scenario': 'scenario', 'case-study': 'case-study', 'case study': 'case-study',
  'document check': 'document-check',
}

// ─── Suggestion card ──────────────────────────────────────────────────────────
function QuestionCard({ s, onInsert }: { s: QuestionSuggestion; onInsert: (type: BlockType, cfg: Record<string, unknown>) => void }) {
  const [inserted, setInserted] = useState(false)
  const bt = BLOCK_TYPE_MAP[s.blockType?.toLowerCase()] || 'open-text'
  const diffColor = s.difficulty === 'Easy' ? '#059669' : s.difficulty === 'Challenging' ? '#DC2626' : '#D97706'

  const handleInsert = () => {
    const cfg: Record<string, unknown> = { ...DEFAULTS[bt] }
    if (bt === 'video') cfg.question = s.prompt
    else if (bt === 'multiple-choice') cfg.question = s.prompt
    else if (bt === 'open-text') cfg.question = s.prompt
    else if (bt === 'scenario') { cfg.title = s.title; cfg.question = s.prompt }
    else if (bt === 'case-study') { cfg.title = s.title; cfg.tasks = [s.prompt] }
    onInsert(bt, cfg)
    setInserted(true)
  }

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
      {/* Card header */}
      <div style={{ padding: '11px 13px 8px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#3451D1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.title}</div>
        <p style={{ fontSize: 12.5, color: '#111827', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>{s.prompt}</p>
      </div>
      {/* Meta */}
      <div style={{ padding: '8px 13px', background: '#FAFBFF' }}>
        <div style={{ fontSize: 10.5, color: '#6B7280', marginBottom: 5 }}><strong style={{ color: '#374151' }}>Why it fits:</strong> {s.whyItFits}</div>
        {/* Measures */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {(s.measures || []).map(m => (
            <span key={m} style={{
              fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20,
              background: `${MEASURE_COLORS[m] || '#6B7280'}15`,
              color: MEASURE_COLORS[m] || '#6B7280', border: `1px solid ${MEASURE_COLORS[m] || '#6B7280'}30`
            }}>{m}</span>
          ))}
        </div>
        {/* Block type + difficulty */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 10, background: 'rgba(52,81,209,0.08)', color: '#3451D1', padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>
            {s.blockType}
          </span>
          <span style={{ fontSize: 10, color: diffColor, fontWeight: 600 }}>● {s.difficulty}</span>
        </div>
        {/* Scoring note */}
        <div style={{ fontSize: 10.5, color: '#6B7280', fontStyle: 'italic', lineHeight: 1.4 }}>
          <strong style={{ fontStyle: 'normal', color: '#374151' }}>Scoring:</strong> {s.scoringNote}
        </div>
      </div>
      {/* Actions */}
      <div style={{ padding: '8px 13px', display: 'flex', gap: 6, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <button
          onClick={handleInsert}
          disabled={inserted}
          style={{
            flex: 1, padding: '6px 0', borderRadius: 6, border: 'none', cursor: inserted ? 'default' : 'pointer',
            background: inserted ? '#D1FAE5' : '#3451D1', color: inserted ? '#059669' : '#fff',
            fontSize: 11, fontWeight: 600, transition: 'all 0.15s'
          }}
        >{inserted ? '✓ Inserted' : '+ Insert question'}</button>
      </div>
    </div>
  )
}

function RubricCard({ d }: { d: RubricDimension }) {
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 10, marginBottom: 8, padding: '11px 13px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{d.name}</span>
        <span style={{ fontSize: 10.5, color: '#6B7280', fontWeight: 500 }}>Weight: {d.weight}%</span>
      </div>
      {[['Strong', d.strong, '#059669'], ['Neutral', d.neutral, '#D97706'], ['Weak', d.weak, '#DC2626']].map(([label, text, color]) => (
        <div key={label as string} style={{ marginBottom: 5 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: color as string }}>{label as string}</span>
          <p style={{ fontSize: 11, color: '#374151', margin: '2px 0 0', lineHeight: 1.45 }}>{text as string}</p>
        </div>
      ))}
      {d.watchFor && (
        <div style={{ marginTop: 6, padding: '5px 8px', background: '#FEF3C7', borderRadius: 6, fontSize: 10.5, color: '#92400E' }}>
          ⚠ {d.watchFor}
        </div>
      )}
    </div>
  )
}

function ImprovementCard({ s }: { s: Improvement }) {
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', borderRadius: 10, marginBottom: 8, padding: '11px 13px' }}>
      <div style={{ fontSize: 10.5, color: '#6B7280', marginBottom: 6 }}>{s.blockRef}</div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', marginBottom: 2 }}>Original</div>
        <p style={{ fontSize: 11.5, color: '#6B7280', margin: 0, lineHeight: 1.45, fontStyle: 'italic' }}>{s.original}</p>
      </div>
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#059669', marginBottom: 2 }}>Improved</div>
        <p style={{ fontSize: 11.5, color: '#111827', margin: 0, lineHeight: 1.45, fontWeight: 500 }}>{s.improved}</p>
      </div>
      <div style={{ fontSize: 10.5, color: '#6B7280', fontStyle: 'italic' }}>{s.whyBetter}</div>
    </div>
  )
}

function ParsedAIMessage({ parsed, onInsert }: { parsed: ParsedAI; onInsert: (type: BlockType, cfg: Record<string, unknown>) => void }) {
  if (parsed.type === 'questions') {
    return (
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
          {parsed.suggestions.length} Suggested Question{parsed.suggestions.length !== 1 ? 's' : ''}
        </div>
        {parsed.suggestions.map((s, i) => <QuestionCard key={i} s={s} onInsert={onInsert} />)}
      </div>
    )
  }
  if (parsed.type === 'rubric') {
    return (
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
          Scoring Rubric · {parsed.dimensions.length} dimensions
        </div>
        {parsed.dimensions.map((d, i) => <RubricCard key={i} d={d} />)}
      </div>
    )
  }
  if (parsed.type === 'improvements') {
    return (
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
          Suggested Improvements
        </div>
        {parsed.suggestions.map((s, i) => <ImprovementCard key={i} s={s} />)}
      </div>
    )
  }
  if (parsed.type === 'intro') {
    return (
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '12px 14px' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#2563EB', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggested Intro</div>
        <p style={{ fontSize: 12.5, color: '#1E3A8A', lineHeight: 1.6, margin: 0 }}>{parsed.text}</p>
      </div>
    )
  }
  // text fallback
  return <p style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{(parsed as { type: 'text'; content: string }).content}</p>
}

// ─── Copilot Panel ────────────────────────────────────────────────────────────
function CopilotPanel({
  blocks,
  messages,
  input,
  loading,
  program,
  onClose,
  onSend,
  onInputChange,
  onInsertBlock,
}: {
  blocks: Block[]
  messages: CopilotMessage[]
  input: string
  loading: boolean
  program: string
  onClose: () => void
  onSend: (msg: string, mode: CopilotMode) => void
  onInputChange: (val: string) => void
  onInsertBlock: (type: BlockType, cfg: Record<string, unknown>) => void
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 76) + 'px'
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (input.trim() && !loading) onSend(input.trim(), 'chat')
    }
  }

  const quickActions: { label: string; mode: CopilotMode; msg: string }[] = [
    { label: '✦ Generate questions', mode: 'generate_questions', msg: 'Generate 3 strong assessment questions.' },
    { label: '⬡ Scoring rubric', mode: 'rubric', msg: 'Generate a scoring rubric for this assessment.' },
    { label: '◎ Suggest intro', mode: 'intro', msg: 'Write a professional intro block for candidates.' },
    { label: '↑ Improve blocks', mode: 'improve_block', msg: 'Improve the existing blocks on the canvas.' },
    { label: '⊘ Harder to game', mode: 'harder_to_game', msg: 'Generate questions that are harder to fake.' },
    { label: '⊕ Create variants', mode: 'variant', msg: 'Create question variants for the existing blocks.' },
  ]

  return (
    <div style={{ width: 320, borderLeft: '1px solid rgba(0,0,0,0.08)', background: '#F8F9FB', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '13px 14px 10px', borderBottom: '1px solid rgba(0,0,0,0.07)', background: '#fff', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 1 }}>✨ AI Copilot</div>
          {program ? (
            <div style={{ fontSize: 10.5, color: '#3451D1', fontWeight: 500 }}>{program.split(' — ')[0]}</div>
          ) : (
            <div style={{ fontSize: 10.5, color: '#9CA3AF' }}>Powered by Gemini</div>
          )}
        </div>
        <button onClick={onClose} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)', background: '#F9FAFB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', flexShrink: 0 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: '#fff', display: 'flex', flexWrap: 'wrap', gap: 5, flexShrink: 0 }}>
        {quickActions.map(qa => (
          <button key={qa.label} onClick={() => { if (!loading) onSend(qa.msg, qa.mode) }} disabled={loading}
            style={{ padding: '4px 9px', borderRadius: 20, border: '1px solid rgba(52,81,209,0.18)', background: 'rgba(52,81,209,0.04)', color: '#3451D1', fontSize: 10.5, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.5 : 1, whiteSpace: 'nowrap' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(52,81,209,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(52,81,209,0.04)' }}
          >{qa.label}</button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', padding: '24px 12px', gap: 10 }}>
            <div style={{ fontSize: 28 }}>✨</div>
            <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.6, margin: 0 }}>
              {program ? `Ready to generate content for ${program.split(' — ')[0]}.` : 'Select a program, then use the actions above to generate questions, rubrics, or intros.'}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === 'user' ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ maxWidth: '85%', padding: '7px 11px', fontSize: 12, lineHeight: 1.5, background: '#3451D1', color: '#fff', borderRadius: '10px 10px 2px 10px' }}>
                  {msg.content}
                </div>
              </div>
            ) : (
              <div>
                {msg.parsed ? (
                  <ParsedAIMessage parsed={msg.parsed} onInsert={onInsertBlock} />
                ) : (
                  <div style={{ padding: '10px 12px', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '10px 10px 10px 2px', fontSize: 12.5, color: '#374151', lineHeight: 1.55 }}>
                    {msg.content}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '8px 10px 10px', borderTop: '1px solid rgba(0,0,0,0.07)', background: '#fff', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 7, alignItems: 'flex-end', background: '#F9FAFB', border: '1px solid rgba(0,0,0,0.11)', borderRadius: 9, padding: '6px 8px 6px 10px' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={program ? `Ask about ${program.split(' — ')[0]}…` : 'Ask the AI copilot…'}
            rows={1}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 12.5, color: '#111827', fontFamily: 'inherit', resize: 'none', lineHeight: '20px', padding: 0, overflowY: 'hidden' }}
          />
          <button
            onClick={() => { if (input.trim() && !loading) onSend(input.trim(), 'chat') }}
            disabled={!input.trim() || loading}
            style={{
              width: 28, height: 28,
              borderRadius: 7,
              border: 'none',
              background: !input.trim() || loading ? '#E5E7EB' : '#3451D1',
              color: !input.trim() || loading ? '#9CA3AF' : '#fff',
              cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div style={{ fontSize: 10.5, color: '#C4C9D4', marginTop: 5, textAlign: 'center' }}>
          Enter to send · Shift+Enter for newline
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [blocks, setBlocks] = useState<Block[]>([])
  const [asmtName, setAsmtName] = useState('Untitled Assessment')
  const [programLabel, setProgramLabel] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [saved, setSaved] = useState(false)
  const [publishDialog, setPublishDialog] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  // Copilot state
  const [showCopilot, setShowCopilot] = useState(false)
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([])
  const [copilotInput, setCopilotInput] = useState('')
  const [copilotLoading, setCopilotLoading] = useState(false)

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('pa-assessments') || '[]')
      const found = stored.find((a: { id: string }) => a.id === id)
      if (found) {
        setAsmtName(found.name || 'Untitled Assessment')
        setProgramLabel(found.programLabel || '')
        if (found.builderBlocks?.length) setBlocks(found.builderBlocks)
      }
    } catch {}
  }, [id])

  const insertBlock = (type: BlockType, text?: string) => {
    const newBlock: Block = {
      id: uid(), type,
      cfg: { ...DEFAULTS[type], ...(text && type === 'intro' ? { text } : {}) }
    }
    setBlocks(prev => [...prev, newBlock])
    setSaved(false)
  }

  const updateBlock = (blockId: string, cfg: Record<string, unknown>) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, cfg } : b))
    setSaved(false)
  }

  const deleteBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId))
    setSaved(false)
  }

  const moveBlock = (blockId: string, dir: 'up' | 'down') => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === blockId)
      const next = [...prev]
      const swap = dir === 'up' ? idx - 1 : idx + 1
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
    setSaved(false)
  }

  const save = (publish?: boolean) => {
    try {
      const stored = JSON.parse(localStorage.getItem('pa-assessments') || '[]')
      const idx = stored.findIndex((a: { id: string }) => a.id === id)
      if (idx !== -1) {
        stored[idx].builderBlocks = blocks
        stored[idx].name = asmtName
        if (publish) stored[idx].published = true
      } else {
        stored.push({ id, name: asmtName, programLabel, builderBlocks: blocks, ...(publish ? { published: true } : {}) })
      }
      localStorage.setItem('pa-assessments', JSON.stringify(stored))
    } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sendCopilotMessage = async (msg: string, mode: CopilotMode = 'chat') => {
    setCopilotLoading(true)
    setCopilotMessages(prev => [...prev, { role: 'user', content: msg, mode }])
    setCopilotInput('')

    const existingBlockTitles = blocks.map(b =>
      (b.cfg.question as string) || (b.cfg.title as string) || b.type
    ).filter(Boolean)

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, mode, program: programLabel, existingBlockTitles }),
      })
      const data = await res.json()
      if (data.error) {
        setCopilotMessages(prev => [...prev, { role: 'ai', content: data.error }])
      } else {
        setCopilotMessages(prev => [...prev, { role: 'ai', content: '', parsed: data.parsed }])
      }
    } catch {
      setCopilotMessages(prev => [...prev, { role: 'ai', content: 'Failed to connect. Please try again.' }])
    }

    setCopilotLoading(false)
  }

  const insertBlockFromCopilot = (type: BlockType, cfg: Record<string, unknown>) => {
    const newBlock: Block = { id: uid(), type, cfg: { ...DEFAULTS[type], ...cfg } }
    setBlocks(prev => [...prev, newBlock])
    setSaved(false)
  }

  const programShort = programLabel.split(' — ')[0]

  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/take/${id}` : `/take/${id}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#F6F7F9' }}>

      {/* ── Publish Dialog ── */}
      {publishDialog && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: 480, maxWidth: 'calc(100vw - 32px)',
            padding: '36px 36px 32px', position: 'relative',
            boxShadow: '0 12px 48px rgba(0,0,0,0.18)'
          }}>
            {/* Close */}
            <button
              onClick={() => setPublishDialog(false)}
              style={{
                position: 'absolute', top: 16, right: 16,
                width: 28, height: 28, borderRadius: 7,
                border: '1px solid rgba(0,0,0,0.1)', background: '#F3F4F6',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: '#DCFCE7',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Assessment Published!
              </h2>
              <p style={{ fontSize: 13.5, color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                Your assessment is ready to share with candidates.
              </p>
            </div>

            {/* Share Link */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11.5, fontWeight: 600, color: '#6B7280', letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 8px' }}>
                Shareable Link
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{
                  flex: 1, background: '#F3F4F6', borderRadius: 8, padding: '9px 12px',
                  fontSize: 12.5, color: '#374151', fontFamily: 'monospace',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {shareLink}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink).then(() => {
                      setLinkCopied(true)
                      setTimeout(() => setLinkCopied(false), 2000)
                    })
                  }}
                  style={{
                    padding: '9px 14px', borderRadius: 8,
                    border: `1px solid ${linkCopied ? '#16A34A' : 'rgba(0,0,0,0.12)'}`,
                    background: linkCopied ? '#DCFCE7' : '#fff',
                    color: linkCopied ? '#16A34A' : '#374151',
                    fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.15s', whiteSpace: 'nowrap', flexShrink: 0
                  }}
                >
                  {linkCopied ? '✓ Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => window.open(`/take/${id}?preview=true`, '_blank')}
                style={{
                  width: '100%', padding: '11px 0', borderRadius: 9,
                  border: '1.5px solid rgba(52,81,209,0.3)', background: 'rgba(52,81,209,0.05)',
                  color: 'var(--accent)', fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                Preview as Student ↗
              </button>
              <button
                onClick={() => window.open('/marketplace', '_blank')}
                style={{
                  width: '100%', padding: '11px 0', borderRadius: 9,
                  border: '1.5px solid rgba(22,163,74,0.3)', background: 'rgba(22,163,74,0.05)',
                  color: '#16A34A', fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                View Student Marketplace ↗
              </button>
              <button
                onClick={() => { setPublishDialog(false); window.location.href = '/admin' }}
                style={{
                  width: '100%', padding: '11px 0', borderRadius: 9,
                  border: '1px solid rgba(0,0,0,0.1)', background: '#F9FAFB',
                  color: '#6B7280', fontSize: 13.5, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
              >
                ← Back to Admin Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px', height: 52, background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.08)', flexShrink: 0, gap: 8 }}>
        {/* Logo */}
        <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" style={{ flexShrink: 0 }}><line x1="7" y1="3" x2="17" y2="21" /></svg>

        {/* Editable name */}
        {editingName ? (
          <input value={asmtName} onChange={e => setAsmtName(e.target.value)} autoFocus
            onBlur={() => setEditingName(false)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingName(false) }}
            style={{ fontSize: 14, fontWeight: 600, color: '#111827', border: '1px solid var(--accent)', borderRadius: 6, padding: '3px 8px', outline: 'none', background: 'rgba(52,81,209,0.05)', maxWidth: 280, fontFamily: 'inherit' }} />
        ) : (
          <button onClick={() => setEditingName(true)}
            style={{ fontSize: 14, fontWeight: 600, color: '#111827', background: 'none', border: 'none', cursor: 'text', padding: '3px 6px', borderRadius: 6, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            {asmtName}
          </button>
        )}
        {programShort && (
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: 'rgba(52,81,209,0.08)', color: 'var(--accent)', fontWeight: 500, flexShrink: 0 }}>{programShort}</span>
        )}
        <span style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>{blocks.length > 0 ? `${blocks.length} block${blocks.length !== 1 ? 's' : ''}` : 'Empty'}</span>

        <div style={{ flex: 1 }} />

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <a href="/admin" style={{ fontSize: 12, color: 'var(--text2, #6B7280)', textDecoration: 'none', whiteSpace: 'nowrap' }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
            Admin →
          </a>
          <button onClick={() => router.push(`/assessments/${id}/modules`)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 7, border: '1px solid rgba(0,0,0,0.12)', background: 'transparent', color: '#6B7280', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            Module Library
          </button>
          <button
            onClick={() => setShowCopilot(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px',
              borderRadius: 7,
              border: showCopilot ? 'none' : '1px solid rgba(0,0,0,0.12)',
              background: showCopilot ? 'var(--accent)' : 'transparent',
              color: showCopilot ? '#fff' : '#6B7280',
              fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              transition: 'all 0.15s',
            }}
          >
            ✨ AI Copilot
          </button>
          <button
            onClick={() => { window.open(`/take/${id}?preview=true`, '_blank') }}
            style={{ padding: '5px 11px', borderRadius: 7, border: '1px solid rgba(0,0,0,0.12)', background: 'transparent', color: '#6B7280', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            Preview
          </button>
          <button onClick={() => save()}
            style={{ padding: '5px 11px', borderRadius: 7, border: '1px solid rgba(0,0,0,0.12)', background: 'transparent', color: '#6B7280', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, transition: 'background 0.2s' }}>
            {saved && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>}
            {saved ? 'Saved ✓' : 'Save'}
          </button>
          <button onClick={() => { save(true); setPublishDialog(true) }}
            style={{ padding: '5px 16px', borderRadius: 7, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>
            Publish
          </button>
        </div>
      </div>

      {/* ── Body (canvas + optional copilot) ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Canvas ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '48px 24px 100px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>

            {/* Empty state */}
            {blocks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '56px 0 36px', pointerEvents: 'none', userSelect: 'none' }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.25" style={{ margin: '0 auto 14px', display: 'block' }}>
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#9CA3AF', marginBottom: 6 }}>Start building your assessment</p>
                <p style={{ fontSize: 13, color: '#C4C9D4', lineHeight: 1.6 }}>
                  Type <kbd style={{ background: '#F3F4F6', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 4, padding: '1px 6px', fontSize: 12, fontFamily: 'monospace', color: '#6B7280' }}>/</kbd> below to insert a block · <kbd style={{ background: '#F3F4F6', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 4, padding: '1px 6px', fontSize: 12, fontFamily: 'monospace', color: '#6B7280' }}>Enter</kbd> to select
                </p>
              </div>
            )}

            {/* Blocks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {blocks.map((block, i) => (
                <BlockCard key={block.id} block={block} index={i} total={blocks.length}
                  onUpdate={updateBlock} onDelete={deleteBlock} onMove={moveBlock} />
              ))}
            </div>

            {/* Slash row */}
            <AddRow onInsert={insertBlock} />

            {/* Hint strip after first block */}
            {blocks.length > 0 && blocks.length < 3 && (
              <div style={{ marginTop: 24, padding: '10px 14px', borderRadius: 8, background: 'rgba(52,81,209,0.05)', border: '1px solid rgba(52,81,209,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.75" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{ fontSize: 12, color: 'var(--accent)' }}>
                  Try <code style={{ fontFamily: 'monospace', background: 'rgba(52,81,209,0.08)', padding: '1px 5px', borderRadius: 3 }}>/video</code>, <code style={{ fontFamily: 'monospace', background: 'rgba(52,81,209,0.08)', padding: '1px 5px', borderRadius: 3 }}>/section</code>, or <code style={{ fontFamily: 'monospace', background: 'rgba(52,81,209,0.08)', padding: '1px 5px', borderRadius: 3 }}>/scoring-rule</code> — hover blocks to move or delete
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── AI Copilot Panel ── */}
        {showCopilot && (
          <CopilotPanel
            blocks={blocks}
            messages={copilotMessages}
            input={copilotInput}
            loading={copilotLoading}
            program={programLabel}
            onClose={() => setShowCopilot(false)}
            onSend={sendCopilotMessage}
            onInputChange={setCopilotInput}
            onInsertBlock={insertBlockFromCopilot}
          />
        )}
      </div>
    </div>
  )
}
