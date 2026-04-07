'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  X,
  Minus,
  Sparkles,
  ArrowUp,
  Calendar,
  CalendarDays,
  Crosshair,
  Users,
  Globe2,
  Repeat,
  MousePointer2,
  Check,
  ArrowLeft,
  Wand2,
  Lightbulb,
  Plus,
  Pencil,
} from 'lucide-react'

// ─── Color tokens ─────────────────────────────────────────────────────────────

const C = {
  panelBg:        '#F8F8F6',
  cardBg:         '#FFFFFF',
  textPrimary:    '#0A0A0A',
  textSecondary:  '#525252',
  textTertiary:   '#9CA3AF',
  border:         'rgba(15, 23, 42, 0.07)',
  borderHover:    'rgba(15, 23, 42, 0.14)',
  accent:         '#D4572A',
  accentDark:     '#B7461F',
  accentSoft:     '#FFF7F4',
  ai:             '#2563EB',  // blue-600
  aiDark:         '#1D4ED8',  // blue-700
  aiSoft:         '#EFF6FF',  // blue-50
  aiSoftBorder:   '#DBEAFE',  // blue-100
  aiPillActive:   '#DBEAFE',  // blue-100
  aiRing:         '#93C5FD',  // blue-300
  success:        '#16A34A',
  successSoft:    '#DCFCE7',
  shadowSm:       '0 1px 2px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.03)',
  shadowMd:       '0 4px 12px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)',
  shadowLg:       '0 12px 32px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.06)',
  shadowXl:       '0 24px 64px rgba(15, 23, 42, 0.18), 0 4px 16px rgba(15, 23, 42, 0.08)',
  popoverShadow:  '0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.10), 0 24px 64px rgba(15, 23, 42, 0.12)',
  cardShadow:     '0 1px 0 rgba(255, 255, 255, 0.6) inset, 0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.05), 0 24px 48px rgba(15, 23, 42, 0.04)',
  buttonGlow:     '0 1px 0 rgba(255, 255, 255, 0.20) inset, 0 -1px 0 rgba(15, 23, 42, 0.10) inset, 0 1px 2px rgba(37, 99, 235, 0.32), 0 6px 16px rgba(37, 99, 235, 0.30), 0 16px 40px rgba(37, 99, 235, 0.16)',
  buttonGlowHover:'0 1px 0 rgba(255, 255, 255, 0.22) inset, 0 -1px 0 rgba(15, 23, 42, 0.10) inset, 0 2px 4px rgba(37, 99, 235, 0.36), 0 10px 24px rgba(37, 99, 235, 0.36), 0 20px 48px rgba(37, 99, 235, 0.20)',
}

// ─── Types & Data ─────────────────────────────────────────────────────────────

export interface PopupTemplate {
  id: number
  name: string
  variant: 'modal-media' | 'modal-text' | 'snackbar'
  heading: string
  body: string
  primaryCta: string
  secondaryCta?: string
  accent: string
  accentBg: string
}

// All 6 templates share the same visual treatment (modal-text, slate accent).
const sharedTemplateStyle = {
  variant: 'modal-text' as const,
  primaryCta: 'Okay',
  secondaryCta: 'Cancel',
  accent: '#64748B',
  accentBg: 'linear-gradient(135deg, #F1F5F9 0%, #FFFFFF 100%)',
}

export const popupTemplates: PopupTemplate[] = [
  { id: 1, name: 'Welcome',      heading: 'Welcome to the team',        body: "We're excited to have you on board. Take a quick tour to get started.",            ...sharedTemplateStyle },
  { id: 2, name: 'New features', heading: 'New features just landed',   body: "Discover what's new this month — built from your feedback.",                       ...sharedTemplateStyle },
  { id: 3, name: 'Quick update', heading: 'Heads up — quick update',    body: 'A small fix has rolled out to your dashboard.',                                     ...sharedTemplateStyle },
  { id: 4, name: 'Product tour', heading: 'Get familiar with the app',  body: 'Walk through the key parts of your workspace in under two minutes.',                ...sharedTemplateStyle },
  { id: 5, name: 'Privacy',      heading: 'Privacy policy update',      body: "We've made small changes to our privacy policy. Please review when you can.",      ...sharedTemplateStyle },
  { id: 6, name: 'Maintenance',  heading: 'Scheduled maintenance',      body: 'Maintenance will run on Saturday. Expect a brief downtime in the evening.',         ...sharedTemplateStyle },
]

export interface ElementInfo {
  name: string
  selector: string
}

export interface VRUrl {
  display: string
  full: string
}

export interface VRRules {
  urls: VRUrl[]
  dateRange: { start: string; end: string }
  occurrences: number
  audience: string
  elementTrigger: ElementInfo | null
  showFrequency: boolean
  showAudience: boolean
}

const defaultRules: VRRules = {
  urls: [{ display: 'app.acme.com/dashboard', full: 'https://app.acme.com/dashboard/home' }],
  dateRange: { start: 'May 1, 2026', end: 'May 31, 2026' },
  occurrences: 4,
  audience: 'All users',
  elementTrigger: null,
  showFrequency: true,
  showAudience: true,
}

function urlToDisplay(full: string): string {
  const cleaned = full.replace(/^https?:\/\//, '')
  return cleaned.length > 26 ? cleaned.slice(0, 26) + '…' : cleaned
}

const userGroups = ['All users', 'Sales team', 'Engineering', 'Customer Success', 'Marketing', 'Executives']

// ─── Atoms ────────────────────────────────────────────────────────────────────

function HeaderBtn({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 30, height: 30, border: 'none', borderRadius: 8,
        background: hover ? '#F4F4F2' : 'transparent',
        color: C.textSecondary, cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        transition: 'background 150ms',
      }}
    >
      {children}
    </button>
  )
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 32, height: 18, borderRadius: 9, cursor: 'pointer', position: 'relative',
        background: checked ? C.accent : '#D4D4D1', transition: 'background 200ms', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 2, left: checked ? 16 : 2, width: 14, height: 14,
        borderRadius: '50%', background: '#ffffff', transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  )
}

function Accordion({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.005em' }}>{title}</span>
        {open ? <ChevronUp size={15} color={C.textSecondary} /> : <ChevronDown size={15} color={C.textSecondary} />}
      </button>
      {open && <div style={{ padding: '0 18px 18px' }}>{children}</div>}
    </div>
  )
}

// ─── Mini popup preview ──────────────────────────────────────────────────────

function MiniPopupPreview({ template }: { template: PopupTemplate }) {
  if (template.variant === 'snackbar') {
    return (
      <div style={{
        width: '100%', height: 124, background: template.accentBg, borderRadius: 10, position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Faux page lines */}
        <div style={{ padding: '14px 14px 0' }}>
          <div style={{ height: 4, background: '#E5E5E3', borderRadius: 2, width: '40%', marginBottom: 6 }} />
          <div style={{ height: 3, background: '#E5E5E3', borderRadius: 2, width: '70%', marginBottom: 4 }} />
          <div style={{ height: 3, background: '#E5E5E3', borderRadius: 2, width: '60%' }} />
        </div>
        {/* Snackbar */}
        <div style={{
          position: 'absolute', left: 12, bottom: 12, right: 30,
          background: '#0A0A0A', borderRadius: 7, padding: '7px 9px',
          display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ height: 3, background: '#ffffff', borderRadius: 1, width: '85%', marginBottom: 2 }} />
            <div style={{ height: 2, background: 'rgba(255,255,255,0.5)', borderRadius: 1, width: '60%' }} />
          </div>
          <div style={{ height: 11, width: 26, background: '#ffffff', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 6, color: '#0A0A0A', fontWeight: 700 }}>Okay</span>
          </div>
        </div>
      </div>
    )
  }

  const isMedia = template.variant === 'modal-media'

  return (
    <div style={{
      width: '100%', height: 124, background: template.accentBg, borderRadius: 10, position: 'relative',
      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '78%', background: '#FFFFFF', borderRadius: 8, padding: 11,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        boxShadow: '0 6px 20px rgba(15, 23, 42, 0.10), 0 2px 4px rgba(15, 23, 42, 0.05)',
        position: 'relative',
      }}>
        {isMedia && (
          <div style={{
            width: 18, height: 18, borderRadius: 5,
            background: template.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 9, fontWeight: 800,
            boxShadow: `0 3px 8px ${template.accent}40`,
          }}>W</div>
        )}
        <div style={{ height: 4, background: '#0A0A0A', borderRadius: 2, width: '80%' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '90%', alignItems: 'center' }}>
          <div style={{ height: 2.5, background: '#D4D4D1', borderRadius: 1, width: '95%' }} />
          <div style={{ height: 2.5, background: '#D4D4D1', borderRadius: 1, width: '78%' }} />
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          {template.secondaryCta && (
            <div style={{
              height: 11, width: 28, border: `0.6px solid #E5E5E3`, borderRadius: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 5.5, color: '#525252', fontWeight: 500,
            }}>
              {template.secondaryCta}
            </div>
          )}
          <div style={{
            height: 11, width: 32, background: template.accent, borderRadius: 3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 5.5, color: '#ffffff', fontWeight: 700,
            boxShadow: `0 2px 6px ${template.accent}60`,
          }}>
            {template.primaryCta}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Screen 1: Template Grid ──────────────────────────────────────────────────

function TemplateCard({ template, onClick }: { template: PopupTemplate; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{
        background: C.cardBg,
        border: `1px solid ${hover ? C.borderHover : C.border}`,
        borderRadius: 14,
        padding: 12,
        cursor: 'pointer',
        transition: 'border-color 200ms, transform 200ms, box-shadow 200ms',
        transform: hover ? 'translateY(-2px)' : 'none',
        boxShadow: hover ? C.shadowMd : C.shadowSm,
      }}
    >
      <MiniPopupPreview template={template} />
      <div style={{ marginTop: 12, paddingLeft: 2, paddingRight: 2 }}>
        <div style={{ fontSize: 13, color: C.textPrimary, fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
          {template.name}
        </div>
        <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
            background: template.accent,
          }} />
          {template.variant === 'snackbar' ? 'Snackbar · Text only' : template.variant === 'modal-text' ? 'Modal · Text only' : 'Modal · Media + Text'}
        </div>
      </div>
    </div>
  )
}

function TemplateGrid({ onPickTemplate, onClose, onMin }: { onPickTemplate: (t: PopupTemplate) => void; onClose: () => void; onMin: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.panelBg }}>
      <div style={{
        background: C.panelBg, borderBottom: `1px solid ${C.border}`,
        padding: '0 12px 0 16px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={18} color={C.textPrimary} strokeWidth={2} />
          <span style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em' }}>Creating Popup</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <HeaderBtn title="Minimize" onClick={onMin}><Minus size={15} strokeWidth={2} /></HeaderBtn>
          <HeaderBtn title="Close" onClick={onClose}><X size={15} strokeWidth={2} /></HeaderBtn>
        </div>
      </div>

      <div style={{ padding: '20px 18px 6px' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.015em' }}>
          Choose a template
        </div>
        <div style={{ fontSize: 12.5, color: C.textTertiary, marginTop: 4 }}>
          Pick a starting point. You can customize everything later.
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {popupTemplates.map((t) => (
            <TemplateCard key={t.id} template={t} onClick={() => onPickTemplate(t)} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Configurations Tab ───────────────────────────────────────────────────────

function SliderRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: C.textSecondary }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: C.textTertiary }}>Uniform</span>
          <ToggleSwitch checked onChange={() => {}} />
        </div>
      </div>
      <div style={{ position: 'relative', height: 6, background: C.border, borderRadius: 3 }}>
        <div style={{ position: 'absolute', height: 6, width: `${(value / 50) * 100}%`, background: C.accent, borderRadius: 3 }} />
        <div style={{
          position: 'absolute', left: `${(value / 50) * 100}%`, top: -4,
          width: 14, height: 14, marginLeft: -7,
          background: '#ffffff', border: `2px solid ${C.accent}`, borderRadius: '50%',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }} />
      </div>
      <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 6 }}>{value}px</div>
    </div>
  )
}

function ConfigurationsTab() {
  return (
    <div>
      <Accordion title="Appearance" defaultOpen>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: C.textSecondary }}>Background</span>
          <div style={{ display: 'flex', background: '#F4F4F2', borderRadius: 7, padding: 2, marginLeft: 'auto' }}>
            <span style={{ fontSize: 11, padding: '4px 10px', background: '#ffffff', borderRadius: 5, color: C.textPrimary, fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>Color</span>
            <span style={{ fontSize: 11, padding: '4px 10px', color: C.textTertiary }}>Image</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 5 }} />
          <span style={{ fontSize: 12, color: C.textSecondary, fontFamily: 'monospace' }}>#FFFFFF</span>
        </div>
        <SliderRow label="Padding" value={20} />
        <SliderRow label="Border Radius" value={20} />
      </Accordion>
      <Accordion title="Position">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 32px)', gap: 6, justifyContent: 'center', padding: '6px 0' }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{
              width: 32, height: 32, border: `1px solid ${C.border}`, borderRadius: 5,
              background: i === 4 ? C.accent : '#ffffff', cursor: 'pointer',
            }} />
          ))}
        </div>
      </Accordion>
      <Accordion title="Control">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: C.textSecondary }}>Show close (X) button</span>
          <ToggleSwitch checked onChange={() => {}} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: C.textSecondary }}>Don&apos;t show me again</span>
          <ToggleSwitch checked={false} onChange={() => {}} />
        </div>
      </Accordion>
    </div>
  )
}

