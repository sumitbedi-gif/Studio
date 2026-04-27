'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Sparkles, Plus, X, Send, Check, ChevronRight,
  FileText, Hammer, Search, Lightbulb, Pencil, Hash,
  Database, BookOpen, RotateCcw, Ticket, AppWindow,
  Signpost, BrainCircuit,
} from 'lucide-react'

// ─── Brand / color tokens ────────────────────────────────────────────────────

const T = {
  panelBg:       '#FAFAF8',
  cardBg:        '#FFFFFF',
  textPrimary:   '#0A0A0A',
  textSecondary: '#525252',
  textTertiary:  '#9CA3AF',
  border:        'rgba(15, 23, 42, 0.08)',
  borderHover:   'rgba(15, 23, 42, 0.16)',
  accent:        '#D4572A',
  accentDark:    '#B7461F',
  accentSoft:    '#FFF7F4',
  ink:           '#0A0A0A',
  inkSoft:       '#F4F4F5',
}

const TypeStyles: Record<string, { main: string; soft: string; border: string; Icon: React.FC<{ size?: number; strokeWidth?: number; color?: string }> }> = {
  'POP-UP':    { main: '#7C3AED', soft: '#F5F3FF', border: 'rgba(124, 58, 237, 0.18)', Icon: AppWindow },
  'FLOW':      { main: '#2563EB', soft: '#EFF6FF', border: 'rgba(37, 99, 235, 0.18)',  Icon: Signpost },
  'SMART TIP': { main: '#B45309', soft: '#FFFBEB', border: 'rgba(180, 83, 9, 0.18)',   Icon: Lightbulb },
  'ARTICLE':   { main: '#64748B', soft: '#F1F5F9', border: 'rgba(100, 116, 139, 0.18)',Icon: BookOpen },
}

const typeLabels: Record<string, string> = {
  'POP-UP': 'Pop-up', 'FLOW': 'Flow', 'SMART TIP': 'Smart Tip', 'ARTICLE': 'Article',
}

// ─── Data ────────────────────────────────────────────────────────────────────

interface Chip { Icon: React.FC<{ size?: number; strokeWidth?: number; color?: string }>; color: string; text: string }
const chips: Chip[] = [
  { Icon: FileText,  color: '#2563EB', text: 'Analyze this release note and propose guidance' },
  { Icon: Ticket,    color: '#16A34A', text: 'Find recurring issues in my support tickets' },
  { Icon: BookOpen,  color: '#7C3AED', text: 'Turn this SOP into a journey' },
  { Icon: RotateCcw, color: '#D97706', text: 'What content is going stale?' },
]

interface Connector {
  id: string
  name: string
  descriptor: string
  domain: string  // used for favicon fetching
}

const connectors: Connector[] = [
  { id: 'servicenow', name: 'ServiceNow',   descriptor: 'Tickets, knowledge base', domain: 'servicenow.com' },
  { id: 'zendesk',    name: 'Zendesk',      descriptor: 'Support tickets',         domain: 'zendesk.com' },
  { id: 'jira',       name: 'Jira',         descriptor: 'Issues, sprints',         domain: 'jira.atlassian.com' },
  { id: 'confluence', name: 'Confluence',   descriptor: 'Docs, pages',             domain: 'confluence.atlassian.com' },
  { id: 'sharepoint', name: 'SharePoint',   descriptor: 'Files, sites',            domain: 'sharepoint.com' },
  { id: 'gdrive',     name: 'Google Drive', descriptor: 'Docs, sheets, slides',    domain: 'drive.google.com' },
]

