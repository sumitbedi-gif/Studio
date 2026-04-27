'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, Wand2, X, Check, ArrowUp, Pencil } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Rules {
  url: string
  dateStart: string
  dateEnd: string
  occurrences: number
  audience: string
  trigger: string | null
  time: string | null
}

const defaults: Rules = {
  url: 'this page',
  dateStart: 'May 1, 2026',
  dateEnd: 'May 31, 2026',
  occurrences: 4,
  audience: 'All users',
  trigger: null,
  time: null,
}

// Preset states for the bottom switcher
const presets: { label: string; rules: Rules }[] = [
  { label: 'Default',    rules: defaults },
  { label: 'Sales team', rules: { ...defaults, audience: 'Sales team' } },
  { label: 'With trigger', rules: { ...defaults, trigger: 'Login' } },
  { label: '7 times',     rules: { ...defaults, occurrences: 7 } },
]

// ─── Flatten rules → plain text sentence ──────────────────────────────────────

function flattenRules(rules: Rules): string {
  let text = `Show this popup on ${rules.url} from ${rules.dateStart} to ${rules.dateEnd}`
  if (rules.trigger) text += `, when the user clicks ${rules.trigger}`
  if (rules.time) text += `, at ${rules.time}`
  text += `, up to ${rules.occurrences} times per user, for ${rules.audience}.`
  return text
}

// ─── Parse the edited sentence → new rules ────────────────────────────────────