// ─── AI Loader (rotating ring + cycling text) ────────────────────────────────

function AILoader({ messages }: { messages: string[] }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    // Advance one message at a time and STOP at the last one — never loop.
    // The parent decides when loading ends; the final message holds until then.
    if (idx >= messages.length - 1) return
    const t = setTimeout(() => setIdx(i => i + 1), 1100)
    return () => clearTimeout(t)
  }, [idx, messages.length])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '52px 24px', gap: 20 }}>
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        {/* Outer ring */}
        <div className="ai-ring-1" style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'conic-gradient(from 0deg, transparent 0deg, #93C5FD 80deg, #2563EB 140deg, transparent 220deg)',
          WebkitMask: 'radial-gradient(circle, transparent 70%, black 72%)',
          mask: 'radial-gradient(circle, transparent 70%, black 72%)',
        }} />
        {/* Inner ring */}
        <div className="ai-ring-2" style={{
          position: 'absolute', inset: 6, borderRadius: '50%',
          background: 'conic-gradient(from 180deg, transparent 0deg, #BFDBFE 90deg, transparent 180deg)',
          WebkitMask: 'radial-gradient(circle, transparent 60%, black 62%)',
          mask: 'radial-gradient(circle, transparent 60%, black 62%)',
        }} />
        {/* Sparkle center */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="ai-sparkle-pulse" style={{
            width: 30, height: 30, borderRadius: '50%',
            background: C.aiSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={15} color={C.ai} strokeWidth={2.4} />
          </div>
        </div>
      </div>

      <div key={idx} className="ai-text-cycle" style={{
        fontSize: 13, color: C.textSecondary, fontWeight: 500, textAlign: 'center', minHeight: 18,
        letterSpacing: '-0.005em',
      }}>
        {messages[idx]}
      </div>
    </div>
  )
}

// ─── Pill (clickable inline value in summary) ────────────────────────────────

type PillName = 'url' | 'dates' | 'trigger' | 'frequency' | 'audience'

function SummaryPill({
  name, pillKey, isActive, isHighlighted, onClick, refStore, children,
  dismissible, onDismiss,
}: {
  name: PillName
  pillKey: string
  isActive: boolean
  isHighlighted: boolean
  onClick: () => void
  refStore: React.MutableRefObject<Record<string, HTMLButtonElement | null>>
  children: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
}) {
  const [hover, setHover] = useState(false)
  // Subtle grey by default, blue ring only when actively editing
  const bg = isActive
    ? 'rgba(37, 99, 235, 0.08)'
    : hover
      ? 'rgba(15, 23, 42, 0.06)'
      : 'rgba(15, 23, 42, 0.04)'
  const borderColor = isActive
    ? 'rgba(37, 99, 235, 0.30)'
    : hover
      ? 'rgba(15, 23, 42, 0.10)'
      : 'rgba(15, 23, 42, 0.06)'

  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'inline-block',
        verticalAlign: 'baseline',
      }}
    >
      <button
        ref={(el) => { refStore.current[pillKey] = el }}
        onClick={onClick}
        className={isHighlighted ? 'pill-highlight' : undefined}
        style={{
          display: 'inline',
          background: bg,
          color: isActive ? '#1D4ED8' : '#27272A',
          border: `1px solid ${borderColor}`,
          borderRadius: 5,
          padding: '0px 6px 1px',
          margin: '0 1px',
          fontSize: 13,
          fontWeight: 550,
          cursor: 'pointer',
          fontFamily: 'inherit',
          verticalAlign: 'baseline',
          letterSpacing: '-0.008em',
          lineHeight: 1.4,
          boxShadow: isActive
            ? '0 0 0 3px rgba(37, 99, 235, 0.10)'
            : 'none',
          transition: 'background 160ms, border-color 160ms, box-shadow 160ms, color 160ms',
        }}
      >
        {children}
      </button>
      {dismissible && hover && (
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss?.() }}
          className="pill-dismiss-in"
          title="Remove"
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            width: 15,
            height: 15,
            borderRadius: '50%',
            background: '#0A0A0A',
            color: '#FFFFFF',
            border: '1.5px solid #FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
            zIndex: 20,
          }}
        >
          <X size={9} strokeWidth={3} />
        </button>
      )}
    </span>
  )
}

// ─── Popover sub-components ──────────────────────────────────────────────────

function PopoverHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <div style={{
        width: 24, height: 24, borderRadius: 6, background: C.aiSoft,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.005em' }}>{title}</span>
    </div>
  )
}

function PopoverActions({ onSave, onCancel, saveLabel = 'Save', saveDisabled }: {
  onSave: () => void; onCancel: () => void; saveLabel?: string; saveDisabled?: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 12 }}>
      <button
        onClick={onCancel}
        style={{
          background: 'transparent', border: `1px solid ${C.border}`, color: C.textSecondary,
          borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
        }}
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saveDisabled}
        style={{
          background: saveDisabled ? '#D4D4D1' : C.textPrimary,
          color: '#fff', border: 'none', borderRadius: 7,
          padding: '6px 14px', fontSize: 12, fontWeight: 600,
          cursor: saveDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        {saveLabel}
      </button>
    </div>
  )
}

function PopoverEditWithAI({ onClick }: { onClick: () => void }) {
  return (
    <>
      <div style={{ height: 1, background: C.border, margin: '12px -14px 10px' }} />
      <button
        onClick={onClick}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          background: C.aiSoft, color: C.aiDark, border: `1px solid ${C.aiSoftBorder}`,
          borderRadius: 7, padding: '7px 10px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
          transition: 'background 150ms',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = C.aiPillActive)}
        onMouseLeave={(e) => (e.currentTarget.style.background = C.aiSoft)}
      >
        <Sparkles size={11} strokeWidth={2.4} />
        Edit with AI
      </button>
    </>
  )
}

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%', border: `1px solid ${C.border}`, borderRadius: 8,
        padding: '8px 10px', fontSize: 12.5, color: C.textPrimary, background: '#FFFFFF',
        outline: 'none', fontFamily: "'Inter', -apple-system, sans-serif", boxSizing: 'border-box',
        fontWeight: 500,
        ...(props.style || {}),
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = C.ai; props.onFocus?.(e) }}
      onBlur={(e) => { e.currentTarget.style.borderColor = C.border; props.onBlur?.(e) }}
    />
  )
}

// ─── Per-pill popover content ────────────────────────────────────────────────