const faviconUrl = (domain: string, size = 64) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`

interface PlanCardData {
  id: string
  type: keyof typeof TypeStyles
  title: string
  placement: string
  stepsLabel?: string
  audience: string
  rationale: string
}

const initialPlan: PlanCardData[] = [
  {
    id: 'popup-1', type: 'POP-UP',
    title: 'Introduce EZ-Mod to commercial lenders',
    placement: 'First visit to the Loans dashboard after Apr 28',
    audience: 'Commercial Loan Relationship Managers',
    rationale: 'Release notes describe EZ-Mod as a new top-level capability for existing loan modifications. 12 tickets in the last 4 weeks asked "where do I change loan terms without re-origination?" — a pop-up on first visit sets the mental model and links to the flow. Chosen over a Beacon because the feature is high-impact and deserves explicit introduction, not just a hint.',
  },
  {
    id: 'flow-1', type: 'FLOW',
    title: 'Modify an existing loan with EZ-Mod',
    placement: 'Loan detail page → "Modify Terms" button',
    stepsLabel: '7 steps',
    audience: 'Commercial Loan Relationship Managers, Loan Assistants',
    rationale: "This is the primary procedural path the release unlocks. 18 of the 47 tickets were step-by-step confusion about the new modal's flow. A flow (not a set of smart tips) is the right shape because users asked for navigational hand-holding, not field-level clarification. Branching on loan type (Secured vs Unsecured) proposed at step 4 — see visibility rule.",
  },
  {
    id: 'smarttip-1', type: 'SMART TIP',
    title: 'Explain the "Effective Date" field',
    placement: 'EZ-Mod modal → "Effective Date" input',
    audience: 'All users on the modal',
    rationale: '9 tickets specifically asked whether Effective Date is the modification signing date or the interest accrual date. This is a field-level clarification — a smart tip sits next to the input and resolves the question in context, without interrupting flow.',
  },
  {
    id: 'article-1', type: 'ARTICLE',
    title: 'EZ-Mod vs full re-origination: when to use each',
    placement: 'Self-Help search result for "modify loan", "change terms", "EZ-Mod"',
    audience: 'All commercial lending users',
    rationale: '8 tickets were policy questions, not procedural — "am I allowed to use EZ-Mod for this?" An article in self-help answers the policy question without cluttering in-app guidance. Links to the flow for users who decide EZ-Mod is the right path.',
  },
]

// ─── Logo component (favicon-based) ──────────────────────────────────────────

function ConnectorLogo({ c, size = 22 }: { c: Connector; size?: number }) {
  const srcSize = size >= 24 ? 64 : size >= 16 ? 32 : 16
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={faviconUrl(c.domain, srcSize)}
      alt={c.name}
      width={size}
      height={size}
      style={{
        flexShrink: 0, display: 'block',
        borderRadius: size >= 20 ? 4 : 3,
      }}
    />
  )
}

// ─── File chip (above editor) ────────────────────────────────────────────────

function FilePill({ onRemove }: { onRemove: () => void }) {
  return (
    <div className="aa-chip-in" style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: '#FFFFFF', border: `1px solid ${T.border}`,
      borderRadius: 8, padding: '5px 8px 5px 7px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 4,
        background: '#DC2626',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#FFFFFF', fontSize: 7.5, fontWeight: 700, letterSpacing: '0.02em',
      }}>PDF</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, color: T.textPrimary, fontWeight: 600, letterSpacing: '-0.005em', lineHeight: 1.1 }}>
          nCino_Q1_Release_Notes.pdf
        </div>
        <div style={{ fontSize: 10, color: T.textTertiary, marginTop: 1 }}>1.2 MB</div>
      </div>
      <button onClick={onRemove} style={{
        width: 14, height: 14, border: 'none', background: 'transparent',
        color: T.textTertiary, cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 0, borderRadius: 3,
      }}>
        <X size={10} strokeWidth={2.5} />
      </button>
    </div>
  )
}

// ─── Connector picker — bottom sheet ─────────────────────────────────────────

function ConnectorPickerSheet({ open, onPick, onClose }: {
  open: boolean
  onPick: (c: Connector) => void
  onClose: () => void
}) {
  const [animateIn, setAnimateIn] = useState(false)
  useEffect(() => {
    if (open) requestAnimationFrame(() => setAnimateIn(true))
    else setAnimateIn(false)
  }, [open])
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, zIndex: 40,
          background: 'rgba(15, 23, 42, 0.24)',
          backdropFilter: 'blur(1.5px)',
          WebkitBackdropFilter: 'blur(1.5px)',
          opacity: animateIn ? 1 : 0,
          transition: 'opacity 220ms ease-out',
        }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 41,
          background: '#FFFFFF',
          borderTop: `1px solid ${T.border}`,
          borderRadius: '18px 18px 0 0',
          boxShadow: '0 -1px 0 rgba(255,255,255,0.6) inset, 0 -10px 32px rgba(15,23,42,0.10), 0 -24px 64px rgba(15,23,42,0.12)',
          transform: animateIn ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 280ms cubic-bezier(0.32, 0, 0.15, 1)',
          padding: '10px 0 12px',
          maxHeight: '70%',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 0 6px' }}>
          <div style={{ width: 36, height: 4, background: '#E5E5E3', borderRadius: 999 }} />
        </div>

        <div style={{
          padding: '4px 18px 10px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.01em' }}>
              Reference a connector
            </div>
            <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 1 }}>
              Pull context from your tools
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 26, height: 26, border: 'none', borderRadius: 7,
            background: 'transparent', color: T.textSecondary, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F4F4F2')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={14} strokeWidth={2.2} />
          </button>
        </div>

        <div style={{
          padding: '4px 10px 6px', overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {connectors.map((c, i) => (
            <button
              key={c.id}
              onClick={() => onPick(c)}
              className="aa-picker-row"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 10px',
                border: 'none', borderRadius: 8,
                background: 'transparent', cursor: 'pointer', textAlign: 'left',
                transition: 'background 120ms',
                animationDelay: `${i * 30}ms`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#F7F7F5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <ConnectorLogo c={c} size={26} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: T.textPrimary, fontWeight: 600, letterSpacing: '-0.005em' }}>
                  {c.name}
                </div>
                <div style={{ fontSize: 11.5, color: T.textTertiary, marginTop: 1 }}>
                  {c.descriptor}
                </div>
              </div>
              <ChevronRight size={14} color={T.textTertiary} strokeWidth={2.2} />
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ─── Prompt editor (contenteditable with inline badges) ──────────────────────

interface PromptEditorProps {
  editorRef: React.RefObject<HTMLDivElement | null>
  attachments: { name: string }[]
  hasContent: boolean
  onInputChange: () => void
  onAddFile: () => void
  onRemoveAttachment: (i: number) => void
  onSubmit: () => void
  placeholder: string
  canSubmit: boolean
  onOpenPicker: () => void
  autoFocus?: boolean
  showPlaceholder: boolean
}

function PromptEditor({
  editorRef, attachments, onInputChange, onAddFile, onRemoveAttachment,
  onSubmit, placeholder, canSubmit, onOpenPicker, autoFocus, showPlaceholder,
}: PromptEditorProps) {
  useEffect(() => {
    if (autoFocus) editorRef.current?.focus()
  }, [autoFocus, editorRef])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (canSubmit) onSubmit()
      return
    }
    if (e.key === '/') {
      e.preventDefault()
      onOpenPicker()
      return
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // Force paste as plain text to avoid polluting the editor
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }

  const hasAttachments = attachments.length > 0

  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${T.borderHover}`,
      borderRadius: 14,
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.05)',
      overflow: 'hidden',
    }}>
      {hasAttachments && (
        <div className="aa-fade-in" style={{
          display: 'flex', flexWrap: 'wrap', gap: 6,
          padding: '10px 12px 0',
        }}>
          {attachments.map((_, i) => (
            <FilePill key={i} onRemove={() => onRemoveAttachment(i)} />
          ))}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={onInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className="aa-editor"
          style={{
            minHeight: 46,
            outline: 'none',
            padding: '12px 14px 8px',
            fontSize: 14,
            color: T.textPrimary,
            fontFamily: "'Inter', -apple-system, sans-serif",
            lineHeight: 1.55,
            letterSpacing: '-0.005em',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        />
        {showPlaceholder && (
          <div
            style={{
              position: 'absolute', top: 12, left: 14,
              color: T.textTertiary, fontSize: 14,
              letterSpacing: '-0.005em', lineHeight: 1.55,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {placeholder}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 8px 8px 10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={onAddFile}
            title="Attach file"
            style={{
              width: 28, height: 28, borderRadius: 7, border: 'none',
              background: 'transparent', color: T.textSecondary, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 150ms, color 150ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F4F4F2'; e.currentTarget.style.color = T.textPrimary }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textSecondary }}
          >
            <Plus size={15} strokeWidth={2.2} />
          </button>
          <button
            onClick={onOpenPicker}
            title="Reference a connector"
            style={{
              height: 28, padding: '0 10px', borderRadius: 7, border: 'none',
              background: 'transparent', color: T.textTertiary, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11.5, fontWeight: 500, letterSpacing: '-0.005em',
              transition: 'background 150ms, color 150ms',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F4F4F2'; e.currentTarget.style.color = T.textSecondary }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textTertiary }}
          >
            <Hash size={12} strokeWidth={2.2} />
            Connect
          </button>
        </div>

        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          style={{
            width: 30, height: 30, borderRadius: 8, border: 'none',
            background: canSubmit ? T.ink : '#E5E5E3',
            color: canSubmit ? '#FFFFFF' : T.textTertiary,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 150ms, transform 150ms',
            boxShadow: canSubmit ? '0 1px 2px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)' : 'none',
          }}
        >
          <Send size={13} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  )
}

// ─── User message (renders captured HTML with inline badges) ─────────────────

function UserMessage({ html, attachments }: { html: string; attachments: { name: string }[] }) {
  return (
    <div className="aa-fade-in" style={{
      display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16,
    }}>
      {attachments.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {attachments.map((_, i) => <FilePill key={i} onRemove={() => {}} />)}
        </div>
      )}
      <div
        style={{
          alignSelf: 'flex-start',
          maxWidth: '95%',
          padding: '10px 14px',
          background: '#F4F4F2',
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          fontSize: 13.5,
          color: T.textPrimary,
          lineHeight: 1.55,
          letterSpacing: '-0.005em',
          wordBreak: 'break-word',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

// ─── Thinking message ────────────────────────────────────────────────────────

interface ThinkStep { Icon: React.FC<{ size?: number; strokeWidth?: number; color?: string }>; text: string }
const thinkingSteps: ThinkStep[] = [
  { Icon: Search,       text: 'Reading nCino_Q1_Release_Notes.pdf…' },
  { Icon: Database,     text: 'Pulling ServiceNow tickets (last 28 days, tag: EZ-Mod)…' },
  { Icon: BrainCircuit, text: 'Identifying intents…' },
  { Icon: Pencil,       text: 'Proposing a journey…' },
]

function ThinkingStepRow({ step, phase }: { step: ThinkStep; phase: 'active' | 'done' | 'pending' }) {
  const Icon = step.Icon
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '4px 0',
      opacity: phase === 'pending' ? 0 : 1,
      transform: phase === 'pending' ? 'translateY(6px)' : 'none',
      transition: 'opacity 400ms ease-out, transform 400ms ease-out',
    }}>
      <span style={{
        width: 24, height: 24, borderRadius: 7, flexShrink: 0,
        background: phase === 'done' ? '#DCFCE7' : T.inkSoft,
        border: phase === 'done' ? '1px solid rgba(22,163,74,0.20)' : `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {phase === 'done'
          ? <Check size={12} strokeWidth={3} color="#16A34A" />
          : <Icon size={12} strokeWidth={2.2} color={phase === 'active' ? T.textPrimary : T.textSecondary} />}
      </span>
      <span
        className={phase === 'active' ? 'aa-shimmer-text' : undefined}
        style={{
          fontSize: 12.5,
          color: phase === 'done' ? T.textSecondary : T.textPrimary,
          fontWeight: phase === 'active' ? 500 : 400,
          letterSpacing: '-0.005em',
        }}
      >
        {step.text}
      </span>
    </div>
  )
}

function ThinkingMessage({ steps, activeIdx, summary }: {
  steps: ThinkStep[]
  activeIdx: number
  summary: string | null
}) {
  if (summary) {
    return (
      <div className="aa-fade-in" style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '10px 14px',
        background: '#FFFFFF',
        border: `1px solid ${T.border}`,
        borderRadius: 11,
        marginBottom: 14,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
          background: '#DCFCE7', border: '1px solid rgba(22,163,74,0.20)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={11} strokeWidth={3} color="#16A34A" />
        </div>
        <span style={{ fontSize: 12.5, color: T.textSecondary, letterSpacing: '-0.005em' }}>
          {summary}
        </span>
      </div>
    )
  }
  return (
    <div className="aa-fade-in" style={{
      padding: '12px 14px',
      background: '#FFFFFF',
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      marginBottom: 14,
      display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      {steps.map((s, i) => (
        <ThinkingStepRow
          key={i}
          step={s}
          phase={i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'pending'}
        />
      ))}
    </div>
  )
}

// ─── Plan card ───────────────────────────────────────────────────────────────

function PlanCard({
  card, checked, expanded, status, onToggleCheck, onToggleExpand, onRemove, editMode,
}: {
  card: PlanCardData
  checked: boolean
  expanded: boolean
  status: 'idle' | 'queued' | 'building' | 'created'
  onToggleCheck: () => void
  onToggleExpand: () => void
  onRemove: () => void
  editMode: boolean
}) {
  const [hover, setHover] = useState(false)
  const style = TypeStyles[card.type]
  const Icon = style.Icon

  return (
    <div
      className="aa-card-in"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        background: '#FFFFFF',
        border: `1px solid ${hover ? T.borderHover : T.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        opacity: checked ? 1 : 0.55,
        transition: 'opacity 200ms, box-shadow 200ms, border-color 200ms',
        boxShadow: hover ? '0 2px 6px rgba(15, 23, 42, 0.05), 0 8px 20px rgba(15, 23, 42, 0.04)' : '0 1px 2px rgba(15, 23, 42, 0.03)',
      }}
    >
      <div style={{ padding: '14px 14px 14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
          {editMode && (
            <button
              onClick={onToggleCheck}
              style={{
                width: 16, height: 16, borderRadius: 4, marginTop: 6,
                border: `1.5px solid ${checked ? style.main : T.borderHover}`,
                background: checked ? style.main : '#FFFFFF',
                cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0, transition: 'all 150ms',
              }}
            >
              {checked && <Check size={10} strokeWidth={3.5} color="#FFFFFF" />}
            </button>
          )}

          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: style.soft,
            border: `1px solid ${style.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={15} color={style.main} strokeWidth={2.2} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13.5, fontWeight: 600, color: T.textPrimary,
              letterSpacing: '-0.01em', lineHeight: 1.35, marginBottom: 3,
            }}>
              {card.title}
            </div>
            <div style={{ fontSize: 11.5, color: T.textSecondary, lineHeight: 1.45, letterSpacing: '-0.003em' }}>
              {card.placement}
              {card.stepsLabel && <> · <span style={{ color: T.textTertiary }}>{card.stepsLabel}</span></>}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 4 }}>
            {editMode && hover && (
              <button
                onClick={onRemove}
                title="Remove"
                style={{
                  width: 24, height: 24, border: 'none', borderRadius: 6,
                  background: '#FEF2F2', color: '#DC2626', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            )}
            {!editMode && (
              <button
                onClick={onToggleExpand}
                title="Why this"
                style={{
                  width: 24, height: 24, border: 'none', borderRadius: 6,
                  background: 'transparent', color: T.textTertiary, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 150ms, transform 200ms, color 150ms',
                  transform: expanded ? 'rotate(90deg)' : 'none',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F4F4F2'; e.currentTarget.style.color = T.textSecondary }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.textTertiary }}
              >
                <ChevronRight size={14} strokeWidth={2.2} />
              </button>
            )}
          </div>
        </div>

        {expanded && !editMode && (
          <div className="aa-expand-in" style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: `1px solid ${T.border}`,
            fontSize: 12, color: T.textSecondary, lineHeight: 1.55,
            letterSpacing: '-0.003em',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 10, color: style.main, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 7,
            }}>
              <Lightbulb size={10} strokeWidth={2.4} />
              Why this
            </div>
            {card.rationale}
            <div style={{ marginTop: 10, fontSize: 11, color: T.textTertiary }}>
              <span style={{ color: T.textSecondary, fontWeight: 600 }}>For: </span>
              {card.audience}
            </div>
          </div>
        )}
      </div>

      {status !== 'idle' && (
        <div
          className={status === 'building' ? 'aa-shimmer' : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px',
            borderTop: `1px solid ${T.border}`,
            background:
              status === 'queued'   ? '#F7F8F5' :
              status === 'building' ? '#EFF6FF' :
              '#F0FDF4',
            fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.005em',
            color:
              status === 'queued'   ? T.textTertiary :
              status === 'building' ? '#2563EB' :
              '#15803D',
          }}
        >
          {status === 'queued'   && <>⏳ Queued</>}
          {status === 'building' && <><Hammer size={11} strokeWidth={2.4} /> Building…</>}
          {status === 'created'  && (
            <>
              <Check size={11} strokeWidth={3} /> Created
              <button
                style={{
                  marginLeft: 'auto', background: 'transparent',
                  border: 'none', color: '#15803D', fontSize: 11, fontWeight: 600,
                  cursor: 'pointer', padding: 0, letterSpacing: '-0.005em',
                }}
              >
                View in Studio →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

type AgentState = 'IDLE' | 'PLANNING' | 'PLAN_READY' | 'CREATING' | 'DONE'

export function AuthoringAgent() {
  const [state, setState] = useState<AgentState>('IDLE')
  const [attachments, setAttachments] = useState<{ name: string }[]>([])
  const [connectorRefs, setConnectorRefs] = useState<Connector[]>([])
  const [showPicker, setShowPicker] = useState(false)
  const [sentMessage, setSentMessage] = useState<{ html: string; attachments: { name: string }[] } | null>(null)
  const [thinkingIdx, setThinkingIdx] = useState(0)
  const [thinkingSummary, setThinkingSummary] = useState<string | null>(null)
  const [plan, setPlan] = useState<PlanCardData[]>(initialPlan)
  const [expanded, setExpanded] = useState<string | null>('popup-1')
  const [checked, setChecked] = useState<Set<string>>(new Set(initialPlan.map(c => c.id)))
  const [editMode, setEditMode] = useState(false)
  const [refineText, setRefineText] = useState('')
  const [cardStatus, setCardStatus] = useState<Record<string, 'idle' | 'queued' | 'building' | 'created'>>({})
  const [editorIsEmpty, setEditorIsEmpty] = useState(true)
  const [editorHasContent, setEditorHasContent] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  // ── Editor helpers ─────────────────────────────────────────────────────────

  const createInlineBadge = (c: Connector): HTMLSpanElement => {
    const span = document.createElement('span')
    span.setAttribute('contenteditable', 'false')
    span.setAttribute('data-connector-id', c.id)
    span.setAttribute('data-connector-name', c.name)
    span.className = 'aa-inline-badge'

    const img = document.createElement('img')
    img.src = faviconUrl(c.domain, 32)
    img.alt = c.name
    img.width = 14
    img.height = 14
    img.style.cssText = 'border-radius:3px;flex-shrink:0;display:block;'

    const label = document.createElement('span')
    label.textContent = c.name

    span.appendChild(img)
    span.appendChild(label)
    return span
  }

  const insertBadgeAtCursor = (c: Connector) => {
    const editor = editorRef.current
    if (!editor) return

    editor.focus()
    const badge = createInlineBadge(c)

    const sel = window.getSelection()
    let inserted = false

    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      if (editor.contains(range.startContainer)) {
        range.deleteContents()
        range.insertNode(badge)

        // Insert non-breaking space after the badge for caret positioning
        const space = document.createTextNode(' ')
        badge.parentNode?.insertBefore(space, badge.nextSibling)

        const newRange = document.createRange()
        newRange.setStartAfter(space)
        newRange.collapse(true)
        sel.removeAllRanges()
        sel.addRange(newRange)
        inserted = true
      }
    }

    if (!inserted) {
      editor.appendChild(badge)
      editor.appendChild(document.createTextNode(' '))
    }

    syncEditorState()
  }

  const syncEditorState = () => {
    const editor = editorRef.current
    if (!editor) {
      setEditorIsEmpty(true)
      setEditorHasContent(false)
      return
    }
    const text = editor.innerText
    const badges = editor.querySelectorAll('[data-connector-id]')
    const hasBadges = badges.length > 0
    const hasText = text.trim().length > 0

    setEditorIsEmpty(!hasText && !hasBadges)
    setEditorHasContent(hasText || hasBadges)

    // Sync connectorRefs with DOM (handle backspace-deleted badges)
    const idsInDOM = Array.from(badges).map(b => b.getAttribute('data-connector-id')!).filter(Boolean)
    setConnectorRefs(prev => prev.filter(c => idsInDOM.includes(c.id)))
  }

  const clearEditor = () => {
    if (editorRef.current) editorRef.current.innerHTML = ''
    setEditorIsEmpty(true)
    setEditorHasContent(false)
  }

  // ── Event handlers ─────────────────────────────────────────────────────────

  const handleChipClick = (text: string) => {
    const editor = editorRef.current
    if (!editor) return
    editor.textContent = text
    editor.focus()
    // Move cursor to end
    const range = document.createRange()
    range.selectNodeContents(editor)
    range.collapse(false)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
    syncEditorState()
  }

  const handleAddFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelected = () => {
    setAttachments(prev => [...prev, { name: 'nCino_Q1_Release_Notes.pdf' }])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAddConnector = (c: Connector) => {
    setShowPicker(false)
    // Insert inline badge into the editor + track in state
    setConnectorRefs(prev => (prev.find(x => x.id === c.id) ? prev : [...prev, c]))
    // Small delay to allow picker to close before focusing editor
    setTimeout(() => insertBadgeAtCursor(c), 50)
  }

  const handleSubmit = () => {
    const editor = editorRef.current
    let html = editor?.innerHTML.trim() ?? ''
    const text = editor?.innerText.trim() ?? ''

    if (!text && connectorRefs.length === 0 && attachments.length === 0) return

    // If empty but had attachments, use a sensible default
    if (!html && attachments.length > 0) {
      html = 'Analyze the release notes and the last 4 weeks of ServiceNow tickets tagged EZ-Mod. Tell me what guidance we should build.'
    }

    setSentMessage({ html, attachments: [...attachments] })
    clearEditor()
    setAttachments([])
    setConnectorRefs([])
    setState('PLANNING')
    setThinkingIdx(0)
    setThinkingSummary(null)
  }

  useEffect(() => {
    if (state !== 'PLANNING') return
    const delays = [0, 850, 1700, 2600, 3600]
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 0; i < thinkingSteps.length; i++) {
      timers.push(setTimeout(() => setThinkingIdx(i), delays[i]))
    }
    timers.push(setTimeout(() => {
      setThinkingIdx(thinkingSteps.length)
      setThinkingSummary('Analyzed 1 document and 47 ServiceNow tickets. Identified 1 intent.')
      setState('PLAN_READY')
    }, delays[thinkingSteps.length]))
    return () => timers.forEach(clearTimeout)
  }, [state])

  const handleCreate = () => {
    const activeCards = plan.filter(c => checked.has(c.id))
    if (activeCards.length === 0) return
    setState('CREATING')
    const initial: Record<string, 'idle' | 'queued' | 'building' | 'created'> = {}
    activeCards.forEach(c => { initial[c.id] = 'queued' })
    setCardStatus(initial)

    activeCards.forEach((c, i) => {
      const startDelay = i * 1200
      setTimeout(() => setCardStatus(prev => ({ ...prev, [c.id]: 'building' })), startDelay)
      setTimeout(() => setCardStatus(prev => ({ ...prev, [c.id]: 'created' })), startDelay + 2000)
    })

    const totalTime = (activeCards.length - 1) * 1200 + 2000 + 400
    setTimeout(() => setState('DONE'), totalTime)
  }

  const handleToggleExpand = (id: string) => { setExpanded(prev => (prev === id ? null : id)) }
  const handleToggleCheck = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  const handleRemoveCard = (id: string) => {
    setPlan(prev => prev.filter(c => c.id !== id))
    setChecked(prev => { const next = new Set(prev); next.delete(id); return next })
  }

  const handleUpdatePlan = () => {
    setEditMode(false); setRefineText('')
    setThinkingIdx(0); setThinkingSummary(null)
    setState('PLANNING' as AgentState)
    setTimeout(() => {
      setThinkingSummary(`Re-analyzed based on your refinement. Updated ${plan.length} experience${plan.length === 1 ? '' : 's'}.`)
      setState('PLAN_READY')
    }, 1500)
  }

  const activeCardCount = plan.filter(c => checked.has(c.id)).length
  const createdCount = Object.values(cardStatus).filter(s => s === 'created').length
  const allCreated = state === 'DONE'
  const canSubmit = editorHasContent || attachments.length > 0

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', background: T.panelBg,
      fontFamily: "'Inter', -apple-system, sans-serif",
      position: 'relative',
    }}>
      <input type="file" ref={fileInputRef} onChange={handleFileSelected} style={{ display: 'none' }} />

      <style>{`
        @keyframes aaFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .aa-fade-in { animation: aaFadeIn 340ms cubic-bezier(0.32, 0, 0.15, 1); }

        @keyframes aaChipIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        .aa-chip-in { animation: aaChipIn 200ms cubic-bezier(0.32, 0, 0.15, 1); }

        @keyframes aaCardIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .aa-card-in { animation: aaCardIn 380ms cubic-bezier(0.32, 0, 0.15, 1) both; }

        @keyframes aaExpand {
          from { opacity: 0; max-height: 0; transform: translateY(-4px); }
          to   { opacity: 1; max-height: 400px; transform: translateY(0); }
        }
        .aa-expand-in { animation: aaExpand 260ms cubic-bezier(0.32, 0, 0.15, 1); overflow: hidden; }

        @keyframes aaShimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .aa-shimmer {
          background: linear-gradient(90deg, #EFF6FF 0%, #DBEAFE 50%, #EFF6FF 100%);
          background-size: 200% 100%;
          animation: aaShimmer 1.5s linear infinite;
        }
        .aa-shimmer-text {
          background: linear-gradient(90deg, #27272A 0%, #A1A1AA 50%, #27272A 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: aaShimmer 1.8s linear infinite;
        }

        @keyframes aaSparkleSpin {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50%      { transform: rotate(12deg) scale(1.06); }
        }
        .aa-sparkle-pulse { animation: aaSparkleSpin 2.4s ease-in-out infinite; transform-origin: center; }

        @keyframes aaPickerRowIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .aa-picker-row {
          opacity: 0;
          animation: aaPickerRowIn 240ms cubic-bezier(0.32, 0, 0.15, 1) forwards;
        }

        /* Inline connector badge — appears inside the editor text flow and inside user messages */
        @keyframes aaBadgeIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        .aa-inline-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 1px 7px 2px 5px;
          background: #F4F4F2;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 5px;
          font-size: 12.5px;
          font-weight: 600;
          color: #18181B;
          margin: 0 2px;
          vertical-align: baseline;
          cursor: default;
          user-select: none;
          letter-spacing: -0.008em;
          line-height: 1.35;
          white-space: nowrap;
          transition: background 140ms, border-color 140ms;
          animation: aaBadgeIn 200ms cubic-bezier(0.32, 0, 0.15, 1);
        }
        .aa-inline-badge:hover {
          background: #EAEAE7;
          border-color: rgba(15, 23, 42, 0.14);
        }

        /* Editor base */
        .aa-editor { cursor: text; }
        .aa-editor:focus { outline: none; }
      `}</style>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: state === 'IDLE' ? '28px 20px 20px' : '20px 16px 16px',
        display: 'flex', flexDirection: 'column',
      }}>
        {state === 'IDLE' && (
          <div style={{
            flex: 1,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            maxWidth: 360, margin: '0 auto', width: '100%',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div className="aa-fade-in" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
                color: T.accent, background: T.accentSoft,
                border: `1px solid rgba(212, 87, 42, 0.14)`,
                padding: '4px 10px', borderRadius: 999, marginBottom: 14,
                textTransform: 'uppercase',
              }}>
                <Sparkles size={11} strokeWidth={2.4} className="aa-sparkle-pulse" />
                Authoring Agent
              </div>
              <h1 className="aa-fade-in" style={{
                fontSize: 22, fontWeight: 700, color: T.textPrimary,
                letterSpacing: '-0.02em', lineHeight: 1.2, margin: '0 0 8px',
              }}>
                What do you want to build today?
              </h1>
              <p className="aa-fade-in" style={{
                fontSize: 12.5, color: T.textSecondary, lineHeight: 1.55,
                margin: 0, letterSpacing: '-0.003em',
              }}>
                Drop in a file, connect a source, or just describe what you need.
              </p>
            </div>

            <div className="aa-fade-in">
              <PromptEditor
                editorRef={editorRef}
                attachments={attachments}
                hasContent={editorHasContent}
                onInputChange={syncEditorState}
                onAddFile={handleAddFile}
                onRemoveAttachment={(i) => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                onSubmit={handleSubmit}
                placeholder="Ask, describe, or paste a source…"
                canSubmit={canSubmit}
                onOpenPicker={() => setShowPicker(true)}
                showPlaceholder={editorIsEmpty}
              />
            </div>

            <div className="aa-fade-in" style={{
              display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14,
            }}>
              {chips.map((c, i) => {
                const Icon = c.Icon
                return (
                  <button
                    key={i}
                    onClick={() => handleChipClick(c.text)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px',
                      background: '#FFFFFF',
                      border: `1px solid ${T.border}`,
                      borderRadius: 10,
                      fontSize: 12.5, color: T.textSecondary, fontWeight: 500,
                      letterSpacing: '-0.005em',
                      cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'inherit',
                      transition: 'background 150ms, border-color 150ms, color 150ms',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.textPrimary }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSecondary }}
                  >
                    <span style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      background: `${c.color}14`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={12} color={c.color} strokeWidth={2.2} />
                    </span>
                    {c.text}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {state !== 'IDLE' && sentMessage && (
          <>
            <UserMessage html={sentMessage.html} attachments={sentMessage.attachments} />
            <ThinkingMessage steps={thinkingSteps} activeIdx={thinkingIdx} summary={thinkingSummary} />

            {(state === 'PLAN_READY' || state === 'CREATING' || state === 'DONE') && thinkingSummary && (
              <div className="aa-fade-in" style={{ marginBottom: 14 }}>
                <div style={{
                  background: '#FFFFFF',
                  border: `1px solid ${T.border}`,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 10,
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13.5, fontWeight: 700, color: T.textPrimary,
                        letterSpacing: '-0.015em', lineHeight: 1.35, marginBottom: 3,
                      }}>
                        {state === 'CREATING' ? `Creating ${activeCardCount} experiences…`
                          : state === 'DONE' ? `All ${Object.keys(cardStatus).length} experiences created in Draft`
                          : 'Proposed journey: EZ-Mod rollout for commercial lenders'}
                      </div>
                      <div style={{ fontSize: 11, color: T.textTertiary, letterSpacing: '-0.003em' }}>
                        {state === 'CREATING' ? `${createdCount} of ${activeCardCount} complete`
                          : state === 'DONE' ? 'Nothing is live yet. Review and publish from Studio.'
                          : `${activeCardCount} experience${activeCardCount === 1 ? '' : 's'} across 2 screens · ~12 min to build`}
                      </div>
                    </div>
                    {state === 'PLAN_READY' && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        color: '#15803D',
                        padding: '3px 0', fontSize: 10.5, fontWeight: 600, letterSpacing: '-0.003em',
                        flexShrink: 0, whiteSpace: 'nowrap',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A' }} />
                        High confidence
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.map((card, i) => (
                    <div key={card.id} style={{ animationDelay: `${i * 80}ms` } as React.CSSProperties}>
                      <PlanCard
                        card={card}
                        checked={checked.has(card.id)}
                        expanded={expanded === card.id}
                        status={cardStatus[card.id] ?? 'idle'}
                        onToggleCheck={() => handleToggleCheck(card.id)}
                        onToggleExpand={() => handleToggleExpand(card.id)}
                        onRemove={() => handleRemoveCard(card.id)}
                        editMode={editMode}
                      />
                    </div>
                  ))}
                </div>

                {state === 'PLAN_READY' && !editMode && (
                  <div className="aa-fade-in" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
                    marginTop: 14,
                  }}>
                    <button
                      onClick={() => setEditMode(true)}
                      style={{
                        background: '#FFFFFF',
                        border: `1px solid ${T.border}`,
                        color: T.textSecondary,
                        borderRadius: 9, padding: '8px 16px',
                        fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                        letterSpacing: '-0.005em',
                        fontFamily: 'inherit',
                        transition: 'border-color 150ms, color 150ms, background 150ms',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.color = T.textPrimary }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textSecondary }}
                    >
                      Edit plan
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={activeCardCount === 0}
                      style={{
                        background: activeCardCount > 0 ? `linear-gradient(180deg, ${T.accent} 0%, ${T.accentDark} 100%)` : '#D4D4D1',
                        color: '#FFFFFF', border: 'none',
                        borderRadius: 9, padding: '8px 18px',
                        fontSize: 12.5, fontWeight: 600,
                        cursor: activeCardCount > 0 ? 'pointer' : 'not-allowed',
                        letterSpacing: '-0.005em',
                        fontFamily: 'inherit',
                        boxShadow: activeCardCount > 0
                          ? '0 1px 0 rgba(255,255,255,0.18) inset, 0 -1px 0 rgba(15,23,42,0.10) inset, 0 1px 2px rgba(212,87,42,0.24), 0 4px 12px rgba(212,87,42,0.18)'
                          : 'none',
                        display: 'flex', alignItems: 'center', gap: 6,
                        transition: 'transform 150ms, box-shadow 150ms',
                      }}
                    >
                      <Sparkles size={12} strokeWidth={2.4} /> Create
                    </button>
                  </div>
                )}

                {state === 'PLAN_READY' && editMode && (
                  <div className="aa-fade-in" style={{
                    marginTop: 14,
                    background: '#FFFFFF',
                    border: `1px solid ${T.border}`,
                    borderRadius: 12, padding: 12,
                  }}>
                    <div style={{
                      fontSize: 11, color: T.textSecondary, marginBottom: 8,
                      letterSpacing: '-0.005em', display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <Pencil size={10} strokeWidth={2.4} />
                      Uncheck to exclude, × to remove, or refine:
                    </div>
                    <input
                      value={refineText}
                      onChange={e => setRefineText(e.target.value)}
                      placeholder="Refine the plan in your own words…"
                      style={{
                        width: '100%', border: `1px solid ${T.border}`, borderRadius: 9,
                        padding: '8px 12px', fontSize: 12.5, color: T.textPrimary,
                        outline: 'none', fontFamily: 'inherit', letterSpacing: '-0.005em',
                        boxSizing: 'border-box',
                      }}
                    />
                    <div style={{
                      display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 10,
                    }}>
                      <button
                        onClick={() => { setEditMode(false); setRefineText('') }}
                        style={{
                          background: 'transparent', border: `1px solid ${T.border}`,
                          color: T.textSecondary, borderRadius: 8, padding: '6px 14px',
                          fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdatePlan}
                        style={{
                          background: T.ink, color: '#FFFFFF',
                          border: 'none', borderRadius: 8, padding: '6px 14px',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', gap: 5,
                        }}
                      >
                        <Sparkles size={11} strokeWidth={2.4} /> Update plan
                      </button>
                    </div>
                  </div>
                )}

                {allCreated && (
                  <div className="aa-fade-in" style={{
                    marginTop: 14,
                    background: '#F0FDF4', border: '1px solid rgba(22, 163, 74, 0.18)',
                    borderRadius: 11, padding: '11px 14px',
                    fontSize: 12, color: '#15803D', lineHeight: 1.5,
                    letterSpacing: '-0.005em',
                  }}>
                    <strong style={{ fontWeight: 700 }}>Created:</strong>{' '}
                    {Object.keys(cardStatus).map(id => {
                      const c = plan.find(p => p.id === id)
                      return c ? `1 ${typeLabels[c.type]}` : ''
                    }).filter(Boolean).join(', ')}. Grouped as journey &quot;EZ-Mod rollout for commercial lenders&quot;.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {state !== 'IDLE' && (
        <div className="aa-fade-in" style={{
          borderTop: `1px solid ${T.border}`,
          padding: '12px 16px 14px',
          background: T.panelBg,
        }}>
          <PromptEditor
            editorRef={editorRef}
            attachments={attachments}
            hasContent={editorHasContent}
            onInputChange={syncEditorState}
            onAddFile={handleAddFile}
            onRemoveAttachment={(i) => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
            onSubmit={handleSubmit}
            placeholder={allCreated ? 'Ask a follow-up or start a new request…' : 'Ask a follow-up…'}
            canSubmit={canSubmit}
            onOpenPicker={() => setShowPicker(true)}
            showPlaceholder={editorIsEmpty}
          />
        </div>
      )}

      <ConnectorPickerSheet
        open={showPicker}
        onPick={handleAddConnector}
        onClose={() => setShowPicker(false)}
      />
    </div>
  )
}