function parseRulesFromText(text: string, fallback: Rules): Rules {
  const t = text.toLowerCase()
  const next = { ...fallback }

  // Occurrences
  const occMatch = t.match(/(?:up to\s+)?(\d+)\s*(?:occurrence|time)/)
  if (occMatch) next.occurrences = parseInt(occMatch[1])

  // Audience — the word after "for"
  const audMatch = t.match(/for\s+([a-z][a-z\s]+?)(?:\.|,|$)/i)
  if (audMatch) {
    const raw = audMatch[1].trim()
    if (raw.includes('sales')) next.audience = 'Sales team'
    else if (raw.includes('engineering')) next.audience = 'Engineering'
    else if (raw.includes('marketing')) next.audience = 'Marketing'
    else if (raw.includes('premium')) next.audience = 'Premium users'
    else if (raw.includes('enterprise')) next.audience = 'Enterprise accounts'
    else if (raw.includes('admin')) next.audience = 'Admins'
    else if (raw.includes('all')) next.audience = 'All users'
    else next.audience = raw.replace(/\b\w/g, (c) => c.toUpperCase())
  }

  // Trigger — "clicks X" or "click X"
  const trigMatch = t.match(/click(?:s)?\s+(?:the\s+)?([a-z][a-z\s]+?)(?:\s+button)?(?:\.|,|$)/i)
  if (trigMatch) {
    const raw = trigMatch[1].trim()
    next.trigger = raw.replace(/\b\w/g, (c) => c.toUpperCase())
  } else if (!/click/i.test(t)) {
    // If the user removed the "clicks X" portion entirely, drop trigger
    next.trigger = null
  }

  // Dates — "from X to Y"
  const dateMatch = t.match(/from\s+([a-z]+\s+\d+(?:,\s*\d{4})?)\s+to\s+([a-z]+\s+\d+(?:,\s*\d{4})?)/i)
  if (dateMatch) {
    const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase())
    next.dateStart = cap(dateMatch[1]).includes(',') ? cap(dateMatch[1]) : `${cap(dateMatch[1])}, 2026`
    next.dateEnd = cap(dateMatch[2]).includes(',') ? cap(dateMatch[2]) : `${cap(dateMatch[2])}, 2026`
  }

  // URL — the phrase after "on" before "from"
  const urlMatch = t.match(/on\s+(.+?)\s+from/)
  if (urlMatch) next.url = urlMatch[1].trim().replace(/\b\w/g, (c, i) => i === 0 ? c : c)

  // Time — "at X pm/am", "show at X", "between X-Y", or bare "X pm/am"
  const timeRangeMatch = t.match(/(?:between\s+|from\s+)(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s+(?:to|and|-)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i)
  const timeAtMatch = t.match(/(?:\s|^)at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i)
  const timeBareMatch = t.match(/(?:show\s+.*?)?(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s+daily/i)

  if (timeRangeMatch) {
    next.time = `${timeRangeMatch[1].toUpperCase().replace(/\s+/g, '')} – ${timeRangeMatch[2].toUpperCase().replace(/\s+/g, '')}`
  } else if (timeAtMatch) {
    next.time = timeAtMatch[1].toUpperCase().replace(/\s+/g, '')
  } else if (timeBareMatch) {
    next.time = timeBareMatch[1].toUpperCase().replace(/\s+/g, '')
  } else if (!/\d+\s*(am|pm)/i.test(t)) {
    // If the user removed all time references, drop it
    next.time = null
  }

  return next
}

// ─── Pill ─────────────────────────────────────────────────────────────────────

function Pill({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  const [hover, setHover] = useState(false)
  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={highlight ? 'pill-pulse' : undefined}
      style={{
        display: 'inline',
        background: hover ? 'rgba(15, 23, 42, 0.07)' : 'rgba(15, 23, 42, 0.04)',
        color: '#27272A',
        border: `1px solid ${hover ? 'rgba(15, 23, 42, 0.12)' : 'rgba(15, 23, 42, 0.06)'}`,
        borderRadius: 5,
        padding: '0px 6px 1px',
        margin: '0 1px',
        fontSize: 13,
        fontWeight: 550,
        fontFamily: 'inherit',
        verticalAlign: 'baseline',
        letterSpacing: '-0.008em',
        lineHeight: 1.4,
        cursor: 'pointer',
        transition: 'background 160ms, border-color 160ms',
      }}
    >
      {children}
    </span>
  )
}

// ─── Sentence ─────────────────────────────────────────────────────────────────

function SummarySentence({ rules, highlighted }: { rules: Rules; highlighted: Set<string> }) {
  return (
    <>
      Show this popup on <Pill highlight={highlighted.has('url')}>{rules.url}</Pill>
      {' '}from <Pill highlight={highlighted.has('dates')}>{rules.dateStart}</Pill>
      {' '}to <Pill highlight={highlighted.has('dates')}>{rules.dateEnd}</Pill>
      {rules.trigger && (
        <>
          , when the user clicks <Pill highlight={highlighted.has('trigger')}>{rules.trigger}</Pill>
        </>
      )}
      {rules.time && (
        <>
          , at <Pill highlight={highlighted.has('time')}>{rules.time}</Pill>
        </>
      )}
      , up to <Pill highlight={highlighted.has('occurrences')}>{rules.occurrences} times</Pill>
      {' '}per user, for <Pill highlight={highlighted.has('audience')}>{rules.audience}</Pill>.
    </>
  )
}

// ─── Main playground ──────────────────────────────────────────────────────────

export default function Playground() {
  const [rules, setRules] = useState<Rules>(defaults)
  const [mode, setMode] = useState<'view' | 'edit' | 'processing'>('view')
  const [prompt, setPrompt] = useState('')
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState(false)
  const [activePreset, setActivePreset] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (mode === 'edit') {
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }, [mode])

  const handleEdit = () => {
    setPrompt(flattenRules(rules))
    setMode('edit')
  }

  const handleCancel = () => {
    setPrompt('')
    setMode('view')
  }

  const handleSubmit = () => {
    const text = prompt.trim()
    if (!text) return
    setMode('processing')
    setTimeout(() => {
      const next = parseRulesFromText(text, rules)
      const changed = new Set<string>()
      if (next.occurrences !== rules.occurrences) changed.add('occurrences')
      if (next.audience !== rules.audience) changed.add('audience')
      if (next.trigger !== rules.trigger) changed.add('trigger')
      if (next.dateStart !== rules.dateStart || next.dateEnd !== rules.dateEnd) changed.add('dates')
      if (next.url !== rules.url) changed.add('url')
      if (next.time !== rules.time) changed.add('time')
      setRules(next)
      setHighlighted(changed)
      setMode('view')
      setToast(true)
      setTimeout(() => setHighlighted(new Set()), 900)
      setTimeout(() => setToast(false), 2400)
    }, 900)
  }

  const applyPreset = (i: number) => {
    setActivePreset(i)
    setRules(presets[i].rules)
    setMode('view')
    setPrompt('')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(180deg, #F8F8F6 0%, #EFEFED 100%)',
      fontFamily: "'Inter', -apple-system, sans-serif",
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 32,
    }}>
      {/* Keyframes */}
      <style>{`
        @keyframes pillPulse {
          0%   { background: #DCFCE7; color: #16A34A; box-shadow: 0 0 0 2px #BBF7D0; }
          60%  { background: #DCFCE7; color: #16A34A; box-shadow: 0 0 0 2px #BBF7D0; }
          100% { background: rgba(15, 23, 42, 0.04); color: #27272A; box-shadow: 0 0 0 0 transparent; }
        }
        .pill-pulse { animation: pillPulse 1100ms ease-out; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 320ms ease-out; }

        @keyframes toastSlide {
          0%   { opacity: 0; transform: translate(-50%, 12px); }
          10%  { opacity: 1; transform: translate(-50%, 0); }
          90%  { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, 12px); }
        }
        .toast-slide { animation: toastSlide 2.4s cubic-bezier(0.32,0,0.15,1) forwards; }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .typing-cursor { display: inline-block; color: #2563EB; animation: blink 0.65s ease infinite; }

        @keyframes ringSpin { to { transform: rotate(360deg); } }
        .ring-spin { animation: ringSpin 1.2s linear infinite; }
      `}</style>

      {/* Title */}
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
          Playground
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.02em' }}>
          Summary card ↔ Edit prompt
        </div>
        <div style={{ fontSize: 13, color: '#6B7280', marginTop: 6, maxWidth: 460 }}>
          Click the pencil to morph the card into a prompt. Type something like &quot;show this for 7 occurrences&quot; or &quot;show this to Sales&quot; and hit submit.
        </div>
      </div>

      {/* Studio card */}
      <div style={{
        width: 440,
        minHeight: 240,
        position: 'relative',
        background: 'linear-gradient(180deg, #FBFCFE 0%, #F1F5FB 100%)',
        border: '1px solid rgba(37, 99, 235, 0.10)',
        borderRadius: 18,
        padding: '28px 26px 22px',
        boxShadow:
          '0 1px 0 rgba(255, 255, 255, 0.7) inset, ' +
          '0 1px 2px rgba(15, 23, 42, 0.04), ' +
          '0 8px 24px rgba(37, 99, 235, 0.06), ' +
          '0 24px 48px rgba(15, 23, 42, 0.06)',
      }}>
        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '70%', height: '50%',
          background: 'radial-gradient(80% 100% at 100% 0%, rgba(37, 99, 235, 0.06) 0%, transparent 70%)',
          borderRadius: '0 18px 0 0',
          pointerEvents: 'none',
        }} />

        {/* Pencil button (only in view mode) */}
        {mode === 'view' && (
          <button
            onClick={handleEdit}
            title="Edit with AI"
            style={{
              position: 'absolute', top: 12, right: 12, zIndex: 5,
              width: 28, height: 28,
              borderRadius: 7,
              background: 'transparent',
              color: '#6B7280',
              border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 150ms, color 150ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.06)'; e.currentTarget.style.color = '#1A1A1A' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280' }}
          >
            <Pencil size={13} strokeWidth={2.2} />
          </button>
        )}

        {/* View / Edit / Processing — same container, morphing content */}
        {mode === 'view' && (
          <div key="view" className="fade-in" style={{
            fontSize: 14.5, lineHeight: 1.9, color: '#18181B',
            fontWeight: 400, letterSpacing: '-0.011em',
          }}>
            <SummarySentence rules={rules} highlighted={highlighted} />
          </div>
        )}

        {mode === 'edit' && (
          <div key="edit" className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Textarea styled to match the summary sentence — IS the sentence, editable */}
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSubmit() }
                if (e.key === 'Escape') handleCancel()
              }}
              rows={5}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                padding: 0,
                margin: 0,
                fontSize: 14.5,
                lineHeight: 1.9,
                color: '#18181B',
                fontFamily: "'Inter', -apple-system, sans-serif",
                letterSpacing: '-0.011em',
                fontWeight: 400,
                background: 'transparent',
                resize: 'none',
                minHeight: 90,
              }}
            />
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: 12, borderTop: '1px solid rgba(37, 99, 235, 0.10)',
            }}>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                <Sparkles size={10} strokeWidth={2.4} style={{ display: 'inline-block', verticalAlign: '-1px', marginRight: 4, color: '#2563EB' }} />
                Edit the sentence — add, remove, or change anything
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={handleCancel}
                  style={{
                    background: 'transparent', border: '1px solid rgba(15, 23, 42, 0.10)',
                    color: '#6B7280', borderRadius: 8, padding: '6px 14px',
                    fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim()}
                  style={{
                    background: prompt.trim() ? '#0A0A0A' : '#D4D4D1',
                    color: '#FFFFFF', border: 'none', borderRadius: 8,
                    padding: '6px 14px', fontSize: 12.5, fontWeight: 600,
                    cursor: prompt.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  Submit
                  <ArrowUp size={11} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'processing' && (
          <div key="processing" className="fade-in" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '32px 0', gap: 14,
          }}>
            <div style={{ position: 'relative', width: 44, height: 44 }}>
              <div className="ring-spin" style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'conic-gradient(from 0deg, transparent 0deg, #94A3B8 80deg, #0F172A 140deg, transparent 220deg)',
                WebkitMask: 'radial-gradient(circle, transparent 65%, black 67%)',
                mask: 'radial-gradient(circle, transparent 65%, black 67%)',
              }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={14} color="#0F172A" strokeWidth={2.4} />
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#525252', fontWeight: 500 }}>Applying your change…</div>
          </div>
        )}
      </div>

      {/* Rule updated toast */}
      {toast && (
        <div className="toast-slide" style={{
          position: 'fixed', left: '50%', bottom: 110,
          background: '#FFFFFF', border: '1px solid #BBF7D0', color: '#16A34A',
          fontSize: 11.5, fontWeight: 600, padding: '7px 14px', borderRadius: 999,
          display: 'flex', alignItems: 'center', gap: 6, zIndex: 50,
          boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 6px 16px rgba(22,163,74,0.18)',
        }}>
          <Check size={11} strokeWidth={3} /> Rule updated
        </div>
      )}

      {/* Bottom switcher */}
      <div style={{
        position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        background: '#FFFFFF',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        borderRadius: 12,
        padding: 4,
        display: 'flex', gap: 2,
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.08)',
        zIndex: 100,
      }}>
        {presets.map((p, i) => (
          <button
            key={p.label}
            onClick={() => applyPreset(i)}
            style={{
              background: activePreset === i ? '#0A0A0A' : 'transparent',
              color: activePreset === i ? '#FFFFFF' : '#525252',
              border: 'none', borderRadius: 9,
              padding: '8px 16px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              letterSpacing: '-0.005em',
              transition: 'background 150ms, color 150ms',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