function UrlPopover({ rules, setRules, onClose, onEditWithAI }: {
  rules: VRRules; setRules: React.Dispatch<React.SetStateAction<VRRules>>;
  onClose: () => void; onEditWithAI: () => void;
}) {
  const [urls, setUrls] = useState<string[]>(rules.urls.map(u => u.full))

  const updateAt = (idx: number, value: string) => {
    setUrls(prev => prev.map((u, i) => (i === idx ? value : u)))
  }
  const removeAt = (idx: number) => {
    setUrls(prev => prev.filter((_, i) => i !== idx))
  }
  const addOne = () => {
    setUrls(prev => [...prev, ''])
  }

  const handleSave = () => {
    const cleaned = urls.map(u => u.trim()).filter(Boolean)
    if (cleaned.length === 0) {
      onClose()
      return
    }
    setRules(prev => ({
      ...prev,
      urls: cleaned.map(full => ({ full, display: urlToDisplay(full) })),
    }))
    onClose()
  }

  return (
    <>
      <PopoverHeader icon={<Globe2 size={13} color={C.ai} strokeWidth={2.2} />} title="Where to show" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
        {urls.map((url, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <StyledInput
                value={url}
                onChange={(e) => updateAt(idx, e.target.value)}
                placeholder="https://..."
              />
            </div>
            {urls.length > 1 && (
              <button
                onClick={() => removeAt(idx)}
                title="Remove"
                style={{
                  width: 26, height: 26, border: `1px solid ${C.border}`, borderRadius: 7,
                  background: '#FFFFFF', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  color: C.textTertiary, transition: 'background 150ms, color 150ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = C.textTertiary }}
              >
                <X size={11} strokeWidth={2.4} />
              </button>
            )}
          </div>
        ))}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8, marginTop: 12,
      }}>
        <button
          onClick={addOne}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#1D4ED8', fontSize: 11.5, fontWeight: 600,
            padding: '6px 0',
            letterSpacing: '-0.005em',
          }}
        >
          <Plus size={12} strokeWidth={2.5} />
          Add another
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: `1px solid ${C.border}`, color: C.textSecondary,
              borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              background: C.textPrimary,
              color: '#fff', border: 'none', borderRadius: 7,
              padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Save
          </button>
        </div>
      </div>
      <PopoverEditWithAI onClick={onEditWithAI} />
    </>
  )
}

function DatesPopover({ rules, setRules, onClose, onEditWithAI }: {
  rules: VRRules; setRules: React.Dispatch<React.SetStateAction<VRRules>>;
  onClose: () => void; onEditWithAI: () => void;
}) {
  const [start, setStart] = useState(rules.dateRange.start)
  const [end, setEnd] = useState(rules.dateRange.end)
  const handleSave = () => {
    setRules(prev => ({ ...prev, dateRange: { start, end } }))
    onClose()
  }
  return (
    <>
      <PopoverHeader icon={<CalendarDays size={13} color={C.ai} strokeWidth={2.2} />} title="Date range" />
      <div style={{ fontSize: 10, color: C.textTertiary, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>Start</div>
      <StyledInput value={start} onChange={(e) => setStart(e.target.value)} style={{ marginBottom: 8 }} />
      <div style={{ fontSize: 10, color: C.textTertiary, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>End</div>
      <StyledInput value={end} onChange={(e) => setEnd(e.target.value)} />
      <PopoverActions onSave={handleSave} onCancel={onClose} />
      <PopoverEditWithAI onClick={onEditWithAI} />
    </>
  )
}

function TriggerPopover({ rules, onRePick, onClose, onEditWithAI }: {
  rules: VRRules; onRePick: () => void; onClose: () => void; onEditWithAI: () => void;
}) {
  return (
    <>
      <PopoverHeader icon={<MousePointer2 size={13} color={C.ai} strokeWidth={2.2} />} title="Trigger element" />
      <div style={{
        background: '#F7F7F5', border: `1px solid ${C.border}`, borderRadius: 8,
        padding: 10, marginBottom: 10,
      }}>
        <div style={{ fontSize: 12, color: C.textPrimary, fontWeight: 600 }}>
          {rules.elementTrigger?.name || '—'}
        </div>
        <div style={{ fontSize: 10, color: C.textTertiary, fontFamily: 'monospace', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {rules.elementTrigger?.selector || ''}
        </div>
      </div>
      <button
        onClick={() => { onClose(); onRePick() }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          background: C.textPrimary, color: '#fff', border: 'none', borderRadius: 8,
          padding: '8px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}
      >
        <Crosshair size={12} strokeWidth={2.4} />
        Re-pick element
      </button>
      <PopoverEditWithAI onClick={onEditWithAI} />
    </>
  )
}

function FrequencyPopover({ rules, setRules, onClose, onEditWithAI }: {
  rules: VRRules; setRules: React.Dispatch<React.SetStateAction<VRRules>>;
  onClose: () => void; onEditWithAI: () => void;
}) {
  const [count, setCount] = useState(rules.occurrences)
  const handleSave = () => {
    setRules(prev => ({ ...prev, occurrences: Math.max(1, count), showFrequency: true }))
    onClose()
  }
  return (
    <>
      <PopoverHeader icon={<Repeat size={13} color={C.ai} strokeWidth={2.2} />} title="Frequency" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={() => setCount(c => Math.max(1, c - 1))}
          style={{ width: 28, height: 28, border: `1px solid ${C.border}`, borderRadius: 7, background: '#FFFFFF', cursor: 'pointer', fontSize: 14, color: C.textSecondary, fontWeight: 600 }}
        >−</button>
        <input
          type="number" value={count}
          onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
          style={{
            width: 60, height: 28, border: `1px solid ${C.border}`, borderRadius: 7,
            textAlign: 'center', fontSize: 13, fontWeight: 600, color: C.textPrimary,
            outline: 'none', fontFamily: "'Inter', -apple-system, sans-serif",
          }}
        />
        <button
          onClick={() => setCount(c => c + 1)}
          style={{ width: 28, height: 28, border: `1px solid ${C.border}`, borderRadius: 7, background: '#FFFFFF', cursor: 'pointer', fontSize: 14, color: C.textSecondary, fontWeight: 600 }}
        >+</button>
        <span style={{ fontSize: 11.5, color: C.textTertiary, marginLeft: 4 }}>times per user</span>
      </div>
      <PopoverActions onSave={handleSave} onCancel={onClose} />
      <PopoverEditWithAI onClick={onEditWithAI} />
    </>
  )
}

function AudiencePopover({ rules, setRules, onClose, onEditWithAI }: {
  rules: VRRules; setRules: React.Dispatch<React.SetStateAction<VRRules>>;
  onClose: () => void; onEditWithAI: () => void;
}) {
  const [selected, setSelected] = useState(rules.audience)
  const handleSave = () => {
    setRules(prev => ({ ...prev, audience: selected, showAudience: true }))
    onClose()
  }
  return (
    <>
      <PopoverHeader icon={<Users size={13} color={C.ai} strokeWidth={2.2} />} title="Audience" />
      <div style={{
        background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 8, padding: 4,
        maxHeight: 180, overflowY: 'auto',
      }}>
        {userGroups.map(g => {
          const active = selected === g
          return (
            <div
              key={g}
              onClick={() => setSelected(g)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '7px 8px', cursor: 'pointer', borderRadius: 6,
                background: active ? C.aiSoft : 'transparent',
                transition: 'background 150ms',
              }}
            >
              <span style={{
                width: 13, height: 13, borderRadius: '50%',
                border: `2px solid ${active ? C.ai : '#D4D4D1'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.ai }} />}
              </span>
              <span style={{ fontSize: 12, color: C.textPrimary, fontWeight: active ? 600 : 500 }}>{g}</span>
            </div>
          )
        })}
      </div>
      <PopoverActions onSave={handleSave} onCancel={onClose} />
      <PopoverEditWithAI onClick={onEditWithAI} />
    </>
  )
}

// ─── Reasoning Modal — centered in studio ────────────────────────────────────

function buildReasons(template: PopupTemplate | null, rules: VRRules): { icon: React.ReactNode; label: string; text: string }[] {
  const reasons: { icon: React.ReactNode; label: string; text: string }[] = []

  // WHERE
  reasons.push({
    icon: <Globe2 size={12} color="#1D4ED8" strokeWidth={2.2} />,
    label: 'Where',
    text: rules.urls.length > 1
      ? `Targeting ${rules.urls.length} pages so users see the popup wherever they land in the relevant flow.`
      : template && /welcome|familiar|hello/i.test(template.name)
        ? 'Onboarding popups land best on the home dashboard, where new users typically arrive first.'
        : 'This is the page where similar popups have the highest engagement in your workspace.',
  })

  // WHEN
  reasons.push({
    icon: <CalendarDays size={12} color="#1D4ED8" strokeWidth={2.2} />,
    label: 'When',
    text: 'A 30-day window matches your standard rollout cadence for new feature awareness.',
  })

  // TRIGGER (only when set)
  if (rules.elementTrigger) {
    reasons.push({
      icon: <MousePointer2 size={12} color="#1D4ED8" strokeWidth={2.2} />,
      label: 'Trigger',
      text: `Catching users at the moment they click ${rules.elementTrigger.name} keeps the message contextual and timely.`,
    })
  }

  // FREQUENCY (only when shown)
  if (rules.showFrequency) {
    reasons.push({
      icon: <Repeat size={12} color="#1D4ED8" strokeWidth={2.2} />,
      label: 'Frequency',
      text: `${rules.occurrences} impressions per user is enough to land the message without crossing into notification fatigue.`,
    })
  }

  // AUDIENCE (only when shown)
  if (rules.showAudience) {
    reasons.push({
      icon: <Users size={12} color="#1D4ED8" strokeWidth={2.2} />,
      label: 'Audience',
      text: rules.audience === 'All users'
        ? 'Welcome and announcement popups typically apply to your entire workspace.'
        : `Scoped to ${rules.audience} based on the audience you described.`,
    })
  }

  return reasons
}

function ReasoningModal({ template, rules, onClose }: {
  template: PopupTemplate | null
  rules: VRRules
  onClose: () => void
}) {
  const reasons = buildReasons(template, rules)
  return (
    <div
      onClick={onClose}
      className="reasoning-backdrop-in"
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(15, 23, 42, 0.40)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="reasoning-card-in"
        style={{
          width: '100%',
          maxWidth: 320,
          background: 'linear-gradient(180deg, #FBFCFE 0%, #F1F5FB 100%)',
          border: '1px solid rgba(37, 99, 235, 0.10)',
          borderRadius: 18,
          boxShadow: '0 1px 0 rgba(255, 255, 255, 0.7) inset, 0 8px 24px rgba(15, 23, 42, 0.16), 0 24px 64px rgba(15, 23, 42, 0.20)',
          maxHeight: '82%',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '16px 18px 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid rgba(37, 99, 235, 0.10)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)',
              border: '1px solid rgba(37, 99, 235, 0.16)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={13} color="#1D4ED8" strokeWidth={2.4} className="ai-sparkle-twinkle" />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0A0A0A', letterSpacing: '-0.01em' }}>
                How AI built these rules
              </div>
              <div style={{ fontSize: 10.5, color: '#9CA3AF', fontWeight: 500, marginTop: 1 }}>
                {template?.name ? `Based on "${template.name}"` : 'Reasoning per rule'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 26, height: 26, border: 'none', borderRadius: 7,
              background: 'transparent', color: '#525252', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(15, 23, 42, 0.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={14} strokeWidth={2.2} />
          </button>
        </div>

        <div className="why-panel-stagger" style={{
          padding: '16px 18px 18px',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 13,
        }}>
          {reasons.map((r) => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 7,
                background: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid rgba(37, 99, 235, 0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
              }}>
                {r.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 10, color: '#1D4ED8', fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3,
                }}>
                  {r.label}
                </div>
                <div style={{
                  fontSize: 12.5, color: '#27272A', lineHeight: 1.55,
                  letterSpacing: '-0.005em',
                }}>
                  {r.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Single-card summary ─────────────────────────────────────────────────────

type Segment =
  | { kind: 'text'; value: string }
  | { kind: 'pill'; name: PillName; pillKey: string; value: string; field: string; dismissible?: boolean }

function buildSegments(rules: VRRules): Segment[] {
  const segs: Segment[] = []
  segs.push({ kind: 'text', value: 'Show this popup on ' })
  const urlPillText = rules.urls.length === 1 ? 'this page' : `these ${rules.urls.length} pages`
  segs.push({ kind: 'pill', name: 'url',       pillKey: 'url',       value: urlPillText,           field: 'urls' })
  segs.push({ kind: 'text', value: ' from ' })
  segs.push({ kind: 'pill', name: 'dates',     pillKey: 'dateStart', value: rules.dateRange.start, field: 'dateRange' })
  segs.push({ kind: 'text', value: ' to ' })
  segs.push({ kind: 'pill', name: 'dates',     pillKey: 'dateEnd',   value: rules.dateRange.end,   field: 'dateRange' })
  if (rules.elementTrigger) {
    segs.push({ kind: 'text', value: ', when the user clicks ' })
    segs.push({ kind: 'pill', name: 'trigger', pillKey: 'trigger',   value: rules.elementTrigger.name, field: 'elementTrigger', dismissible: true })
  }
  if (rules.showFrequency) {
    segs.push({ kind: 'text', value: ', up to ' })
    segs.push({ kind: 'pill', name: 'frequency', pillKey: 'frequency', value: `${rules.occurrences} times`, field: 'occurrences', dismissible: true })
    segs.push({ kind: 'text', value: ' per user' })
  }
  if (rules.showAudience) {
    segs.push({ kind: 'text', value: ', for ' })
    segs.push({ kind: 'pill', name: 'audience',  pillKey: 'audience',  value: rules.audience,        field: 'audience',    dismissible: true })
  }
  segs.push({ kind: 'text', value: '.' })
  return segs
}

function SummaryView({
  template, rules, setRules, highlightedFields, onEdit, onSetManually,
  startPicker, selectedElement, setSelectedElement,
  onOpenReasoning,
  hasTypedSummary, onTypingDone,
}: {
  template: PopupTemplate | null
  rules: VRRules
  setRules: React.Dispatch<React.SetStateAction<VRRules>>
  highlightedFields: Set<string>
  onEdit: () => void
  onSetManually: () => void
  startPicker: () => void
  selectedElement: ElementInfo | null
  setSelectedElement: (el: ElementInfo | null) => void
  onOpenReasoning: () => void
  hasTypedSummary: boolean
  onTypingDone: () => void
}) {
  const [openPill, setOpenPill] = useState<PillName | null>(null)
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const popoverRef = useRef<HTMLDivElement>(null)
  const [pickerOrigin, setPickerOrigin] = useState<'trigger' | null>(null)
  const [pencilHover, setPencilHover] = useState(false)

  // Typing animation — skip entirely if typing has already happened in this session
  const segments = buildSegments(rules)
  const totalChars = segments.reduce((sum, seg) => sum + seg.value.length, 0)
  const [typedCount, setTypedCount] = useState(hasTypedSummary ? totalChars : 0)
  const [hasFinishedTyping, setHasFinishedTyping] = useState(hasTypedSummary)

  useEffect(() => {
    if (hasFinishedTyping) return
    if (typedCount < totalChars) {
      const t = setTimeout(() => setTypedCount((c) => c + 2), 38)
      return () => clearTimeout(t)
    }
    setHasFinishedTyping(true)
    onTypingDone()
  }, [typedCount, totalChars, hasFinishedTyping, onTypingDone])

  // When picker returns an element AND we initiated from trigger popover, update rule
  useEffect(() => {
    if (selectedElement && pickerOrigin === 'trigger') {
      setRules(prev => ({ ...prev, elementTrigger: selectedElement }))
      setSelectedElement(null)
      setPickerOrigin(null)
    }
  }, [selectedElement, pickerOrigin, setRules, setSelectedElement])

  // Click outside closes popover
  useEffect(() => {
    if (!openPill) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (popoverRef.current?.contains(target)) return
      const isPill = Object.values(pillRefs.current).some(ref => ref?.contains(target))
      if (isPill) return
      setOpenPill(null)
      setPopoverPos(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openPill])

  const openPopoverFor = (name: PillName, pillKey: string) => {
    const pillEl = pillRefs.current[pillKey]
    const cardEl = cardRef.current
    if (!pillEl || !cardEl) return
    const pillRect = pillEl.getBoundingClientRect()
    const cardRect = cardEl.getBoundingClientRect()
    const popWidth = 270
    setPopoverPos({
      top: pillRect.bottom - cardRect.top + 6,
      left: Math.max(0, Math.min(
        pillRect.left - cardRect.left,
        cardRect.width - popWidth - 4
      )),
    })
    setOpenPill(name)
  }

  const closePopover = () => {
    setOpenPill(null)
    setPopoverPos(null)
  }

  const renderPopoverContent = (): React.ReactNode => {
    if (!openPill) return null
    if (openPill === 'url')       return <UrlPopover       rules={rules} setRules={setRules} onClose={closePopover} onEditWithAI={() => { closePopover(); onEdit() }} />
    if (openPill === 'dates')     return <DatesPopover     rules={rules} setRules={setRules} onClose={closePopover} onEditWithAI={() => { closePopover(); onEdit() }} />
    if (openPill === 'trigger')   return <TriggerPopover   rules={rules} onRePick={() => { setPickerOrigin('trigger'); startPicker() }} onClose={closePopover} onEditWithAI={() => { closePopover(); onEdit() }} />
    if (openPill === 'frequency') return <FrequencyPopover rules={rules} setRules={setRules} onClose={closePopover} onEditWithAI={() => { closePopover(); onEdit() }} />
    if (openPill === 'audience')  return <AudiencePopover  rules={rules} setRules={setRules} onClose={closePopover} onEditWithAI={() => { closePopover(); onEdit() }} />
    return null
  }

  // Build the rendered text/pills based on typedCount
  let remaining = hasFinishedTyping ? Number.MAX_SAFE_INTEGER : typedCount
  const els: React.ReactNode[] = []
  let key = 0
  for (const seg of segments) {
    const visible = Math.min(seg.value.length, remaining)
    if (visible <= 0 && !hasFinishedTyping) break
    if (visible <= 0) continue
    remaining -= visible

    const text = seg.value.slice(0, visible)
    if (seg.kind === 'text') {
      els.push(<span key={key++}>{text}</span>)
    } else {
      const isDismissible = !!seg.dismissible && hasFinishedTyping
      els.push(
        <SummaryPill
          key={key++}
          name={seg.name}
          pillKey={seg.pillKey}
          isActive={openPill === seg.name}
          isHighlighted={highlightedFields.has(seg.field)}
          refStore={pillRefs}
          onClick={() => openPopoverFor(seg.name, seg.pillKey)}
          dismissible={isDismissible}
          onDismiss={
            seg.field === 'elementTrigger'
              ? () => setRules((prev) => ({ ...prev, elementTrigger: null }))
              : seg.field === 'occurrences'
                ? () => setRules((prev) => ({ ...prev, showFrequency: false }))
                : seg.field === 'audience'
                  ? () => setRules((prev) => ({ ...prev, showAudience: false }))
                  : undefined
          }
        >
          {text}
        </SummaryPill>
      )
    }
  }

  return (
    <div className="vr-fade-in" style={{ padding: '20px 16px 24px' }}>
      {/* Single premium card with subtle blue tint */}
      <div ref={cardRef} style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #FBFCFE 0%, #F1F5FB 100%)',
        border: '1px solid rgba(37, 99, 235, 0.10)',
        borderRadius: 18,
        padding: '24px 22px 18px',
        boxShadow: '0 1px 0 rgba(255, 255, 255, 0.7) inset, 0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(37, 99, 235, 0.06), 0 24px 48px rgba(15, 23, 42, 0.04)',
        overflow: 'visible',
      }}>
        {/* Decorative subtle radial glow at top right */}
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '70%', height: '50%',
          background: 'radial-gradient(80% 100% at 100% 0%, rgba(37, 99, 235, 0.06) 0%, transparent 70%)',
          borderRadius: '0 18px 0 0',
          pointerEvents: 'none',
        }} />

        {/* Quiet pencil button — top-right corner, transparent, no layout impact */}
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }}>
          {hasFinishedTyping && (
            <button
              onClick={onEdit}
              onMouseEnter={() => setPencilHover(true)}
              onMouseLeave={() => setPencilHover(false)}
              className="ai-pencil-btn-quiet summary-fade-in-1"
              aria-label="Edit with AI"
              style={{
                width: 26, height: 26,
                borderRadius: 7,
                background: 'transparent',
                color: '#6B7280',
                border: 'none',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0,
                transition: 'background 150ms, color 150ms',
              }}
            >
              <Pencil size={13} strokeWidth={2.2} className="ai-pencil-icon" />
            </button>
          )}
          {hasFinishedTyping && pencilHover && (
            <div className="pencil-tooltip-in" style={{
              position: 'absolute',
              top: '100%', right: 0, marginTop: 6,
              background: '#0A0A0A',
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 500,
              padding: '5px 10px',
              borderRadius: 7,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.20)',
              letterSpacing: '-0.005em',
              pointerEvents: 'none',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Sparkles size={10} strokeWidth={2.4} className="ai-sparkle-twinkle" />
              Edit with AI
            </div>
          )}
        </div>

        <div style={{
          position: 'relative',
          fontSize: 14, lineHeight: 1.85, color: '#18181B',
          fontWeight: 400, letterSpacing: '-0.011em',
          minHeight: 80,
        }}>
          {els}
          {!hasFinishedTyping && <span className="typing-cursor">|</span>}
        </div>

        {hasFinishedTyping && (
          <div className="summary-fade-in-2" style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: '1px solid rgba(37, 99, 235, 0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <button
              onClick={onOpenReasoning}
              className="card-foot-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#525252', fontSize: 11.5, fontWeight: 500,
                padding: '2px 0', letterSpacing: '-0.005em',
                transition: 'color 150ms',
              }}
            >
              <Lightbulb size={11} strokeWidth={2.2} />
              Why this rule
            </button>
            <button
              onClick={onOpenReasoning}
              className="card-foot-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#525252', fontSize: 11.5, fontWeight: 500,
                padding: '2px 0', letterSpacing: '-0.005em',
                transition: 'color 150ms',
              }}
            >
              <Sparkles size={11} strokeWidth={2.2} className="ai-sparkle-twinkle" />
              AI generated
            </button>
          </div>
        )}

        {/* Popover */}
        {openPill && popoverPos && (
          <div
            ref={popoverRef}
            className="popover-in"
            style={{
              position: 'absolute',
              top: popoverPos.top,
              left: popoverPos.left,
              width: 270,
              background: '#FFFFFF',
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              boxShadow: C.popoverShadow,
              padding: 14,
              zIndex: 50,
            }}
          >
            {renderPopoverContent()}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
        <button onClick={onSetManually} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#9CA3AF', fontSize: 12, fontWeight: 500,
          padding: '4px 8px',
          letterSpacing: '-0.005em',
        }}>
          Set up manually →
        </button>
      </div>
    </div>
  )
}

// ─── Manual VR fallback ───────────────────────────────────────────────────────

function ManualVR({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          cursor: 'pointer', color: C.textSecondary, fontSize: 12, padding: '14px 18px', fontWeight: 500,
        }}
      >
        <ArrowLeft size={12} /> Back to AI summary
      </button>
      <Accordion title="Where">
        <div style={{ fontSize: 12, color: C.textTertiary }}>Configure where this popup appears.</div>
      </Accordion>
      <Accordion title="When">
        <div style={{ fontSize: 12, color: C.textTertiary }}>Set the schedule and triggers.</div>
      </Accordion>
      <Accordion title="Who">
        <div style={{ fontSize: 12, color: C.textTertiary }}>Choose the audience.</div>
      </Accordion>
    </div>
  )
}

// ─── Visibility Rules Tab (loading + summary) ────────────────────────────────

function buildLoaderMessages(template: PopupTemplate | null): string[] {
  if (!template) {
    return [
      'Reading your popup intent…',
      'Analyzing where it should appear…',
      'Drafting recommended rules…',
      'Almost ready…',
    ]
  }
  if (template.variant === 'snackbar') {
    return [
      `Looking at your "${template.name}" snackbar…`,
      'Snackbars usually live on every page where the user is active…',
      'Capping frequency so it never feels spammy…',
      'Almost ready…',
    ]
  }
  // Modal variants
  const onboardingish = /welcome|familiar|hello/i.test(template.name)
  if (onboardingish) {
    return [
      `Looking at your "${template.name}" popup…`,
      'Onboarding popups usually appear on the dashboard where new users land…',
      'Targeting all users for the first 30 days…',
      'Capping at 4 impressions to avoid notification fatigue…',
    ]
  }
  return [
    `Looking at your "${template.name}" popup…`,
    'Picking the page where it best fits the user journey…',
    'Setting a 30-day window for the announcement…',
    'Almost ready…',
  ]
}

function VisibilityRulesTab({
  template, rules, setRules, highlightedFields, onCustomize,
  startPicker, selectedElement, setSelectedElement,
  onOpenReasoning,
  phase, setPhase,
  hasTypedSummary, setHasTypedSummary,
}: {
  template: PopupTemplate | null
  rules: VRRules
  setRules: React.Dispatch<React.SetStateAction<VRRules>>
  highlightedFields: Set<string>
  onCustomize: () => void
  startPicker: () => void
  selectedElement: ElementInfo | null
  setSelectedElement: (el: ElementInfo | null) => void
  onOpenReasoning: () => void
  phase: 'loading' | 'summary' | 'manual'
  setPhase: React.Dispatch<React.SetStateAction<'loading' | 'summary' | 'manual'>>
  hasTypedSummary: boolean
  setHasTypedSummary: (v: boolean) => void
}) {
  if (phase === 'loading') {
    return <AILoader messages={buildLoaderMessages(template)} />
  }

  if (phase === 'manual') {
    return <ManualVR onBack={() => setPhase('summary')} />
  }

  return (
    <SummaryView
      template={template}
      rules={rules}
      setRules={setRules}
      highlightedFields={highlightedFields}
      onEdit={onCustomize}
      onSetManually={() => setPhase('manual')}
      startPicker={startPicker}
      selectedElement={selectedElement}
      setSelectedElement={setSelectedElement}
      onOpenReasoning={onOpenReasoning}
      hasTypedSummary={hasTypedSummary}
      onTypingDone={() => setHasTypedSummary(true)}
    />
  )
}

// ─── Bottom sheet — prompt + Fluid UI ─────────────────────────────────────────

type FluidKind = 'date' | 'element' | 'audience' | 'compound' | 'frequency' | 'none'

const suggestionChips: { label: string; prompt: string }[] = [
  { label: 'Change date range',          prompt: 'Change the date range to June 1 through June 15' },
  { label: 'Add audience',               prompt: 'Show this only to Sales team users' },
  { label: 'Show on a specific element', prompt: 'Show this only when the user clicks the Login button' },
  { label: 'Limit occurrences',          prompt: 'Stop showing after 2 occurrences' },
]

function classifyPrompt(text: string): FluidKind {
  const t = text.toLowerCase()
  const hasDate     = /(date|range|june|july|august|september|october|november|december|january|february|march|april|may)/.test(t)
  const hasElement  = /(click|button|element|login|trigger|page)/.test(t)
  const hasAudience = /(team|sales|engineering|marketing|cohort|audience|customer success|executive)/.test(t)
  const hasFrequency= /(occurrence|times|stop showing|cap|limit|frequency|impression|show.*after|times per)/.test(t)
  const categories = [hasDate, hasElement, hasAudience].filter(Boolean).length
  if (categories >= 2 && hasDate && hasElement) return 'compound'
  if (hasDate)      return 'date'
  if (hasElement)   return 'element'
  if (hasAudience)  return 'audience'
  if (hasFrequency) return 'frequency'
  return 'none'
}

function extractFrequency(text: string): number {
  const m = text.match(/(\d+)/)
  if (m) return Math.max(1, parseInt(m[1]))
  return 2
}

// Pickable elements that exist on the fake dashboard.  When the user describes an
// element in their prompt, we surface the closest matches as quick-select chips
// inside the Pick element fluid form so they don't have to actually pick.
const elementCandidates: ElementInfo[] = [
  { name: 'Login',           selector: '#top-nav > .btn-login'  },
  { name: 'Dashboard',       selector: '#nav > .nav-dashboard'  },
  { name: 'Contacts',        selector: '#nav > .nav-contacts'   },
  { name: 'Inbox',           selector: '#nav > .nav-inbox'      },
  { name: 'Reports',         selector: '#nav > .nav-reports'    },
  { name: 'Settings',        selector: '#nav > .nav-settings'   },
  { name: 'Total Users',     selector: '#stats > .stat-users'   },
  { name: 'Active Sessions', selector: '#stats > .stat-sessions'},
  { name: 'Tickets Open',    selector: '#stats > .stat-tickets' },
]

function findElementMatches(prompt: string): ElementInfo[] {
  const t = prompt.toLowerCase()
  const matched: ElementInfo[] = []
  for (const c of elementCandidates) {
    const name = c.name.toLowerCase()
    // Match if any word of the candidate name appears in the prompt
    const tokens = name.split(/\s+/)
    if (tokens.some((tok) => tok.length >= 3 && t.includes(tok))) {
      matched.push(c)
    }
  }
  return matched.slice(0, 3)
}

function extractDates(text: string): { start: string; end: string } {
  const m = text.match(/june\s*(\d+)[^0-9]+(\d+)/i)
  if (m) return { start: `June ${m[1]}, 2026`, end: `June ${m[2]}, 2026` }
  const j = text.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d+)/i)
  if (j) {
    const month = j[1][0].toUpperCase() + j[1].slice(1)
    return { start: `${month} ${j[2]}, 2026`, end: `${month} ${parseInt(j[2]) + 14}, 2026` }
  }
  return { start: 'June 1, 2026', end: 'June 15, 2026' }
}

function extractAudience(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('sales'))             return 'Sales team'
  if (t.includes('engineer'))          return 'Engineering'
  if (t.includes('customer success'))  return 'Customer Success'
  if (t.includes('marketing'))         return 'Marketing'
  if (t.includes('executive'))         return 'Executives'
  return 'Sales team'
}

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  onApplyRules: (next: Partial<VRRules>, fields: string[]) => void
  pickerActive: boolean
  startPicker: () => void
  stopPicker: () => void
  selectedElement: ElementInfo | null
  setSelectedElement: (el: ElementInfo | null) => void
  setPreviewElement: (el: ElementInfo | null) => void
}

function ChipButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? '#FFFFFF' : '#F4F4F2',
        border: `1px solid ${hover ? C.borderHover : C.border}`,
        borderRadius: 999,
        padding: '5px 11px',
        fontSize: 11.5, color: C.textSecondary, cursor: 'pointer',
        fontWeight: 500, letterSpacing: '-0.005em',
        transition: 'background 150ms, border-color 150ms',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}

function BottomSheet({
  open, onClose, onApplyRules,
  pickerActive, startPicker, stopPicker,
  selectedElement, setSelectedElement, setPreviewElement,
}: BottomSheetProps) {
  const [prompt, setPrompt] = useState('')
  const [stage, setStage] = useState<'input' | 'processing' | 'fluid'>('input')
  const [fluidKind, setFluidKind] = useState<FluidKind>('none')
  const [extracted, setExtracted] = useState<{ dates?: { start: string; end: string }; audience?: string; frequency?: number; elementMatches?: ElementInfo[] }>({})
  const [compoundStep, setCompoundStep] = useState<1 | 2>(1)
  const [compoundDates, setCompoundDates] = useState<{ start: string; end: string } | null>(null)
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    if (open) {
      setPrompt('')
      setStage('input')
      setFluidKind('none')
      setExtracted({})
      setCompoundStep(1)
      setCompoundDates(null)
      requestAnimationFrame(() => setAnimateIn(true))
    } else {
      setAnimateIn(false)
    }
  }, [open])

  const handleSubmit = () => {
    const text = prompt.trim()
    if (!text) return
    setStage('processing')
    const kind = classifyPrompt(text)
    setExtracted({
      dates: kind === 'date' || kind === 'compound' ? extractDates(text) : undefined,
      audience: kind === 'audience' ? extractAudience(text) : undefined,
      frequency: kind === 'frequency' ? extractFrequency(text) : undefined,
      elementMatches: kind === 'element' || kind === 'compound' ? findElementMatches(text) : undefined,
    })
    setTimeout(() => {
      setFluidKind(kind)
      setStage('fluid')
    }, 2600)
  }

  const handleChipClick = (chipPrompt: string) => {
    setPrompt(chipPrompt)
  }

  const handleClose = () => {
    stopPicker()
    onClose()
  }

  const handleApplyDate = (dates: { start: string; end: string }) => {
    onApplyRules({ dateRange: dates }, ['dateRange'])
    handleClose()
  }
  const handleApplyAudience = (audience: string) => {
    onApplyRules({ audience, showAudience: true }, ['audience'])
    handleClose()
  }
  const handleApplyFrequency = (count: number) => {
    onApplyRules({ occurrences: count, showFrequency: true }, ['occurrences'])
    handleClose()
  }
  const handleApplyElement = () => {
    if (!selectedElement) return
    onApplyRules({ elementTrigger: selectedElement }, ['elementTrigger'])
    setSelectedElement(null)
    handleClose()
  }
  const handleApplyCompound = () => {
    if (!compoundDates || !selectedElement) return
    onApplyRules({ dateRange: compoundDates, elementTrigger: selectedElement }, ['dateRange', 'elementTrigger'])
    setSelectedElement(null)
    handleClose()
  }

  if (!open) return null

  // Adaptive max-height per stage so the drawer feels right-sized for its content
  const stageMaxHeight =
    stage === 'input'      ? 340
    : stage === 'processing' ? 320
    : fluidKind === 'audience' ? 480
    : fluidKind === 'compound' ? 460
    : 420

  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderBottom: 'none',
        borderRadius: '18px 18px 0 0',
        boxShadow: '0 -1px 0 rgba(255, 255, 255, 0.6) inset, 0 -8px 24px rgba(15, 23, 42, 0.08), 0 -24px 64px rgba(15, 23, 42, 0.10)',
        maxHeight: stageMaxHeight,
        display: 'flex', flexDirection: 'column',
        transform: animateIn ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 280ms cubic-bezier(0.32, 0, 0.15, 1), max-height 320ms cubic-bezier(0.32, 0, 0.15, 1)',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
        <div style={{ width: 36, height: 4, background: '#E5E5E3', borderRadius: 999 }} />
      </div>

      <div style={{ padding: '12px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Sparkles size={14} color={C.ai} strokeWidth={2.2} />
          <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em' }}>
            {stage === 'input' ? 'How would you like to change the rules?'
              : stage === 'processing' ? 'Working on it…'
              : 'Make the change'}
          </span>
        </div>
        <HeaderBtn title="Close" onClick={handleClose}><X size={14} strokeWidth={2} /></HeaderBtn>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 14px' }}>
        {stage === 'input' && (
          <>
            <div style={{
              border: `1px solid ${C.border}`, borderRadius: 11, background: '#FFFFFF',
              padding: '10px 12px 8px', transition: 'border-color 150ms',
            }}
              onFocus={e => (e.currentTarget.style.borderColor = C.ai)}
              onBlur={e => (e.currentTarget.style.borderColor = C.border)}
            >
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit() }}
                placeholder="Describe what you'd like to change…"
                rows={2}
                style={{
                  width: '100%', border: 'none', outline: 'none',
                  resize: 'none', fontSize: 13, color: C.textPrimary,
                  fontFamily: "'Inter', -apple-system, sans-serif", lineHeight: 1.5,
                  background: 'transparent',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                <span style={{ fontSize: 11, color: C.textTertiary }}>⌘↵ to submit</span>
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim()}
                  style={{
                    background: prompt.trim() ? C.textPrimary : '#E5E5E3',
                    color: '#ffffff', border: 'none', borderRadius: 7,
                    padding: '5px 12px', fontSize: 12, fontWeight: 600,
                    cursor: prompt.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', gap: 5,
                    transition: 'background 150ms',
                  }}
                >
                  Submit
                  <ArrowUp size={12} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 10.5, color: C.textTertiary, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
                Try one
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {suggestionChips.map(c => (
                  <ChipButton key={c.label} onClick={() => handleChipClick(c.prompt)}>
                    {c.label}
                  </ChipButton>
                ))}
              </div>
            </div>
          </>
        )}

        {stage === 'processing' && (
          <AILoader messages={[
            'Understanding your request…',
            'Building the right form…',
            'Almost there…',
          ]} />
        )}

        {stage === 'fluid' && (
          <>
            {fluidKind === 'date'      && <DateRangeFluid initial={extracted.dates!}       onCancel={handleClose} onApply={handleApplyDate} />}
            {fluidKind === 'audience'  && <AudienceFluid  initial={extracted.audience!}    onCancel={handleClose} onApply={handleApplyAudience} />}
            {fluidKind === 'frequency' && <FrequencyFluid initial={extracted.frequency!}   onCancel={handleClose} onApply={handleApplyFrequency} />}
            {fluidKind === 'element' && (
              <ElementPickerFluid
                matches={extracted.elementMatches ?? []}
                pickerActive={pickerActive}
                selectedElement={selectedElement}
                onCancel={handleClose}
                onApply={handleApplyElement}
                onPick={startPicker}
                onSelectMatch={(m) => setSelectedElement(m)}
                onPreviewMatch={setPreviewElement}
              />
            )}
            {fluidKind === 'compound' && (
              <CompoundFluid
                step={compoundStep}
                dates={compoundDates ?? extracted.dates!}
                onDatesChange={setCompoundDates}
                onNext={() => setCompoundStep(2)}
                onBack={() => { stopPicker(); setCompoundStep(1) }}
                pickerActive={pickerActive}
                selectedElement={selectedElement}
                onPick={startPicker}
                onApplyAll={handleApplyCompound}
                matches={extracted.elementMatches ?? []}
                onSelectMatch={(m) => setSelectedElement(m)}
                onPreviewMatch={setPreviewElement}
              />
            )}
            {fluidKind === 'none' && (
              <div style={{ padding: '32px 16px', fontSize: 13, color: C.textSecondary, textAlign: 'center' }}>
                I couldn&apos;t understand that. Try one of these:
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14, justifyContent: 'center' }}>
                  {suggestionChips.map(c => (
                    <ChipButton key={c.label} onClick={() => { setPrompt(c.prompt); setStage('input') }}>
                      {c.label}
                    </ChipButton>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Fluid UI forms ───────────────────────────────────────────────────────────

function FluidWrapper({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="vr-fade-in fluid-stagger" style={{
      background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: 16,
    }}>
      <div className="fluid-stagger-item" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: C.aiSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.005em' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

function ApplyButtons({ onCancel, onApply, applyLabel = 'Apply', applyDisabled }: {
  onCancel: () => void; onApply: () => void; applyLabel?: string; applyDisabled?: boolean
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
      <button
        onClick={onCancel}
        style={{
          background: 'transparent', border: `1px solid ${C.border}`, color: C.textSecondary,
          borderRadius: 8, padding: '7px 16px', fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
        }}
      >
        Cancel
      </button>
      <button
        onClick={onApply}
        disabled={applyDisabled}
        style={{
          background: applyDisabled ? '#D4D4D1' : C.textPrimary,
          color: '#ffffff', border: 'none', borderRadius: 8,
          padding: '7px 16px', fontSize: 12.5, fontWeight: 600,
          cursor: applyDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        {applyLabel}
      </button>
    </div>
  )
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, color: C.textTertiary, marginBottom: 5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', border: `1px solid ${C.border}`, borderRadius: 9,
            padding: '9px 36px 9px 12px', fontSize: 13, color: C.textPrimary, background: '#ffffff',
            outline: 'none', fontFamily: "'Inter', -apple-system, sans-serif", boxSizing: 'border-box',
            fontWeight: 500,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = C.ai)}
          onBlur={e => (e.currentTarget.style.borderColor = C.border)}
        />
        <Calendar size={14} color={C.textTertiary} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      </div>
    </div>
  )
}

function DateRangeFluid({ initial, onCancel, onApply }: {
  initial: { start: string; end: string }
  onCancel: () => void
  onApply: (dates: { start: string; end: string }) => void
}) {
  const [start, setStart] = useState(initial.start)
  const [end, setEnd]     = useState(initial.end)
  return (
    <FluidWrapper icon={<Calendar size={14} color={C.ai} strokeWidth={2.2} />} title="Date range">
      <div className="fluid-stagger-item"><DateField label="Start date" value={start} onChange={setStart} /></div>
      <div className="fluid-stagger-item"><DateField label="End date"   value={end}   onChange={setEnd} /></div>
      <div className="fluid-stagger-item"><ApplyButtons onCancel={onCancel} onApply={() => onApply({ start, end })} /></div>
    </FluidWrapper>
  )
}

function AudienceFluid({ initial, onCancel, onApply }: {
  initial: string
  onCancel: () => void
  onApply: (audience: string) => void
}) {
  const [selected, setSelected] = useState(initial)
  return (
    <FluidWrapper icon={<Users size={14} color={C.ai} strokeWidth={2.2} />} title="Target audience">
      <div className="fluid-stagger-item" style={{ fontSize: 11, color: C.textTertiary, marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Available groups</div>
      <div className="fluid-stagger-item" style={{ background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 10, padding: 4 }}>
        {userGroups.map(g => {
          const active = selected === g
          return (
            <div
              key={g}
              onClick={() => setSelected(g)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', cursor: 'pointer', borderRadius: 7,
                background: active ? C.aiSoft : 'transparent',
                transition: 'background 150ms',
              }}
            >
              <span style={{
                width: 14, height: 14, borderRadius: '50%',
                border: `2px solid ${active ? C.ai : '#D4D4D1'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'border-color 150ms',
              }}>
                {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.ai }} />}
              </span>
              <span style={{ fontSize: 12.5, color: C.textPrimary, fontWeight: active ? 600 : 500 }}>{g}</span>
            </div>
          )
        })}
      </div>
      <div className="fluid-stagger-item"><ApplyButtons onCancel={onCancel} onApply={() => onApply(selected)} /></div>
    </FluidWrapper>
  )
}

function FrequencyFluid({ initial, onCancel, onApply }: {
  initial: number
  onCancel: () => void
  onApply: (count: number) => void
}) {
  const [count, setCount] = useState(initial)
  const helperText =
    count <= 1 ? 'One-shot — only the very first impression.'
    : count <= 2 ? 'Subtle reminder — won\'t feel intrusive.'
    : count <= 5 ? 'Balanced visibility — most users will notice.'
    : count <= 10 ? 'High visibility — users will see it often.'
    : 'Very high frequency — may feel repetitive.'

  return (
    <FluidWrapper icon={<Repeat size={14} color={C.ai} strokeWidth={2.2} />} title="Frequency cap">
      <div className="fluid-stagger-item" style={{
        fontSize: 11, color: C.textTertiary, marginBottom: 8,
        fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        Maximum impressions per user
      </div>
      <div className="fluid-stagger-item" style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px',
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderRadius: 10,
      }}>
        <button
          onClick={() => setCount((c) => Math.max(1, c - 1))}
          style={{
            width: 30, height: 30, border: `1px solid ${C.border}`, borderRadius: 8,
            background: '#FFFFFF', cursor: 'pointer', fontSize: 16,
            color: C.textSecondary, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 150ms',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#F4F4F2')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
        >
          −
        </button>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
          style={{
            flex: 1, height: 30, border: `1px solid ${C.border}`, borderRadius: 8,
            textAlign: 'center', fontSize: 14, fontWeight: 600, color: C.textPrimary,
            outline: 'none', fontFamily: "'Inter', -apple-system, sans-serif",
            background: '#FFFFFF',
          }}
        />
        <button
          onClick={() => setCount((c) => c + 1)}
          style={{
            width: 30, height: 30, border: `1px solid ${C.border}`, borderRadius: 8,
            background: '#FFFFFF', cursor: 'pointer', fontSize: 16,
            color: C.textSecondary, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 150ms',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#F4F4F2')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
        >
          +
        </button>
      </div>
      <div className="fluid-stagger-item" style={{
        marginTop: 10, padding: '10px 12px',
        background: 'rgba(37, 99, 235, 0.05)',
        border: '1px solid rgba(37, 99, 235, 0.10)',
        borderRadius: 9,
        display: 'flex', alignItems: 'flex-start', gap: 8,
      }}>
        <Sparkles size={11} color="#1D4ED8" strokeWidth={2.4} style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 11.5, color: '#1D4ED8', lineHeight: 1.5, letterSpacing: '-0.005em' }}>
          {helperText}
        </div>
      </div>
      <div className="fluid-stagger-item">
        <ApplyButtons onCancel={onCancel} onApply={() => onApply(count)} />
      </div>
    </FluidWrapper>
  )
}

function MatchCard({ match, onSelect, onPreview }: {
  match: ElementInfo
  onSelect: (m: ElementInfo) => void
  onPreview?: (m: ElementInfo | null) => void
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={() => { onPreview?.(null); onSelect(match) }}
      onMouseEnter={() => { setHover(true); onPreview?.(match) }}
      onMouseLeave={() => { setHover(false); onPreview?.(null) }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px',
        background: hover ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
        border: `1px solid ${hover ? 'rgba(37, 99, 235, 0.30)' : 'rgba(37, 99, 235, 0.14)'}`,
        borderRadius: 10, cursor: 'pointer',
        textAlign: 'left', width: '100%',
        boxShadow: hover ? '0 2px 8px rgba(37, 99, 235, 0.10)' : 'none',
        transition: 'background 150ms, border-color 150ms, box-shadow 150ms, transform 150ms',
        transform: hover ? 'translateY(-1px)' : 'none',
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
        border: '1px solid rgba(37, 99, 235, 0.16)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Crosshair size={13} color="#1D4ED8" strokeWidth={2.4} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, color: C.textPrimary, fontWeight: 600,
          letterSpacing: '-0.005em',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {match.name}
        </div>
        <div style={{
          fontSize: 10.5, color: C.textTertiary, fontFamily: 'monospace', marginTop: 1,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {match.selector}
        </div>
      </div>
      <ChevronRight size={13} color={hover ? '#1D4ED8' : C.textTertiary} strokeWidth={2.4} style={{ transition: 'color 150ms' }} />
    </button>
  )
}

function ElementPickerFluid({ matches, pickerActive, selectedElement, onCancel, onApply, onPick, onSelectMatch, onPreviewMatch }: {
  matches: ElementInfo[]
  pickerActive: boolean
  selectedElement: ElementInfo | null
  onCancel: () => void
  onApply: () => void
  onPick: () => void
  onSelectMatch: (m: ElementInfo) => void
  onPreviewMatch: (m: ElementInfo | null) => void
}) {
  const hasMatches = matches.length > 0
  return (
    <FluidWrapper icon={<Crosshair size={14} color={C.ai} strokeWidth={2.2} />} title={selectedElement ? 'Element selected' : 'Pick an element'}>
      {selectedElement ? (
        <>
          <div className="fluid-stagger-item" style={{
            background: C.successSoft, border: `1px solid #BBF7D0`, borderRadius: 10,
            padding: 12, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', background: C.success,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Check size={14} color="#ffffff" strokeWidth={3} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12.5, color: C.textPrimary, fontWeight: 600 }}>Button: &quot;{selectedElement.name}&quot;</div>
              <div style={{ fontSize: 11, color: C.textSecondary, fontFamily: 'monospace', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedElement.selector}
              </div>
            </div>
          </div>
          <div className="fluid-stagger-item">
            <ApplyButtons onCancel={onCancel} onApply={onApply} />
          </div>
        </>
      ) : (
        <>
          {hasMatches && (
            <div className="fluid-stagger-item" style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Sparkles size={11} color="#1D4ED8" strokeWidth={2.4} className="ai-sparkle-twinkle" />
                <span style={{
                  fontSize: 10, color: '#1D4ED8', fontWeight: 600,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  AI found {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {matches.map((m) => (
                  <MatchCard key={m.selector} match={m} onSelect={onSelectMatch} onPreview={onPreviewMatch} />
                ))}
              </div>
            </div>
          )}

          {hasMatches ? (
            <div className="fluid-stagger-item" style={{
              display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 12px',
            }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 10.5, color: C.textTertiary, fontWeight: 500, letterSpacing: '-0.005em' }}>
                or pick it yourself
              </span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
          ) : (
            <div className="fluid-stagger-item" style={{ fontSize: 12.5, color: C.textSecondary, marginBottom: 14, lineHeight: 1.5 }}>
              We&apos;ll minimize Studio so you can pick the right element. Once you click an element, you&apos;ll come back here.
            </div>
          )}

          <div className="fluid-stagger-item">
            <button
              onClick={onPick}
              style={{
                width: '100%', background: C.textPrimary, color: '#ffffff', border: 'none',
                borderRadius: 10, padding: '11px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: C.shadowMd,
              }}
            >
              <Crosshair size={14} strokeWidth={2.2} />
              Pick element on the page
            </button>
          </div>
          <div className="fluid-stagger-item" style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 10 }}>
            <button
              onClick={onCancel}
              style={{
                background: 'transparent', border: 'none', color: C.textTertiary,
                padding: '6px 0', fontSize: 12, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </FluidWrapper>
  )
}

function CompoundFluid({
  step, dates, onDatesChange, onNext, onBack,
  pickerActive, selectedElement, onPick, onApplyAll,
  matches, onSelectMatch, onPreviewMatch,
}: {
  step: 1 | 2
  dates: { start: string; end: string }
  onDatesChange: (d: { start: string; end: string }) => void
  onNext: () => void
  onBack: () => void
  pickerActive: boolean
  selectedElement: ElementInfo | null
  onPick: () => void
  onApplyAll: () => void
  matches: ElementInfo[]
  onSelectMatch: (m: ElementInfo) => void
  onPreviewMatch: (m: ElementInfo | null) => void
}) {
  return (
    <div className="vr-fade-in fluid-stagger" style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
      <div className="fluid-stagger-item" style={{ fontSize: 12, color: C.textSecondary, fontWeight: 600 }}>Processing 2 changes</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: step === 1 ? '50%' : '100%', height: '100%', background: C.ai, transition: 'width 280ms ease-out' }} />
        </div>
        <span style={{ fontSize: 11, color: C.textTertiary, fontWeight: 500 }}>Step {step} of 2</span>
      </div>

      {step === 1 ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: C.aiSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={13} color={C.ai} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>Date range</span>
          </div>
          <DateField label="Start date" value={dates.start} onChange={v => onDatesChange({ ...dates, start: v })} />
          <DateField label="End date"   value={dates.end}   onChange={v => onDatesChange({ ...dates, end: v })} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button onClick={onNext} style={{
              background: C.textPrimary, color: '#fff', border: 'none', borderRadius: 8,
              padding: '8px 18px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            }}>
              Next →
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: C.aiSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Crosshair size={13} color={C.ai} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{selectedElement ? 'Element selected' : 'Pick an element'}</span>
          </div>
          {selectedElement ? (
            <div style={{
              background: C.successSoft, border: `1px solid #BBF7D0`, borderRadius: 10,
              padding: 12, display: 'flex', alignItems: 'center', gap: 10, marginTop: 8,
            }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.success, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={14} color="#ffffff" strokeWidth={3} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12.5, color: C.textPrimary, fontWeight: 600 }}>Button: &quot;{selectedElement.name}&quot;</div>
                <div style={{ fontSize: 11, color: C.textSecondary, fontFamily: 'monospace', marginTop: 2 }}>{selectedElement.selector}</div>
              </div>
            </div>
          ) : (
            <>
              {matches.length > 0 && (
                <div style={{ marginTop: 8, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Sparkles size={11} color="#1D4ED8" strokeWidth={2.4} className="ai-sparkle-twinkle" />
                    <span style={{
                      fontSize: 10, color: '#1D4ED8', fontWeight: 600,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>
                      AI found {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {matches.map((m) => (
                      <MatchCard key={m.selector} match={m} onSelect={onSelectMatch} onPreview={onPreviewMatch} />
                    ))}
                  </div>
                </div>
              )}
              {matches.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 10px' }}>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                  <span style={{ fontSize: 10.5, color: C.textTertiary, fontWeight: 500 }}>
                    or pick it yourself
                  </span>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>
              ) : (
                <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 6, marginBottom: 12, lineHeight: 1.5 }}>
                  Studio will minimize so you can pick the element. You&apos;ll come back here.
                </div>
              )}
              <button
                onClick={onPick}
                style={{
                  width: '100%', background: C.textPrimary, color: '#ffffff', border: 'none',
                  borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Crosshair size={14} strokeWidth={2.2} />
                Pick element on the page
              </button>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button onClick={onBack} style={{
              background: 'transparent', border: `1px solid ${C.border}`, color: C.textSecondary,
              borderRadius: 8, padding: '7px 16px', fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
            }}>
              ← Back
            </button>
            <button
              onClick={onApplyAll}
              disabled={!selectedElement}
              style={{
                background: selectedElement ? C.textPrimary : '#D4D4D1', color: '#ffffff', border: 'none',
                borderRadius: 8, padding: '7px 16px', fontSize: 12.5, fontWeight: 600,
                cursor: selectedElement ? 'pointer' : 'not-allowed',
              }}
            >
              Apply all
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Editor (Configurations + VR tabs + footer) ───────────────────────────────

function PopupEditor({ template, onBack, onClose, onMin, rules, setRules, pickerActive, startPicker, stopPicker, selectedElement, setSelectedElement, setPreviewElement }: {
  template: PopupTemplate
  onBack: () => void
  onClose: () => void
  onMin: () => void
  rules: VRRules
  setRules: React.Dispatch<React.SetStateAction<VRRules>>
  pickerActive: boolean
  startPicker: () => void
  stopPicker: () => void
  selectedElement: ElementInfo | null
  setSelectedElement: (el: ElementInfo | null) => void
  setPreviewElement: (el: ElementInfo | null) => void
}) {
  const [tab, setTab] = useState<'config' | 'visibility'>('config')
  const [popupName, setPopupName] = useState(template.name)
  const [showSheet, setShowSheet] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState(false)

  // Lifted state so the VR loading + typing animation only happen ONCE
  // per popup edit session, even when the user toggles between tabs.
  const [vrPhase, setVrPhase] = useState<'loading' | 'summary' | 'manual'>('loading')
  const [hasTypedSummary, setHasTypedSummary] = useState(false)
  const vrTimerStarted = useRef(false)

  useEffect(() => {
    if (tab === 'visibility' && !vrTimerStarted.current) {
      vrTimerStarted.current = true
      // 4 messages × 1100ms + ~500ms hold on the last one
      setTimeout(() => setVrPhase('summary'), 4800)
    }
  }, [tab])

  const applyRules = (next: Partial<VRRules>, fields: string[]) => {
    setRules(prev => ({ ...prev, ...next }))
    setHighlightedFields(new Set(fields))
    setToast(true)
    setTimeout(() => setHighlightedFields(new Set()), 900)
    setTimeout(() => setToast(false), 2400)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.panelBg, position: 'relative' }}>
      <div style={{
        background: C.panelBg, borderBottom: `1px solid ${C.border}`,
        padding: '0 12px 0 16px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={18} color={C.textPrimary} strokeWidth={2} />
          <span style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.01em' }}>Creating Popup</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <HeaderBtn title="Minimize" onClick={onMin}><Minus size={15} strokeWidth={2} /></HeaderBtn>
          <HeaderBtn title="Close" onClick={onClose}><X size={15} strokeWidth={2} /></HeaderBtn>
        </div>
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        <input
          value={popupName}
          onChange={e => setPopupName(e.target.value)}
          placeholder="Enter Popup name"
          style={{
            width: '100%', border: `1px solid ${C.border}`, borderRadius: 9,
            padding: '9px 12px', fontSize: 13, color: C.textPrimary, outline: 'none',
            fontFamily: "'Inter', -apple-system, sans-serif", boxSizing: 'border-box',
            background: '#FFFFFF', fontWeight: 500,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = C.borderHover)}
          onBlur={e => (e.currentTarget.style.borderColor = C.border)}
        />
      </div>

      <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, marginTop: 14 }}>
        {(['config', 'visibility'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, background: 'none', border: 'none', cursor: 'pointer',
              padding: '12px 8px', fontSize: 11.5, fontWeight: 600,
              color: tab === t ? C.accent : C.textTertiary,
              borderBottom: `2px solid ${tab === t ? C.accent : 'transparent'}`,
              letterSpacing: '0.05em', textTransform: 'uppercase',
              transition: 'color 150ms, border-color 150ms',
              marginBottom: -1,
            }}
          >
            {t === 'config' ? 'Configurations' : 'Visibility Rules'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {tab === 'config'
          ? <ConfigurationsTab />
          : (
            <VisibilityRulesTab
              template={template}
              rules={rules}
              setRules={setRules}
              highlightedFields={highlightedFields}
              onCustomize={() => setShowSheet(true)}
              startPicker={startPicker}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              onOpenReasoning={() => setShowReasoning(true)}
              phase={vrPhase}
              setPhase={setVrPhase}
              hasTypedSummary={hasTypedSummary}
              setHasTypedSummary={setHasTypedSummary}
            />
          )
        }
      </div>

      <div style={{
        borderTop: `1px solid ${C.border}`, padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#FFFFFF', flexShrink: 0,
      }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.accent, fontSize: 13, fontWeight: 600 }}>
          Discard
        </button>
        <button
          style={{
            background: C.accent, color: '#ffffff', border: 'none', borderRadius: 9,
            padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(212,87,42,0.25)',
          }}
          onClick={() => {
            setToast(true)
            setTimeout(() => setToast(false), 2400)
          }}
        >
          Save Pop-up
        </button>
      </div>

      {/* Rule updated toast — slides up from the bottom of the studio */}
      {toast && (
        <div className="vr-toast-bottom" style={{
          position: 'absolute', left: '50%', bottom: 88,
          transform: 'translateX(-50%)',
          background: '#FFFFFF',
          border: '1px solid #BBF7D0',
          color: C.success,
          fontSize: 11.5, fontWeight: 600,
          padding: '7px 14px', borderRadius: 999,
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 1px 0 rgba(255, 255, 255, 0.7) inset, 0 6px 16px rgba(22, 163, 74, 0.18), 0 2px 6px rgba(22, 163, 74, 0.10)',
          letterSpacing: '-0.005em',
          zIndex: 50,
        }}>
          <Check size={11} strokeWidth={3} />
          Rule updated
        </div>
      )}

      {/* Dim overlay above the bottom sheet so it reads as a modal drawer */}
      {showSheet && (
        <div
          onClick={() => setShowSheet(false)}
          className="sheet-dim-in"
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(15, 23, 42, 0.22)',
            backdropFilter: 'blur(1px)',
            WebkitBackdropFilter: 'blur(1px)',
            zIndex: 9,
            cursor: 'pointer',
          }}
        />
      )}

      <BottomSheet
        open={showSheet}
        onClose={() => setShowSheet(false)}
        onApplyRules={applyRules}
        pickerActive={pickerActive}
        startPicker={startPicker}
        stopPicker={stopPicker}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        setPreviewElement={setPreviewElement}
      />

      {/* Reasoning modal — centered in studio */}
      {showReasoning && (
        <ReasoningModal template={template} rules={rules} onClose={() => setShowReasoning(false)} />
      )}
    </div>
  )
}

// ─── Public PopupFlow component ───────────────────────────────────────────────

export interface PopupFlowProps {
  onClose: () => void
  onMin: () => void
  template: PopupTemplate | null
  setTemplate: (t: PopupTemplate | null) => void
  pickerActive: boolean
  startPicker: () => void
  stopPicker: () => void
  selectedElement: ElementInfo | null
  setSelectedElement: (el: ElementInfo | null) => void
  setPreviewElement: (el: ElementInfo | null) => void
}

export function PopupFlow({
  onClose, onMin, template, setTemplate,
  pickerActive, startPicker, stopPicker,
  selectedElement, setSelectedElement,
  setPreviewElement,
}: PopupFlowProps) {
  const [rules, setRules] = useState<VRRules>(defaultRules)

  if (!template) {
    return <TemplateGrid onPickTemplate={setTemplate} onClose={onClose} onMin={onMin} />
  }

  return (
    <PopupEditor
      template={template}
      onBack={() => setTemplate(null)}
      onClose={onClose}
      onMin={onMin}
      rules={rules}
      setRules={setRules}
      pickerActive={pickerActive}
      startPicker={startPicker}
      stopPicker={stopPicker}
      selectedElement={selectedElement}
      setSelectedElement={setSelectedElement}
      setPreviewElement={setPreviewElement}
    />
  )
}

// ─── Popup overlay rendered on the fake app (left zone) ───────────────────────

export function PopupOverlayOnApp({ template }: { template: PopupTemplate }) {
  if (template.variant === 'snackbar') {
    return (
      <div style={{ position: 'absolute', left: 32, bottom: 32, zIndex: 60 }}>
        <div style={{
          background: '#0A0A0A', color: '#ffffff', borderRadius: 12, padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 16,
          boxShadow: '0 16px 48px rgba(15, 23, 42, 0.30), 0 4px 12px rgba(15, 23, 42, 0.12)',
          maxWidth: 380,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.005em' }}>{template.heading}</div>
            <div style={{ fontSize: 12, color: '#A3A3A3', marginTop: 3 }}>{template.body}</div>
          </div>
          <button style={{
            background: '#ffffff', color: '#0A0A0A', border: 'none', borderRadius: 7,
            padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
            {template.primaryCta}
          </button>
        </div>
      </div>
    )
  }

  const isMedia = template.variant === 'modal-media'
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.32)', zIndex: 60,
      backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="popup-overlay-card" style={{
        background: '#FFFFFF', borderRadius: 16, padding: 32, width: 400,
        boxShadow: '0 32px 80px rgba(15, 23, 42, 0.30), 0 8px 24px rgba(15, 23, 42, 0.12)',
        textAlign: 'center', position: 'relative',
      }}>
        <button style={{
          position: 'absolute', top: 14, right: 14, background: 'none', border: 'none',
          cursor: 'pointer', color: '#A3A3A3',
          width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <X size={16} />
        </button>
        {isMedia && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: template.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 24, fontWeight: 800,
              boxShadow: `0 8px 20px ${template.accent}40`,
            }}>W</div>
          </div>
        )}
        <div style={{ fontSize: 19, fontWeight: 700, color: C.textPrimary, marginBottom: 8, letterSpacing: '-0.015em' }}>{template.heading}</div>
        <div style={{ fontSize: 13.5, color: C.textSecondary, lineHeight: 1.55, marginBottom: 22 }}>{template.body}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {template.secondaryCta && (
            <button style={{
              background: '#FFFFFF', color: C.textSecondary, border: `1px solid ${C.border}`,
              borderRadius: 9, padding: '9px 22px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>
              {template.secondaryCta}
            </button>
          )}
          <button style={{
            background: template.accent, color: '#ffffff', border: 'none', borderRadius: 9,
            padding: '9px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: `0 6px 16px ${template.accent}40`,
          }}>
            {template.primaryCta}
          </button>
        </div>
      </div>
    </div>
  )
}
