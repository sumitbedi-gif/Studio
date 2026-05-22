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
  Clock,
  Zap,
  Hash,
  Mic,
  FileVideo,
  MonitorUp,
  MonitorPlay,
  CornerDownLeft,
  Pencil,
  Square,
  MapPin,
  User,
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
  // AI-affordance accent. Whatfix uses a neutral grey here so AI features
  // sit in the surface, not on top of it. The legacy blue is gone — the
  // tokens stay so existing call-sites keep working.
  ai:             '#1F1F32',  // primary text/active accent
  aiDark:         '#0A0A0A',  // pressed/hover accent
  aiSoft:         '#F4F4F5',  // soft fill (icon backdrops, active rows)
  aiSoftBorder:   '#ECECF3',  // hairline on soft fill
  aiPillActive:   '#ECECF3',  // active pill bg
  aiRing:         '#525066',  // focus ring (used as 1px border, not glow)
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
  // Visibility flags for the "required-ish" fields. Letting users dismiss them
  // collapses the section into an empty state with an Add CTA so nothing is
  // ever a permanent commitment.
  showDateRange: boolean
  showUrls: boolean
  // Extended dimensions
  flowTrigger: { name: string; step?: string } | null
  timeWindow: { start: string; end: string } | null
  cohort: string | null
  urlConditions: { field: string; operator: string; value: string }[] | null
  elementCondition: { element: string; condition: 'equals' | 'contains' | 'exists'; value?: string } | null
  weekDays: string[] | null
}

const defaultRules: VRRules = {
  urls: [{ display: 'app.acme.com/dashboard', full: 'https://app.acme.com/dashboard/home' }],
  dateRange: { start: 'May 1, 2026', end: 'May 31, 2026' },
  occurrences: 4,
  audience: 'All users',
  elementTrigger: null,
  showFrequency: true,
  showAudience: true,
  showDateRange: true,
  showUrls: true,
  flowTrigger: null,
  timeWindow: null,
  cohort: null,
  urlConditions: null,
  elementCondition: null,
  weekDays: null,
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

function AILoader({ messages, centered = false }: { messages: string[]; centered?: boolean }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    // Advance one message at a time and STOP at the last one — never loop.
    // The parent decides when loading ends; the final message holds until then.
    if (idx >= messages.length - 1) return
    const t = setTimeout(() => setIdx(i => i + 1), 1100)
    return () => clearTimeout(t)
  }, [idx, messages.length])

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, padding: centered ? 0 : '52px 24px' }}>
      <div style={{ position: 'relative', width: 92, height: 92, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Pulsing radial glow background */}
        <div className="ai-glow-bg" style={{
          position: 'absolute', inset: -10,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(15, 23, 42, 0.18) 0%, rgba(15, 23, 42, 0.06) 35%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Core rings + sparkle wrapper */}
        <div style={{ position: 'relative', width: 68, height: 68 }}>
          {/* Outer ring */}
          <div className="ai-ring-1" style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'conic-gradient(from 0deg, transparent 0deg, #94A3B8 80deg, #0F172A 140deg, transparent 220deg)',
            WebkitMask: 'radial-gradient(circle, transparent 70%, black 72%)',
            mask: 'radial-gradient(circle, transparent 70%, black 72%)',
          }} />
          {/* Inner ring */}
          <div className="ai-ring-2" style={{
            position: 'absolute', inset: 6, borderRadius: '50%',
            background: 'conic-gradient(from 180deg, transparent 0deg, #CBD5E1 90deg, transparent 180deg)',
            WebkitMask: 'radial-gradient(circle, transparent 60%, black 62%)',
            mask: 'radial-gradient(circle, transparent 60%, black 62%)',
          }} />
          {/* Sparkle center */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div className="ai-sparkle-pulse" style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#F1F5F9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 0 rgba(255, 255, 255, 0.6) inset, 0 4px 12px rgba(15, 23, 42, 0.22)',
            }}>
              <Sparkles size={16} color="#0F172A" strokeWidth={2.4} />
            </div>
          </div>
        </div>

        {/* Orbiting particles */}
        <div className="ai-orbit-1" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <span style={{
            position: 'absolute', top: 0, left: '50%',
            width: 5, height: 5, borderRadius: '50%',
            background: '#0F172A',
            boxShadow: '0 0 8px rgba(15, 23, 42, 0.6)',
            transform: 'translateX(-50%)',
          }} />
        </div>
        <div className="ai-orbit-2" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <span style={{
            position: 'absolute', bottom: 4, right: 8,
            width: 4, height: 4, borderRadius: '50%',
            background: '#334155',
            boxShadow: '0 0 6px rgba(51, 65, 85, 0.55)',
          }} />
        </div>
        <div className="ai-orbit-3" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <span style={{
            position: 'absolute', top: '55%', left: 2,
            width: 3, height: 3, borderRadius: '50%',
            background: '#64748B',
            boxShadow: '0 0 6px rgba(100, 116, 139, 0.5)',
          }} />
        </div>
      </div>

      <div key={idx} className="ai-text-cycle" style={{
        fontSize: 13.5, color: C.textSecondary, fontWeight: 500, textAlign: 'center', minHeight: 20,
        letterSpacing: '-0.005em', maxWidth: 260,
      }}>
        {messages[idx]}
      </div>
    </div>
  )

  if (!centered) return content

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {content}
    </div>
  )
}

// ─── Pill (clickable inline value in summary) ────────────────────────────────

type PillName = 'url' | 'dates' | 'time' | 'trigger' | 'frequency' | 'audience'

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
  // Almost invisible at rest so the sentence reads as text. Border deepens
  // on hover/active to confirm interactivity without flooding the surface.
  const bg = isActive
    ? '#ECECF3'
    : hover
      ? '#F4F4F5'
      : '#FAFAFC'
  const borderColor = isActive
    ? '#DFDDE7'
    : hover
      ? '#ECECF3'
      : '#F2F2F8'

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
          color: '#1F1F32',
          border: `1px solid ${borderColor}`,
          borderRadius: 5,
          padding: '0px 6px 1px',
          margin: '0 2px',
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'inherit',
          verticalAlign: 'baseline',
          letterSpacing: '-0.008em',
          lineHeight: 1.4,
          boxShadow: 'none',
          transition: 'background 160ms, border-color 160ms, color 160ms',
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
        width: 24, height: 24, borderRadius: 6, background: '#F6F6F9',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1F1F32', letterSpacing: '-0.005em' }}>{title}</span>
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

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%', border: '1px solid #ECECF3', borderRadius: 8,
        padding: '8px 10px', fontSize: 12.5, color: '#1F1F32', background: '#FFFFFF',
        outline: 'none', fontFamily: "'Inter', -apple-system, sans-serif", boxSizing: 'border-box',
        fontWeight: 500,
        ...(props.style || {}),
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#525066'; props.onFocus?.(e) }}
      onBlur={(e) => { e.currentTarget.style.borderColor = '#ECECF3'; props.onBlur?.(e) }}
    />
  )
}

// ─── Per-pill popover content ────────────────────────────────────────────────

function UrlPopover({ rules, setRules, onClose }: {
  rules: VRRules; setRules: React.Dispatch<React.SetStateAction<VRRules>>;
  onClose: () => void;
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
      <PopoverHeader icon={<Globe2 size={13} color="#525066" strokeWidth={2.2} />} title="Where to show" />
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
            color: '#1F1F32', fontSize: 11.5, fontWeight: 600,
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
    </>
  )
}

function DatesPopover({ rules, setRules, onClose }: {
  rules: VRRules; setRules: React.Dispatch<React.SetStateAction<VRRules>>;
  onClose: () => void;
}) {
  const [start, setStart] = useState(rules.dateRange.start)
  const [end, setEnd] = useState(rules.dateRange.end)
  const handleSave = () => {
    setRules(prev => ({ ...prev, dateRange: { start, end } }))
    onClose()
  }
  return (
    <>
      <PopoverHeader icon={<CalendarDays size={13} color="#525066" strokeWidth={2.2} />} title="Date range" />
      <div style={{ fontSize: 10, color: C.textTertiary, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>Start</div>
      <StyledInput value={start} onChange={(e) => setStart(e.target.value)} style={{ marginBottom: 8 }} />
      <div style={{ fontSize: 10, color: C.textTertiary, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>End</div>
      <StyledInput value={end} onChange={(e) => setEnd(e.target.value)} />
      <PopoverActions onSave={handleSave} onCancel={onClose} />
    </>
  )
}

function TimePopover({ rules, setRules, onClose }: {
  rules: VRRules; setRules: React.Dispatch<React.SetStateAction<VRRules>>;
  onClose: () => void;
}) {
  const [start, setStart] = useState(rules.timeWindow?.start ?? '9:00 AM')
  const [end, setEnd] = useState(rules.timeWindow?.end ?? '5:00 PM')
  const handleSave = () => {
    setRules(prev => ({ ...prev, timeWindow: { start, end } }))
    onClose()
  }
  const handleClear = () => {
    setRules(prev => ({ ...prev, timeWindow: null }))
    onClose()
  }
  return (
    <>
      <PopoverHeader icon={<Clock size={13} color="#525066" strokeWidth={2.2} />} title="Daily time window" />
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: C.textTertiary, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>From</div>
          <StyledInput value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: C.textTertiary, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>To</div>
          <StyledInput value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>
      {rules.timeWindow && (
        <button
          onClick={handleClear}
          style={{
            marginTop: 10, background: 'transparent', border: 'none',
            color: '#8C899F', fontSize: 11, fontWeight: 500,
            padding: 0, cursor: 'pointer', letterSpacing: '-0.005em',
          }}
        >
          Show any time
        </button>
      )}
      <PopoverActions onSave={handleSave} onCancel={onClose} />
    </>
  )
}

function TriggerPopover({ rules, onRePick, onClose }: {
  rules: VRRules; onRePick: () => void; onClose: () => void;
}) {
  return (
    <>
      <PopoverHeader icon={<MousePointer2 size={13} color="#525066" strokeWidth={2.2} />} title="Trigger element" />
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
    </>
  )
}

function FrequencyPopover({ rules, setRules, onClose }: {
  rules: VRRules; setRules: React.Dispatch<React.SetStateAction<VRRules>>;
  onClose: () => void;
}) {
  const [count, setCount] = useState(rules.occurrences)
  const handleSave = () => {
    setRules(prev => ({ ...prev, occurrences: Math.max(1, count), showFrequency: true }))
    onClose()
  }
  return (
    <>
      <PopoverHeader icon={<Repeat size={13} color="#525066" strokeWidth={2.2} />} title="Frequency" />
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
    </>
  )
}

function AudiencePopover({ rules, setRules, onClose }: {
  rules: VRRules; setRules: React.Dispatch<React.SetStateAction<VRRules>>;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState(rules.audience)
  const handleSave = () => {
    setRules(prev => ({ ...prev, audience: selected, showAudience: true }))
    onClose()
  }
  return (
    <>
      <PopoverHeader icon={<Users size={13} color="#525066" strokeWidth={2.2} />} title="Audience" />
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
    </>
  )
}

// ─── Reasoning Modal — centered in studio ────────────────────────────────────

function buildReasons(template: PopupTemplate | null, rules: VRRules): { icon: React.ReactNode; label: string; text: string }[] {
  const reasons: { icon: React.ReactNode; label: string; text: string }[] = []

  // WHERE
  reasons.push({
    icon: <Globe2 size={12} color="#1F1F32" strokeWidth={2.2} />,
    label: 'Where',
    text: rules.urls.length > 1
      ? `Targeting ${rules.urls.length} pages so users see the popup wherever they land in the relevant flow.`
      : template && /welcome|familiar|hello/i.test(template.name)
        ? 'Onboarding popups land best on the home dashboard, where new users typically arrive first.'
        : 'This is the page where similar popups have the highest engagement in your workspace.',
  })

  // WHEN
  reasons.push({
    icon: <CalendarDays size={12} color="#1F1F32" strokeWidth={2.2} />,
    label: 'When',
    text: 'A 30-day window matches your standard rollout cadence for new feature awareness.',
  })

  // TRIGGER (only when set)
  if (rules.elementTrigger) {
    reasons.push({
      icon: <MousePointer2 size={12} color="#1F1F32" strokeWidth={2.2} />,
      label: 'Trigger',
      text: `Catching users at the moment they click ${rules.elementTrigger.name} keeps the message contextual and timely.`,
    })
  }

  // FREQUENCY (only when shown)
  if (rules.showFrequency) {
    reasons.push({
      icon: <Repeat size={12} color="#1F1F32" strokeWidth={2.2} />,
      label: 'Frequency',
      text: `${rules.occurrences} impressions per user is enough to land the message without crossing into notification fatigue.`,
    })
  }

  // AUDIENCE (only when shown)
  if (rules.showAudience) {
    reasons.push({
      icon: <Users size={12} color="#1F1F32" strokeWidth={2.2} />,
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
          border: '1px solid rgba(15, 23, 42, 0.10)',
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
          borderBottom: '1px solid rgba(15, 23, 42, 0.10)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8,
              background: '#F4F4F5',
              border: '1px solid #ECECF3',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={13} color="#1F1F32" strokeWidth={2.4} className="ai-sparkle-twinkle" />
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
                background: 'rgba(15, 23, 42, 0.08)',
                border: '1px solid rgba(15, 23, 42, 0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
              }}>
                {r.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 10, color: '#1F1F32', fontWeight: 600,
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
  if (rules.flowTrigger) {
    segs.push({ kind: 'text', value: rules.flowTrigger.step ? ', after step ' : ', after completing ' })
    const flowVal = rules.flowTrigger.step
      ? `${rules.flowTrigger.step} of ${rules.flowTrigger.name}`
      : rules.flowTrigger.name
    segs.push({ kind: 'pill', name: 'trigger', pillKey: 'flowTrigger', value: flowVal, field: 'flowTrigger', dismissible: true })
  }
  if (rules.elementCondition) {
    const condText = rules.elementCondition.condition === 'exists'
      ? `${rules.elementCondition.element} is present`
      : `${rules.elementCondition.element} = ${rules.elementCondition.value}`
    segs.push({ kind: 'text', value: ', when ' })
    segs.push({ kind: 'pill', name: 'trigger', pillKey: 'elementCondition', value: condText, field: 'elementCondition', dismissible: true })
  }
  if (rules.urlConditions && rules.urlConditions.length > 0) {
    const condText = rules.urlConditions.map(c => `${c.field} ${c.operator} "${c.value}"`).join(' AND ')
    segs.push({ kind: 'text', value: ', where ' })
    segs.push({ kind: 'pill', name: 'url', pillKey: 'urlConditions', value: condText, field: 'urlConditions', dismissible: true })
  }
  if (rules.timeWindow) {
    segs.push({ kind: 'text', value: ', between ' })
    segs.push({ kind: 'pill', name: 'dates', pillKey: 'timeWindow', value: `${rules.timeWindow.start} – ${rules.timeWindow.end}`, field: 'timeWindow', dismissible: true })
    segs.push({ kind: 'text', value: ' daily' })
  }
  if (rules.weekDays && rules.weekDays.length > 0) {
    segs.push({ kind: 'text', value: ', on ' })
    segs.push({ kind: 'pill', name: 'frequency', pillKey: 'weekDays', value: rules.weekDays.join(', '), field: 'weekDays', dismissible: true })
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

// Per-section segment builders for the When/Where/Who layout. Each section
// is its own mini-sentence with clickable pills inline (date pills, audience
// pill, etc.) — same surgical-edit affordance as the legacy summary card,
// just split across the three category buckets.
type SectionKey = 'when' | 'where' | 'who'

function buildWhenSegments(rules: VRRules): Segment[] {
  const segs: Segment[] = []
  if (rules.showDateRange) {
    segs.push({ kind: 'text', value: 'From ' })
    segs.push({ kind: 'pill', name: 'dates', pillKey: 'dateStart', value: rules.dateRange.start, field: 'dateRange', dismissible: true })
    segs.push({ kind: 'text', value: ' to ' })
    segs.push({ kind: 'pill', name: 'dates', pillKey: 'dateEnd',   value: rules.dateRange.end,   field: 'dateRange', dismissible: true })
    segs.push({ kind: 'text', value: ', ' })
  }
  if (rules.timeWindow) {
    segs.push({ kind: 'pill', name: 'time', pillKey: 'timeWindow', value: `${rules.timeWindow.start} – ${rules.timeWindow.end}`, field: 'timeWindow', dismissible: true })
    segs.push({ kind: 'text', value: ' daily' })
  } else {
    segs.push({ kind: 'pill', name: 'time', pillKey: 'timeWindow', value: 'any time', field: 'timeWindow' })
  }
  if (rules.weekDays && rules.weekDays.length > 0) {
    segs.push({ kind: 'text', value: ', on ' })
    segs.push({ kind: 'pill', name: 'frequency', pillKey: 'weekDays', value: rules.weekDays.join(', '), field: 'weekDays', dismissible: true })
  }
  if (rules.elementTrigger) {
    segs.push({ kind: 'text', value: ', when the user clicks ' })
    segs.push({ kind: 'pill', name: 'trigger', pillKey: 'trigger', value: rules.elementTrigger.name, field: 'elementTrigger', dismissible: true })
  }
  if (rules.flowTrigger) {
    segs.push({ kind: 'text', value: rules.flowTrigger.step ? ', after step ' : ', after completing ' })
    const flowVal = rules.flowTrigger.step
      ? `${rules.flowTrigger.step} of ${rules.flowTrigger.name}`
      : rules.flowTrigger.name
    segs.push({ kind: 'pill', name: 'trigger', pillKey: 'flowTrigger', value: flowVal, field: 'flowTrigger', dismissible: true })
  }
  if (rules.elementCondition) {
    const condText = rules.elementCondition.condition === 'exists'
      ? `${rules.elementCondition.element} is present`
      : `${rules.elementCondition.element} = ${rules.elementCondition.value}`
    segs.push({ kind: 'text', value: ', when ' })
    segs.push({ kind: 'pill', name: 'trigger', pillKey: 'elementCondition', value: condText, field: 'elementCondition', dismissible: true })
  }
  if (rules.showFrequency) {
    segs.push({ kind: 'text', value: ', up to ' })
    segs.push({ kind: 'pill', name: 'frequency', pillKey: 'frequency', value: `${rules.occurrences} times`, field: 'occurrences', dismissible: true })
    segs.push({ kind: 'text', value: ' per user' })
  }
  segs.push({ kind: 'text', value: '.' })
  return segs
}

function buildWhereSegments(rules: VRRules): Segment[] {
  const segs: Segment[] = []
  if (rules.showUrls && rules.urls.length > 0) {
    segs.push({ kind: 'text', value: 'On ' })
    const urlPillText = rules.urls.length === 1 ? rules.urls[0].display : `${rules.urls.length} pages`
    segs.push({ kind: 'pill', name: 'url', pillKey: 'url', value: urlPillText, field: 'urls', dismissible: true })
    if (rules.urlConditions && rules.urlConditions.length > 0) {
      const condText = rules.urlConditions.map(c => `${c.field} ${c.operator} "${c.value}"`).join(' AND ')
      segs.push({ kind: 'text', value: ', where ' })
      segs.push({ kind: 'pill', name: 'url', pillKey: 'urlConditions', value: condText, field: 'urlConditions', dismissible: true })
    }
    segs.push({ kind: 'text', value: '.' })
  }
  return segs
}

function buildWhoSegments(rules: VRRules): Segment[] {
  const segs: Segment[] = []
  if (rules.showAudience) {
    segs.push({ kind: 'text', value: 'For ' })
    segs.push({ kind: 'pill', name: 'audience', pillKey: 'audience', value: rules.audience, field: 'audience', dismissible: true })
    // Cohort is supplementary context — only show it when it's actually
    // different from the audience name. Otherwise the legacy cohort handler
    // double-prints the same value.
    if (rules.cohort && rules.cohort !== rules.audience) {
      segs.push({ kind: 'text', value: ' (' })
      segs.push({ kind: 'pill', name: 'audience', pillKey: 'cohort', value: rules.cohort, field: 'cohort', dismissible: true })
      segs.push({ kind: 'text', value: ')' })
    }
    segs.push({ kind: 'text', value: '.' })
  }
  return segs
}

// Chips that appear under the composer at rest as quick scenarios. Match the
// "Try one" set we used inside the legacy bottom drawer.
const composerSuggestionChips: { label: string; prompt: string }[] = [
  { label: 'Change date',     prompt: 'Change the date range to June 1 through June 15' },
  { label: 'Add audience',    prompt: 'Show this only to Sales team users' },
  { label: 'Pick an element', prompt: 'Show this only when the user clicks the Login button' },
  { label: 'Limit shows',     prompt: 'Stop showing after 2 occurrences' },
]

// Status of the composer's submit pipeline: idle → processing (small inline
// loader) → clarifier (compact popover above composer) → done (rules applied).
type ComposerStatus = 'idle' | 'processing' | 'clarifier'

type ClarifierState =
  | { kind: 'date'; dates: { start: string; end: string } }
  | { kind: 'time'; window: { start: string; end: string } }
  | { kind: 'audience'; audience: string }
  | { kind: 'frequency'; frequency: number }
  | { kind: 'element'; matches: ElementInfo[] }
  | { kind: 'compound'; step: 1 | 2; dates: { start: string; end: string }; matches: ElementInfo[] }
  | { kind: 'settings-time'; pendingRules: Partial<VRRules>; pendingFields: string[] }
  | { kind: 'settings-element'; pendingRules: Partial<VRRules>; pendingFields: string[] }
  | { kind: 'generic'; fluidKind: FluidKind; prompt: string }

function SummaryView({
  rules, setRules, highlightedFields,
  startPicker, selectedElement, setSelectedElement, setPreviewElement,
  pickerActive,
  onOpenReasoning,
  hasTypedSummary, onTypingDone,
  recordingPayload, consumeRecordingPayload,
  onApplyRules, onStartRecording, stopPicker,
  isLoadingRules, loaderMessages,
}: {
  rules: VRRules
  setRules: React.Dispatch<React.SetStateAction<VRRules>>
  highlightedFields: Set<string>
  startPicker: () => void
  stopPicker: () => void
  selectedElement: ElementInfo | null
  setSelectedElement: (el: ElementInfo | null) => void
  setPreviewElement: (el: ElementInfo | null) => void
  pickerActive: boolean
  onOpenReasoning: () => void
  hasTypedSummary: boolean
  onTypingDone: () => void
  recordingPayload: RecordingPayload | null
  consumeRecordingPayload: () => void
  onApplyRules: (next: Partial<VRRules>, fields: string[]) => void
  onStartRecording: () => void
  isLoadingRules: boolean
  loaderMessages: string[]
}) {
  // Section segment lists (with clickable pills) computed from current rules.
  const whenSegs  = buildWhenSegments(rules)
  const whereSegs = buildWhereSegments(rules)
  const whoSegs   = buildWhoSegments(rules)
  const segLen = (segs: Segment[]) => segs.reduce((s, x) => s + x.value.length, 0)
  const totals = { when: segLen(whenSegs), where: segLen(whereSegs), who: segLen(whoSegs) }
  const totalChars = totals.when + totals.where + totals.who

  // Typing animation across all three sections in sequence. Doesn't begin
  // until the staged loader is done — otherwise we'd burn through the chars
  // while the skeleton is still on screen and the reveal would feel like an
  // abrupt swap. Once typed in a session, skip it on subsequent visits.
  const [typedCount, setTypedCount] = useState(hasTypedSummary ? totalChars : 0)
  const [hasFinishedTyping, setHasFinishedTyping] = useState(hasTypedSummary)

  useEffect(() => {
    if (hasFinishedTyping || isLoadingRules) return
    if (typedCount < totalChars) {
      const t = setTimeout(() => setTypedCount((c) => c + 2), 22)
      return () => clearTimeout(t)
    }
    setHasFinishedTyping(true)
    onTypingDone()
  }, [typedCount, totalChars, hasFinishedTyping, isLoadingRules, onTypingDone])

  // Per-pill popover state (legacy surgical-edit behavior).
  const [openPill, setOpenPill] = useState<PillName | null>(null)
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const popoverRef = useRef<HTMLDivElement>(null)
  const [pickerOrigin, setPickerOrigin] = useState<'trigger' | 'clarifier-element' | 'clarifier-compound' | null>(null)

  // Inline composer state.
  const [prompt, setPrompt] = useState('')
  const [activeChip, setActiveChip] = useState<SectionKey | null>(null)
  const [attachment, setAttachment] = useState<{ name: string; duration: string } | null>(null)
  const [status, setStatus] = useState<ComposerStatus>('idle')
  const [clarifier, setClarifier] = useState<ClarifierState | null>(null)
  // Latched true once the user has applied any edit. Drives chip-hiding so the
  // "Try one" suggestions feel like training wheels that disappear after the
  // user has demonstrated they know what to do.
  const [hasMadeFirstEdit, setHasMadeFirstEdit] = useState(false)
  // Post-first-edit, chips live behind an accordion + a "Show more" sheet so
  // the surface stays calm but the prompts are reachable.
  const [chipsOpen, setChipsOpen] = useState(false)
  const [scenariosOpen, setScenariosOpen] = useState(false)
  // The composer (textarea + chips + accordion) lives inside a bottom drawer
  // behind the "Edit with prompt" button so the resting surface stays calm
  // and the two entry modes (Record vs. Type) are visually equal.
  const [promptDrawerOpen, setPromptDrawerOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Recording payload arrival — drop the video chip into the composer AND
  // open the prompt drawer so the user can see the attachment + add any text
  // before submitting. We intentionally don't prefill text; the recording is
  // the context.
  useEffect(() => {
    if (recordingPayload) {
      setAttachment(recordingPayload.attachment)
      setPromptDrawerOpen(true)
      consumeRecordingPayload()
    }
  }, [recordingPayload, consumeRecordingPayload])

  // Whenever the parent flashes a highlight set, treat it as evidence that an
  // edit just landed — flip the first-edit latch so chips disappear.
  useEffect(() => {
    if (highlightedFields.size > 0) setHasMadeFirstEdit(true)
  }, [highlightedFields])

  const handleEditSection = (key: SectionKey) => {
    setActiveChip(key)
    setPromptDrawerOpen(true)
    // The drawer's own focus effect handles the textarea — wait long enough
    // for the slide-in to settle so caret lands cleanly.
    setTimeout(() => textareaRef.current?.focus(), 120)
  }

  // When the legacy element picker returns, route based on origin.
  useEffect(() => {
    if (!selectedElement) return
    if (pickerOrigin === 'trigger') {
      setRules(prev => ({ ...prev, elementTrigger: selectedElement }))
      setSelectedElement(null)
      setPickerOrigin(null)
    }
  }, [selectedElement, pickerOrigin, setRules, setSelectedElement])

  // Click outside closes per-pill popover (but not the clarifier popover).
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
        cardRect.width - popWidth - 4,
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
    if (openPill === 'url')       return <UrlPopover       rules={rules} setRules={setRules} onClose={closePopover} />
    if (openPill === 'dates')     return <DatesPopover     rules={rules} setRules={setRules} onClose={closePopover} />
    if (openPill === 'time')      return <TimePopover      rules={rules} setRules={setRules} onClose={closePopover} />
    if (openPill === 'trigger')   return <TriggerPopover   rules={rules} onRePick={() => { setPickerOrigin('trigger'); startPicker() }} onClose={closePopover} />
    if (openPill === 'frequency') return <FrequencyPopover rules={rules} setRules={setRules} onClose={closePopover} />
    if (openPill === 'audience')  return <AudiencePopover  rules={rules} setRules={setRules} onClose={closePopover} />
    return null
  }

  const sectionHighlighted = (key: SectionKey): boolean => {
    if (key === 'when')  return ['dateRange', 'timeWindow', 'occurrences', 'elementTrigger', 'flowTrigger', 'elementCondition', 'weekDays'].some(f => highlightedFields.has(f))
    if (key === 'where') return ['urls', 'urlConditions'].some(f => highlightedFields.has(f))
    return highlightedFields.has('audience') || highlightedFields.has('cohort')
  }

  // ─── Submit pipeline ────────────────────────────────────────────────────
  // Classify the prompt, briefly show the "Working…" inline loader, then
  // either jump to a clarifier popover or apply directly. The behavior
  // mirrors the legacy BottomSheet but stays embedded in the composer.
  const handleSubmitComposer = () => {
    const text = prompt.trim()
    if (!text && !attachment) return
    // Auto-collapse the prompt-suggestions accordion + close the prompt
    // drawer when the user submits — the surface should feel calm during
    // processing and the clarifier rises against the resting view.
    setChipsOpen(false)
    setScenariosOpen(false)
    setPromptDrawerOpen(false)

    // Recording present → the recording is the context. We apply the canned
    // Settings demo as the showcase outcome.
    if (attachment) {
      setStatus('processing')
      setTimeout(() => {
        const settingsEl = elementCandidates.find(e => e.name === 'Settings')!
        onApplyRules(
          {
            dateRange: { start: 'May 5, 2026', end: 'May 5, 2026' },
            timeWindow: { start: '4:00 PM', end: '8:00 PM' },
            elementTrigger: settingsEl,
            occurrences: 999,
            showFrequency: true,
            urls: [
              { display: 'app.acme.com/settings', full: 'https://app.acme.com/settings' },
              { display: 'app.acme.com/account/settings', full: 'https://app.acme.com/account/settings' },
            ],
          },
          ['dateRange', 'timeWindow', 'elementTrigger', 'occurrences', 'urls'],
        )
        resetComposer()
      }, 1500)
      return
    }

    // Typed Settings scenario → chained clarifier (time → element).
    if (isSettingsScenario(text)) {
      setStatus('processing')
      setTimeout(() => {
        setClarifier({
          kind: 'settings-time',
          pendingRules: { dateRange: { start: 'May 5, 2026', end: 'May 5, 2026' }, occurrences: 999, showFrequency: true },
          pendingFields: ['dateRange', 'occurrences'],
        })
        setStatus('clarifier')
      }, 1500)
      return
    }

    setStatus('processing')
    // An active section chip is the user's explicit intent — honor it over
    // whatever the text classifier guesses. Without this bias, typing "change
    // to Marketing" with the Who chip active routes to a date clarifier
    // because the text doesn't mention an audience keyword.
    const chipKind: FluidKind | null =
      activeChip === 'who'   ? 'audience'
      : activeChip === 'where' ? 'urlCondition'
      : activeChip === 'when'  ? (/(\btime\b|\bam\b|\bpm\b|\bhours\b|noon|midnight)/i.test(text) ? 'timeWindow' : 'date')
      : null
    const kind = chipKind ?? classifyPrompt(text)
    setTimeout(() => {
      if (kind === 'date') {
        setClarifier({ kind: 'date', dates: extractDates(text) })
      } else if (kind === 'timeWindow') {
        setClarifier({ kind: 'time', window: extractTimeWindow(text) })
      } else if (kind === 'audience') {
        setClarifier({ kind: 'audience', audience: extractAudience(text) })
      } else if (kind === 'frequency') {
        setClarifier({ kind: 'frequency', frequency: extractFrequency(text) })
      } else if (kind === 'element') {
        setClarifier({ kind: 'element', matches: findElementMatches(text) })
      } else if (kind === 'compound') {
        setClarifier({ kind: 'compound', step: 1, dates: extractDates(text), matches: findElementMatches(text) })
      } else if (kind !== 'none') {
        setClarifier({ kind: 'generic', fluidKind: kind, prompt: text })
      } else {
        setClarifier({ kind: 'date', dates: extractDates(text) })
      }
      setStatus('clarifier')
    }, 1500)
  }

  const resetComposer = () => {
    setPrompt('')
    setAttachment(null)
    setActiveChip(null)
    setStatus('idle')
    setClarifier(null)
    setPickerOrigin(null)
  }

  const cancelClarifier = () => {
    // Cancel returns to the editable composer with the prompt still present.
    stopPicker()
    setStatus('idle')
    setClarifier(null)
    setPickerOrigin(null)
  }

  // Apply handlers per clarifier kind.
  const applyTime = (window: { start: string; end: string }) => {
    onApplyRules({ timeWindow: window }, ['timeWindow'])
    resetComposer()
  }
  const applyDate = (dates: { start: string; end: string }) => {
    onApplyRules({ dateRange: dates }, ['dateRange'])
    resetComposer()
  }
  const applyAudience = (audience: string) => {
    onApplyRules({ audience, showAudience: true }, ['audience'])
    resetComposer()
  }
  const applyFrequency = (count: number) => {
    onApplyRules({ occurrences: count, showFrequency: true }, ['occurrences'])
    resetComposer()
  }
  const applyElement = () => {
    if (!selectedElement) return
    onApplyRules({ elementTrigger: selectedElement }, ['elementTrigger'])
    setSelectedElement(null)
    resetComposer()
  }
  const applyCompound = (dates: { start: string; end: string }) => {
    if (!selectedElement) return
    onApplyRules({ dateRange: dates, elementTrigger: selectedElement }, ['dateRange', 'elementTrigger'])
    setSelectedElement(null)
    resetComposer()
  }
  const applyGeneric = (next: Partial<VRRules>, fields: string[]) => {
    onApplyRules(next, fields)
    resetComposer()
  }

  // Chained Settings scenario — confirm time window, then pick element.
  const acceptSettingsTime = (window: { start: string; end: string }) => {
    if (!clarifier || clarifier.kind !== 'settings-time') return
    setClarifier({
      kind: 'settings-element',
      pendingRules: { ...clarifier.pendingRules, timeWindow: window },
      pendingFields: [...clarifier.pendingFields, 'timeWindow'],
    })
  }
  const acceptSettingsElement = () => {
    if (!clarifier || clarifier.kind !== 'settings-element') return
    if (!selectedElement) return
    const settingsPages = dummyPageGroups.find(p => p.name === 'Settings')?.pages ?? []
    const urls = settingsPages.map(p => ({ display: `app.acme.com/${p}`, full: `https://app.acme.com/${p}` }))
    onApplyRules(
      {
        ...clarifier.pendingRules,
        elementTrigger: selectedElement,
        urls: urls.length ? urls : [{ display: 'app.acme.com/settings', full: 'https://app.acme.com/settings' }],
      },
      [...clarifier.pendingFields, 'elementTrigger', 'urls'],
    )
    setSelectedElement(null)
    resetComposer()
  }

  return (
    <div className="vr-fade-in" style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: '100%', position: 'relative' }}>
      {/* Toned-down section card with clickable pills inside each section. */}
      <div
        ref={cardRef}
        style={{
          position: 'relative',
          background: '#FFFFFF',
          border: '1px solid #ECECF3',
          borderRadius: 12,
          padding: 4,
          boxShadow: '0 1px 0 rgba(255, 255, 255, 0.7) inset',
          overflow: 'visible',
        }}
      >
        {isLoadingRules ? (
          <LoadingSectionCard messages={loaderMessages} />
        ) : (
          <>
            <SectionBlock
              label="Where"
              icon={<MapPin size={11} strokeWidth={2.2} />}
              segments={whereSegs}
              highlighted={sectionHighlighted('where')}
              onEdit={() => handleEditSection('where')}
              revealCount={Math.min(totals.where, typedCount)}
              sectionTotal={totals.where}
              done={hasFinishedTyping}
              openPill={openPill}
              highlightedFields={highlightedFields}
              onPillClick={openPopoverFor}
              pillRefs={pillRefs}
              setRules={setRules}
              emptyHelper={{ prompt: 'Where should this appear?', cta: 'Add pages' }}
              onAddBack={() => setRules((p) => ({ ...p, showUrls: true }))}
            />
            <div style={{ height: 1, background: '#F2F2F8', margin: '0 14px' }} />
            <SectionBlock
              label="When"
              icon={<Clock size={11} strokeWidth={2.2} />}
              segments={whenSegs}
              highlighted={sectionHighlighted('when')}
              onEdit={() => handleEditSection('when')}
              revealCount={Math.min(totals.when, Math.max(0, typedCount - totals.where))}
              sectionTotal={totals.when}
              done={hasFinishedTyping}
              openPill={openPill}
              highlightedFields={highlightedFields}
              onPillClick={openPopoverFor}
              pillRefs={pillRefs}
              setRules={setRules}
              emptyHelper={{ prompt: 'When should this appear?', cta: 'Add date range' }}
              onAddBack={() => setRules((p) => ({ ...p, showDateRange: true }))}
            />
            <div style={{ height: 1, background: '#F2F2F8', margin: '0 14px' }} />
            <SectionBlock
              label="Who"
              icon={<User size={11} strokeWidth={2.2} />}
              segments={whoSegs}
              highlighted={sectionHighlighted('who')}
              onEdit={() => handleEditSection('who')}
              revealCount={Math.min(totals.who, Math.max(0, typedCount - totals.where - totals.when))}
              sectionTotal={totals.who}
              done={hasFinishedTyping}
              openPill={openPill}
              highlightedFields={highlightedFields}
              onPillClick={openPopoverFor}
              pillRefs={pillRefs}
              setRules={setRules}
              emptyHelper={{ prompt: 'Who should see this?', cta: 'Add audience' }}
              onAddBack={() => setRules((p) => ({ ...p, showAudience: true }))}
            />
          </>
        )}

        {/* "AI generated" + "Why this rule" footer disappears the moment the
            user makes a manual edit — the rule is no longer pure AI output. */}
        {hasFinishedTyping && !isLoadingRules && !hasMadeFirstEdit && (
          <div
            className="summary-fade-in-2"
            style={{
              marginTop: 2,
              padding: '10px 14px',
              borderTop: '1px solid #F2F2F8',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <button
              onClick={onOpenReasoning}
              className="card-foot-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#6B697B', fontSize: 11, fontWeight: 500,
                padding: '2px 0', letterSpacing: '-0.005em',
                transition: 'color 150ms',
              }}
            >
              <Lightbulb size={10.5} strokeWidth={2.2} />
              Why this rule
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6B697B', fontSize: 10.5, fontWeight: 500, letterSpacing: '-0.005em' }}>
              <Sparkles size={10.5} strokeWidth={2.2} className="ai-sparkle-twinkle" color="#525066" />
              AI generated
            </div>
          </div>
        )}

        {/* Per-pill surgical-edit popover */}
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
              border: '1px solid #ECECF3',
              borderRadius: 12,
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.08), 0 24px 48px rgba(15, 23, 42, 0.06)',
              padding: 14,
              zIndex: 50,
            }}
          >
            {renderPopoverContent()}
          </div>
        )}
      </div>

      {/* Inline composer — sole entry point for AI edits. */}
      <div style={{ marginTop: 'auto', position: 'relative' }}>
        {/* Clarifier popover above the composer when status is 'clarifier'. */}
        {status === 'clarifier' && clarifier && (
          <div
            className="clarifier-popover-in"
            style={{
              marginBottom: 10,
              background: '#FFFFFF',
              border: '1px solid #ECECF3',
              borderRadius: 12,
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 6px 16px rgba(15, 23, 42, 0.06), 0 20px 40px rgba(15, 23, 42, 0.04)',
              padding: 14,
            }}
          >
            {clarifier.kind === 'date' && (
              <DateRangeFluid initial={clarifier.dates} onCancel={cancelClarifier} onApply={applyDate} />
            )}
            {clarifier.kind === 'time' && (
              <ClarifierTimeWindow
                initial={clarifier.window}
                onCancel={cancelClarifier}
                onAccept={applyTime}
              />
            )}
            {clarifier.kind === 'audience' && (
              <AudienceFluid initial={clarifier.audience} onCancel={cancelClarifier} onApply={applyAudience} />
            )}
            {clarifier.kind === 'frequency' && (
              <FrequencyFluid initial={clarifier.frequency} onCancel={cancelClarifier} onApply={applyFrequency} />
            )}
            {clarifier.kind === 'element' && (
              <ElementPickerFluid
                matches={clarifier.matches}
                pickerActive={pickerActive}
                selectedElement={selectedElement}
                onCancel={cancelClarifier}
                onApply={applyElement}
                onPick={() => { setPickerOrigin('clarifier-element'); startPicker() }}
                onSelectMatch={(m) => setSelectedElement(m)}
                onPreviewMatch={setPreviewElement}
              />
            )}
            {clarifier.kind === 'compound' && (
              <CompoundFluid
                step={clarifier.step}
                dates={clarifier.dates}
                onDatesChange={(d) => clarifier.kind === 'compound' && setClarifier({ ...clarifier, dates: d })}
                onNext={() => clarifier.kind === 'compound' && setClarifier({ ...clarifier, step: 2 })}
                onBack={() => { stopPicker(); clarifier.kind === 'compound' && setClarifier({ ...clarifier, step: 1 }) }}
                pickerActive={pickerActive}
                selectedElement={selectedElement}
                onPick={() => { setPickerOrigin('clarifier-compound'); startPicker() }}
                onApplyAll={() => clarifier.kind === 'compound' && applyCompound(clarifier.dates)}
                matches={clarifier.matches}
                onSelectMatch={(m) => setSelectedElement(m)}
                onPreviewMatch={setPreviewElement}
              />
            )}
            {clarifier.kind === 'settings-time' && (
              <ClarifierTimeWindow
                initial={{ start: '4:00 PM', end: '8:00 PM' }}
                onCancel={cancelClarifier}
                onAccept={acceptSettingsTime}
                caption={<>I caught <strong style={{ color: '#1F1F32', fontWeight: 600 }}>May 5</strong> and <strong style={{ color: '#1F1F32', fontWeight: 600 }}>4 to 8 PM</strong>, confirm the times below and we&apos;ll move on.</>}
                applyLabel="Looks right, next"
              />
            )}
            {clarifier.kind === 'settings-element' && (
              <ElementPickerFluid
                matches={findElementMatches('settings')}
                pickerActive={pickerActive}
                selectedElement={selectedElement}
                onCancel={cancelClarifier}
                onApply={acceptSettingsElement}
                onPick={() => { setPickerOrigin('clarifier-element'); startPicker() }}
                onSelectMatch={(m) => setSelectedElement(m)}
                onPreviewMatch={setPreviewElement}
              />
            )}
            {clarifier.kind === 'generic' && (
              <GenericScenarioFluid
                kind={clarifier.fluidKind}
                prompt={clarifier.prompt}
                onCancel={cancelClarifier}
                onApply={applyGeneric}
              />
            )}
          </div>
        )}

        {/* Two equal-weight entry buttons. Recording is the first-class
            "show, don't tell" path; the prompt drawer is the typed path.
            Visible at the same time so the user's next action is obvious. */}
        {status === 'idle' && (
          <ActionButtonRow
            onRecord={onStartRecording}
            onTypePrompt={() => setPromptDrawerOpen(true)}
          />
        )}
        {/* Inline processing/clarifier still owns the composer area when the
            agent is mid-thought — surfaces only during status !== 'idle'. */}
        {status !== 'idle' && (
          <InlineComposer
            textareaRef={textareaRef}
            prompt={prompt}
            setPrompt={setPrompt}
            activeChip={activeChip}
            clearChip={() => setActiveChip(null)}
            attachment={attachment}
            clearAttachment={() => setAttachment(null)}
            status={status}
            onSubmit={handleSubmitComposer}
            onStartRecording={onStartRecording}
          />
        )}
      </div>

      {/* Prompt drawer — hosts the composer + chips + Quick-prompts accordion
          behind the "Edit with prompt" button. Stays out of the way at rest so
          the section card is the visual focus; rises with auto-focused textarea
          when the user wants to type. */}
      {promptDrawerOpen && (
        <>
          <div
            onClick={() => setPromptDrawerOpen(false)}
            className="sheet-dim-in"
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(15, 23, 42, 0.22)',
              backdropFilter: 'blur(1px)',
              WebkitBackdropFilter: 'blur(1px)',
              zIndex: 15,
              cursor: 'pointer',
            }}
          />
          <PromptDrawer
            textareaRef={textareaRef}
            prompt={prompt}
            setPrompt={setPrompt}
            activeChip={activeChip}
            clearChip={() => setActiveChip(null)}
            attachment={attachment}
            clearAttachment={() => setAttachment(null)}
            status={status}
            onSubmit={handleSubmitComposer}
            onStartRecording={onStartRecording}
            chips={composerSuggestionChips}
            chipsOpen={chipsOpen}
            setChipsOpen={setChipsOpen}
            hasMadeFirstEdit={hasMadeFirstEdit}
            onShowMore={() => setScenariosOpen(true)}
            onClose={() => setPromptDrawerOpen(false)}
          />
        </>
      )}

      {/* Scenarios sheet — full library of prompt scenarios grouped by
          category. Picking one fills the composer and the sheet auto-closes,
          so the user is always returned to their flow. */}
      {scenariosOpen && (
        <>
          <div
            onClick={() => setScenariosOpen(false)}
            className="sheet-dim-in"
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(15, 23, 42, 0.22)',
              backdropFilter: 'blur(1px)',
              WebkitBackdropFilter: 'blur(1px)',
              zIndex: 19,
              cursor: 'pointer',
            }}
          />
          <ScenariosSheet
            onPick={(p) => {
              setPrompt(p)
              setScenariosOpen(false)
              setChipsOpen(false)
              setTimeout(() => textareaRef.current?.focus(), 50)
            }}
            onClose={() => setScenariosOpen(false)}
          />
        </>
      )}
    </div>
  )
}

// Section block — a single When/Where/Who row inside the toned-down card.
// Renders an inline segment list so values become clickable pills (the legacy
// surgical-edit behavior) while the connective text remains plain.
function SectionBlock({
  label, icon, segments, highlighted, onEdit, revealCount, sectionTotal, done,
  openPill, highlightedFields, onPillClick, pillRefs, setRules,
  emptyHelper, onAddBack,
}: {
  label: string
  icon: React.ReactNode
  segments: Segment[]
  highlighted: boolean
  onEdit: () => void
  revealCount: number
  sectionTotal: number
  done: boolean
  openPill: PillName | null
  highlightedFields: Set<string>
  onPillClick: (name: PillName, pillKey: string) => void
  pillRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>
  setRules: React.Dispatch<React.SetStateAction<VRRules>>
  emptyHelper?: { prompt: string; cta: string }
  onAddBack?: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const showCursor = !done && revealCount < sectionTotal

  // Slice the segment list according to revealCount so the typing animation
  // unfolds character-by-character, treating pill text like normal text.
  let remaining = done ? Number.MAX_SAFE_INTEGER : revealCount
  const els: React.ReactNode[] = []
  let key = 0
  for (const seg of segments) {
    const visible = Math.min(seg.value.length, remaining)
    if (visible <= 0 && !done) break
    if (visible <= 0) continue
    remaining -= visible
    const text = seg.value.slice(0, visible)
    if (seg.kind === 'text') {
      els.push(<span key={key++}>{text}</span>)
    } else {
      const isDismissible = !!seg.dismissible && done
      els.push(
        <SummaryPill
          key={key++}
          name={seg.name}
          pillKey={seg.pillKey}
          isActive={openPill === seg.name}
          isHighlighted={highlightedFields.has(seg.field)}
          refStore={pillRefs}
          onClick={() => onPillClick(seg.name, seg.pillKey)}
          dismissible={isDismissible}
          onDismiss={
            seg.field === 'dateRange'        ? () => setRules((prev) => ({ ...prev, showDateRange: false }))
            : seg.field === 'urls'           ? () => setRules((prev) => ({ ...prev, showUrls: false }))
            : seg.field === 'elementTrigger' ? () => setRules((prev) => ({ ...prev, elementTrigger: null }))
            : seg.field === 'occurrences'    ? () => setRules((prev) => ({ ...prev, showFrequency: false }))
            : seg.field === 'audience'       ? () => setRules((prev) => ({ ...prev, showAudience: false }))
            : seg.field === 'flowTrigger'    ? () => setRules((prev) => ({ ...prev, flowTrigger: null }))
            : seg.field === 'timeWindow'     ? () => setRules((prev) => ({ ...prev, timeWindow: null }))
            : seg.field === 'urlConditions'  ? () => setRules((prev) => ({ ...prev, urlConditions: null }))
            : seg.field === 'elementCondition' ? () => setRules((prev) => ({ ...prev, elementCondition: null }))
            : seg.field === 'weekDays'       ? () => setRules((prev) => ({ ...prev, weekDays: null }))
            : seg.field === 'cohort'         ? () => setRules((prev) => ({ ...prev, cohort: null }))
            : undefined
          }
        >
          {text}
        </SummaryPill>,
      )
    }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '14px 16px 14px',
        borderRadius: 9,
        background: highlighted ? '#F6F6F9' : 'transparent',
        transition: 'background 220ms',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 8,
        minHeight: 22,
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 10.5, fontWeight: 600,
          color: '#8C899F',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          <span style={{ display: 'inline-flex', color: '#8C899F' }}>{icon}</span>
          {label}
        </span>
        {done && (
          <button
            onClick={onEdit}
            title={`Refine ${label}`}
            style={{
              width: 24, height: 24, border: 'none', borderRadius: 6,
              background: hovered ? '#F6F6F9' : 'transparent',
              color: '#1F1F32',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 150ms, opacity 150ms',
              opacity: hovered ? 1 : 0,
              pointerEvents: hovered ? 'auto' : 'none',
            }}
          >
            <Pencil size={13} strokeWidth={2.2} />
          </button>
        )}
      </div>
      <div style={{
        fontSize: 13, lineHeight: 1.75,
        color: '#1F1F32', fontWeight: 400,
        letterSpacing: '-0.005em',
        minHeight: 20,
      }}>
        {segments.length === 0 && emptyHelper && onAddBack ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ color: '#8C899F', fontSize: 12.5 }}>
              {emptyHelper.prompt}
            </span>
            <button
              onClick={onAddBack}
              style={{
                background: '#F4F4F5',
                border: '1px solid #ECECF3',
                borderRadius: 999,
                padding: '3px 10px',
                fontSize: 11.5, fontWeight: 600,
                color: '#1F1F32',
                cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 4,
                letterSpacing: '-0.005em',
                transition: 'background 150ms, border-color 150ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#ECECF3'; e.currentTarget.style.borderColor = '#DFDDE7' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F4F4F5'; e.currentTarget.style.borderColor = '#ECECF3' }}
            >
              <Plus size={11} strokeWidth={2.4} />
              {emptyHelper.cta}
            </button>
          </div>
        ) : (
          <>
            {els}
            {showCursor && <span className="typing-cursor">|</span>}
          </>
        )}
      </div>
    </div>
  )
}

// Loading state for the section card. Stage-text on top (cycles through reading
// → identifying → drafting) and a skeleton mock of the When/Where/Who layout
// underneath, so the transition into the real summary feels like the same
// surface filling in rather than a screen swap.
function LoadingSectionCard({ messages }: { messages: string[] }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (idx >= messages.length - 1) return
    const t = setTimeout(() => setIdx((i) => i + 1), 1100)
    return () => clearTimeout(t)
  }, [idx, messages.length])

  return (
    <div style={{ padding: '14px 14px 16px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 14,
      }}>
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: '#8C899F',
          animation: 'composerLoaderPulse 1.8s ease-in-out infinite',
          flexShrink: 0,
        }} />
        {/* Fixed-height clipped container so each new message can rise from
            below while the prior one slides up and out — same ticker pattern
            as rotating taglines. Key on idx forces React to remount the span. */}
        <div style={{
          flex: 1, minWidth: 0,
          height: 16, overflow: 'hidden',
          display: 'flex', alignItems: 'center',
        }}>
          <span
            key={idx}
            className="composer-loader-text loader-msg-rotate"
            style={{
              fontSize: 11.5, fontWeight: 500, letterSpacing: '-0.005em',
              lineHeight: '16px',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}
          >
            {messages[idx]}
          </span>
        </div>
      </div>

      {(['Where', 'When', 'Who'] as const).map((label, sectionIdx) => (
        <div key={label}>
          <div style={{ padding: '4px 0 16px' }}>
            <div style={{
              fontSize: 12.5, fontWeight: 600,
              color: '#1F1F32',
              letterSpacing: '-0.005em',
              marginBottom: 10,
            }}>
              {label}
            </div>
            <SkeletonLine width="92%" height={11} radius={4} style={{ marginBottom: 6 }} />
            <SkeletonLine width="68%" height={11} radius={4} />
          </div>
          {sectionIdx < 2 && <div style={{ height: 1, background: '#F2F2F8', margin: '0 -14px 14px' }} />}
        </div>
      ))}
    </div>
  )
}

// Inline composer — mirrors the empty-state composer pattern from the
// process-discovery dashboard. Field-reference chip + video attachment chip
// float above the textarea; controls (mic, screen-share, send) sit in a row
// underneath like Google AI Studio's bottom toolbar. While processing, the
// textarea swaps for a compact inline loading state.
function InlineComposer({
  textareaRef, prompt, setPrompt, activeChip, clearChip,
  attachment, clearAttachment,
  status, onSubmit, onStartRecording,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  prompt: string
  setPrompt: (v: string) => void
  activeChip: SectionKey | null
  clearChip: () => void
  attachment: { name: string; duration: string } | null
  clearAttachment: () => void
  status: ComposerStatus
  onSubmit: () => void
  onStartRecording: () => void
}) {
  const [focused, setFocused] = useState(false)
  const isBusy = status !== 'idle'
  const canSubmit = !isBusy && (prompt.trim().length > 0 || attachment !== null || activeChip !== null)

  // Inline voice capture — separate from screen recording. The mic stays in the
  // composer's icon row and transforms in place rather than collapsing the whole
  // studio. Stop button reveals a mocked transcript appended to the textarea.
  const [isListening, setIsListening] = useState(false)
  const [micElapsed, setMicElapsed] = useState(0)
  useEffect(() => {
    if (!isListening) return
    setMicElapsed(0)
    const id = setInterval(() => setMicElapsed((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [isListening])

  const startListening = () => setIsListening(true)
  const stopListening = () => {
    if (!isListening) return
    const transcript = 'Show this only on the Reports page for users in the Sales cohort.'
    setPrompt(prompt ? `${prompt.trimEnd()} ${transcript}` : transcript)
    setIsListening(false)
  }

  // Auto-grow the textarea with content up to ~6 rows, then scroll internally.
  // Re-runs whenever the prompt changes (typed input, recording transcript
  // append, suggestion-chip prefill) so the surface always fits its content.
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    const maxHeight = 140
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`
    ta.style.overflowY = ta.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [prompt, textareaRef])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      if (canSubmit) onSubmit()
    }
    if (e.key === 'Backspace' && prompt.length === 0 && activeChip) {
      e.preventDefault()
      clearChip()
    }
  }

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: `1px solid ${focused ? '#525066' : '#ECECF3'}`,
        borderRadius: 14,
        padding: '12px 12px 10px',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
        transition: 'border-color 160ms',
      }}
    >
      {/* Chip row — field-reference chip + attached recording chip share the
          same horizontal strip above the textarea. */}
      {(activeChip || attachment) && (
        <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {activeChip && (
            <span
              className="composer-chip-in"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 6px 3px 8px',
                background: '#F4F4F5',
                border: '1px solid #ECECF3',
                borderRadius: 6,
                fontSize: 11.5, fontWeight: 600,
                color: '#1F1F32',
                letterSpacing: '-0.005em',
              }}
            >
              <Sparkles size={10} strokeWidth={2.2} color="#8C899F" />
              <span style={{ textTransform: 'capitalize' }}>{activeChip}</span>
              <button
                onClick={clearChip}
                title="Remove reference"
                style={{
                  width: 16, height: 16, border: 'none', borderRadius: 4,
                  background: 'transparent', color: '#525066', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 150ms, color 150ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#ECECF3'; e.currentTarget.style.color = '#1F1F32' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#525066' }}
              >
                <X size={10} strokeWidth={2.4} />
              </button>
            </span>
          )}
          {attachment && (
            <span
              className="composer-chip-in"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '3px 6px 3px 8px',
                background: '#F6F6F9',
                border: '1px solid #ECECF3',
                borderRadius: 6,
                fontSize: 11.5, fontWeight: 600,
                color: '#1F1F32',
                letterSpacing: '-0.005em',
                maxWidth: 240,
              }}
            >
              <FileVideo size={11} strokeWidth={2.2} color="#525066" />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {attachment.name}
              </span>
              <span style={{ color: '#8C899F', fontWeight: 500 }}>{attachment.duration}</span>
              <button
                onClick={clearAttachment}
                title="Remove recording"
                style={{
                  width: 16, height: 16, border: 'none', borderRadius: 4,
                  background: 'transparent', color: '#525066', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 150ms, color 150ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#ECECF3'; e.currentTarget.style.color = '#1F1F32' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#525066' }}
              >
                <X size={10} strokeWidth={2.4} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Textarea OR processing strip. While processing we replace the input
          surface with a compact shimmer + label so the composer feels like it
          owns the loading state — no drawer required. */}
      {status === 'processing' ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '8px 4px 6px',
          fontSize: 12.5, color: '#525066',
          letterSpacing: '-0.005em',
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#8C899F',
            animation: 'composerLoaderPulse 1.8s ease-in-out infinite',
          }} />
          <span className="composer-loader-text">Working on it…</span>
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={activeChip
            ? `Describe the change to ${activeChip}…`
            : 'Start typing a prompt'}
          rows={2}
          disabled={isBusy}
          style={{
            width: '100%', border: 'none', outline: 'none', resize: 'none',
            fontSize: 13, color: '#1F1F32',
            fontFamily: "'Inter', -apple-system, sans-serif",
            lineHeight: 1.5,
            background: 'transparent',
            padding: 0,
            letterSpacing: '-0.005em',
            opacity: isBusy ? 0.6 : 1,
          }}
        />
      )}

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 6,
      }}>
        <span style={{ fontSize: 11, color: '#9B98A8', letterSpacing: '-0.005em' }}>
          ⌘↵ to submit
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {isListening ? (
            <MicListeningPill elapsed={micElapsed} onStop={stopListening} />
          ) : (
            <ComposerIconButton
              title="Voice input — dictate your prompt"
              onClick={startListening}
              disabled={isBusy}
            >
              <Mic size={13} strokeWidth={2.2} />
            </ComposerIconButton>
          )}
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            title="Send"
            style={{
              width: 28, height: 28,
              background: canSubmit ? '#1F1F32' : '#ECECF3',
              color: canSubmit ? '#FFFFFF' : '#9B98A8',
              border: 'none', borderRadius: 7,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 150ms, color 150ms',
            }}
          >
            <ArrowUp size={13} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Full-width neutral pill. Orange-tinted icon is the only color accent —
// signals "this is a different input mode" without shouting. The structural
// border stays neutral so it doesn't read as an alert.
// Resting-state entry buttons. Two paths share one container so they read as
// a single input-mode picker (ElevenLabs / Substack pattern). Record is the
// recommended path so it gets primary emphasis; Edit-with-prompt sits below
// as the equally-reachable typed alternative.
function ActionButtonRow({ onRecord, onTypePrompt }: {
  onRecord: () => void
  onTypePrompt: () => void
}) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #ECECF3',
        borderRadius: 12,
        padding: 10,
        display: 'flex', flexDirection: 'column', gap: 6,
        boxShadow: '0 1px 0 rgba(255, 255, 255, 0.7) inset',
      }}
    >
      <RecordScreenButton onClick={onRecord} />
      <EditWithPromptButton onClick={onTypePrompt} />
    </div>
  )
}

function RecordScreenButton({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: hover ? '#0A0A0A' : '#1F1F32',
        border: '1px solid #1F1F32',
        borderRadius: 9,
        padding: '11px 14px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontSize: 13, fontWeight: 500,
        color: '#FFFFFF',
        letterSpacing: '-0.005em',
        transition: 'background 150ms',
        boxShadow: '0 1px 0 rgba(255, 255, 255, 0.10) inset, 0 1px 2px rgba(15, 23, 42, 0.10)',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <MonitorUp size={14} strokeWidth={2.2} color="#FFFFFF" />
      Show me: Narrate and Record
    </button>
  )
}

function EditWithPromptButton({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: hover ? '#F6F6F9' : '#FFFFFF',
        border: `1px solid ${hover ? '#DFDDE7' : '#ECECF3'}`,
        borderRadius: 9,
        padding: '9px 14px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontSize: 13, fontWeight: 500,
        color: '#1F1F32',
        letterSpacing: '-0.005em',
        transition: 'background 150ms, border-color 150ms',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Wand2 size={13} strokeWidth={2.2} color="#525066" />
      Edit with prompt
    </button>
  )
}

// Compact pill that replaces the mic icon while voice input is active.
// Three animated bars + elapsed timer + stop. Stays inline; never collapses
// the studio (that's the screen-recording flow).
function MicListeningPill({ elapsed, onStop }: { elapsed: number; onStop: () => void }) {
  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  const timer = `${minutes}:${seconds.toString().padStart(2, '0')}`
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        height: 28, padding: '0 4px 0 10px',
        background: C.accentSoft,
        border: `1px solid rgba(212, 87, 42, 0.32)`,
        borderRadius: 999,
        color: C.accentDark,
        fontSize: 11.5, fontWeight: 600,
        letterSpacing: '-0.005em',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {[0, 0.18, 0.36].map((delay, i) => (
          <span
            key={i}
            style={{
              width: 2, height: 10,
              background: C.accent,
              borderRadius: 1,
              transformOrigin: 'center',
              animation: `micWaveBar 0.9s ease-in-out ${delay}s infinite`,
            }}
          />
        ))}
      </div>
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: C.accentDark }}>{timer}</span>
      <button
        onClick={onStop}
        title="Stop recording"
        style={{
          width: 22, height: 22, border: 'none', borderRadius: '50%',
          background: C.accent,
          color: '#FFFFFF',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Square size={9} fill="#FFFFFF" strokeWidth={0} />
      </button>
    </div>
  )
}

// Horizontal row of suggestion chips. Used both as the always-visible
// training-wheel row before the first edit and inside the accordion
// after — same visual treatment, different parents.
function SuggestionChipsRow({ chips, onPick }: {
  chips: { label: string; prompt: string }[]
  onPick: (prompt: string) => void
}) {
  return (
    <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
      {chips.map((c) => (
        <button
          key={c.label}
          onClick={() => onPick(c.prompt)}
          style={{
            background: '#F4F4F5',
            border: 'none',
            borderRadius: 999,
            padding: '5px 11px',
            fontSize: 11.5, color: '#525066', cursor: 'pointer',
            fontWeight: 500, letterSpacing: '-0.005em',
            transition: 'background 150ms, color 150ms',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#ECECF3'; e.currentTarget.style.color = '#1F1F32' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#F4F4F5'; e.currentTarget.style.color = '#525066' }}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}

// Bottom sheet that lists every demo scenario grouped by category. Picking
// one fills the composer above and dismisses the sheet — the surface stays
// the same one the user is editing, no separate "composer" mode.
// Prompt drawer — the typed-input path. Composer + chips + accordion live
// inside; the resting panel keeps just the two action buttons. Auto-focuses
// the textarea on open. Closes on submit (handled by the parent).
function PromptDrawer({
  textareaRef, prompt, setPrompt, activeChip, clearChip,
  attachment, clearAttachment,
  status, onSubmit, onStartRecording,
  chips, chipsOpen, setChipsOpen, hasMadeFirstEdit, onShowMore, onClose,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  prompt: string
  setPrompt: (v: string) => void
  activeChip: SectionKey | null
  clearChip: () => void
  attachment: { name: string; duration: string } | null
  clearAttachment: () => void
  status: ComposerStatus
  onSubmit: () => void
  onStartRecording: () => void
  chips: { label: string; prompt: string }[]
  chipsOpen: boolean
  setChipsOpen: (v: boolean) => void
  hasMadeFirstEdit: boolean
  onShowMore: () => void
  onClose: () => void
}) {
  // Double-RAF the open transition so the browser paints the off-screen frame
  // before the slide starts — single RAF batches with the initial mount on
  // some browsers and the drawer pops in. Settled tracks the end of the
  // animation so the inner scroll container can hold its overflow during the
  // slide (otherwise scrollbars flicker mid-animation).
  const [animateIn, setAnimateIn] = useState(false)
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    let r2 = 0
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setAnimateIn(true))
    })
    const t = setTimeout(() => setSettled(true), 340)
    return () => {
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
      clearTimeout(t)
    }
  }, [])

  // Focus the textarea right after the slide-in settles. Caret should land
  // ready to type so the user doesn't need a follow-up click.
  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 200)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pre-first-edit shows chips inline; post-first-edit collapses them under
  // the same "Quick prompts" accordion the inline version used.
  const showChipsInline = !hasMadeFirstEdit
  const showAccordion   =  hasMadeFirstEdit

  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: '#FFFFFF',
        border: '1px solid #ECECF3',
        borderBottom: 'none',
        borderRadius: '18px 18px 0 0',
        boxShadow: '0 -1px 0 rgba(255, 255, 255, 0.6) inset, 0 -8px 24px rgba(15, 23, 42, 0.08), 0 -24px 64px rgba(15, 23, 42, 0.10)',
        display: 'flex', flexDirection: 'column',
        transform: animateIn ? 'translateY(0)' : 'translateY(101%)',
        opacity: animateIn ? 1 : 0,
        transition: 'transform 320ms cubic-bezier(0.32, 0, 0.15, 1), opacity 220ms ease-out',
        willChange: 'transform, opacity',
        zIndex: 16,
        maxHeight: 480,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
        <div style={{ width: 36, height: 4, background: '#E5E5E3', borderRadius: 999 }} />
      </div>

      <div style={{ padding: '10px 14px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1F1F32', letterSpacing: '-0.005em' }}>
          Edit with prompt
        </span>
        <HeaderBtn title="Close" onClick={onClose}><X size={14} strokeWidth={2} /></HeaderBtn>
      </div>

      <div style={{ flex: 1, overflowY: settled ? 'auto' : 'hidden', padding: '4px 14px 16px' }}>
        <InlineComposer
          textareaRef={textareaRef}
          prompt={prompt}
          setPrompt={setPrompt}
          activeChip={activeChip}
          clearChip={clearChip}
          attachment={attachment}
          clearAttachment={clearAttachment}
          status={status}
          onSubmit={onSubmit}
          onStartRecording={onStartRecording}
        />

        {status === 'idle' && showChipsInline && (
          <SuggestionChipsRow
            chips={chips}
            onPick={(p) => { setPrompt(p); textareaRef.current?.focus() }}
          />
        )}

        {status === 'idle' && showAccordion && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <button
                onClick={() => setChipsOpen(!chipsOpen)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#8C899F', fontSize: 11, fontWeight: 500,
                  padding: '2px 4px 2px 0', letterSpacing: '-0.005em',
                  transition: 'color 150ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#1F1F32')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#8C899F')}
              >
                <ChevronDown
                  size={11}
                  strokeWidth={2.2}
                  style={{
                    transform: chipsOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 200ms cubic-bezier(0.32, 0, 0.15, 1)',
                  }}
                />
                Quick prompts
              </button>
              {chipsOpen && (
                <button
                  onClick={onShowMore}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: '#8C899F', fontSize: 11, fontWeight: 500,
                    padding: '2px 4px', letterSpacing: '-0.005em',
                    whiteSpace: 'nowrap',
                    transition: 'color 150ms',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#1F1F32')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#8C899F')}
                >
                  Show more
                </button>
              )}
            </div>
            {chipsOpen && (
              <div className="vr-fade-in" style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {chips.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => {
                      setPrompt(c.prompt)
                      textareaRef.current?.focus()
                      setChipsOpen(false)
                    }}
                    style={{
                      background: '#F4F4F5',
                      border: 'none',
                      borderRadius: 999,
                      padding: '5px 11px',
                      fontSize: 11.5, color: '#525066', cursor: 'pointer',
                      fontWeight: 500, letterSpacing: '-0.005em',
                      transition: 'background 150ms, color 150ms',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#ECECF3'; e.currentTarget.style.color = '#1F1F32' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#F4F4F5'; e.currentTarget.style.color = '#525066' }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ScenariosSheet({ onPick, onClose }: {
  onPick: (prompt: string) => void
  onClose: () => void
}) {
  const [animateIn, setAnimateIn] = useState(false)
  useEffect(() => { requestAnimationFrame(() => setAnimateIn(true)) }, [])
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: '#FFFFFF',
        border: '1px solid #ECECF3',
        borderBottom: 'none',
        borderRadius: '18px 18px 0 0',
        boxShadow: '0 -1px 0 rgba(255, 255, 255, 0.6) inset, 0 -8px 24px rgba(15, 23, 42, 0.08), 0 -24px 64px rgba(15, 23, 42, 0.10)',
        maxHeight: 520,
        display: 'flex', flexDirection: 'column',
        transform: animateIn ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 280ms cubic-bezier(0.32, 0, 0.15, 1)',
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
        <div style={{ width: 36, height: 4, background: '#E5E5E3', borderRadius: 999 }} />
      </div>

      <div style={{ padding: '12px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1F1F32', letterSpacing: '-0.005em' }}>
          Try a scenario
        </span>
        <HeaderBtn title="Close" onClick={onClose}><X size={14} strokeWidth={2} /></HeaderBtn>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 14px' }}>
        {scenarioCategories.map((cat) => {
          const items = demoScenarios.filter((s) => s.category === cat)
          return (
            <div key={cat} style={{ marginBottom: 10 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: '#525066',
                background: '#F4F4F5',
                padding: '4px 10px', borderRadius: 5, margin: '4px 4px 6px',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                display: 'inline-block',
              }}>
                {cat}
              </div>
              {items.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onPick(s.prompt)}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '8px 10px', border: 'none', borderRadius: 7,
                    background: 'transparent', cursor: 'pointer',
                    fontSize: 12.5, color: '#1F1F32', fontWeight: 500,
                    letterSpacing: '-0.005em',
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F6F6F9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ComposerIconButton({
  children, title, onClick, disabled,
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
  disabled?: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 28, height: 28, border: '1px solid #ECECF3',
        borderRadius: 7,
        background: disabled ? '#FAFAFC' : hover ? '#F6F6F9' : '#FFFFFF',
        color: disabled ? '#B4B2A9' : hover ? '#1F1F32' : '#525066',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 150ms, color 150ms, border-color 150ms',
      }}
    >
      {children}
    </button>
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

// Skeleton placeholder for the visibility-rules tab. Mirrors the final 3-section
// card layout so the transition into the real content feels like the same
// surface unfolding, not a screen swap. Gemini / ChatGPT / Replit all favor
// inline placeholders over centered spinners for this kind of "page exists,
// content is loading" moment.
function VRSkeleton() {
  return (
    <div className="vr-fade-in" style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: '100%' }}>
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #ECECF3',
          borderRadius: 12,
          padding: 4,
          boxShadow: '0 1px 0 rgba(255, 255, 255, 0.7) inset',
        }}
      >
        {(['Where', 'When', 'Who'] as const).map((label, idx) => (
          <div key={label}>
            <div style={{ padding: '12px 14px 14px' }}>
              <SkeletonLine width={36} height={9} radius={3} style={{ marginBottom: 8 }} />
              <SkeletonLine width="92%" height={11} radius={4} style={{ marginBottom: 6 }} />
              <SkeletonLine width="68%" height={11} radius={4} />
            </div>
            {idx < 2 && <div style={{ height: 1, background: '#F2F2F8', margin: '0 14px' }} />}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto' }}>
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #ECECF3',
            borderRadius: 14,
            padding: '12px 12px 10px',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
          }}
        >
          <SkeletonLine width="60%" height={11} radius={4} style={{ marginBottom: 14 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SkeletonLine width={56} height={9} radius={3} />
            <div style={{ display: 'flex', gap: 5 }}>
              <SkeletonLine width={28} height={28} radius={7} />
              <SkeletonLine width={28} height={28} radius={7} />
              <SkeletonLine width={28} height={28} radius={7} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SkeletonLine({
  width, height, radius, style,
}: {
  width: number | string
  height: number
  radius: number
  style?: React.CSSProperties
}) {
  return (
    <div
      className="vr-skeleton-shimmer"
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, #F2F2F8 0%, #ECECF3 50%, #F2F2F8 100%)',
        backgroundSize: '200% 100%',
        ...(style || {}),
      }}
    />
  )
}

function VisibilityRulesTab({
  template, rules, setRules, highlightedFields,
  startPicker, stopPicker, selectedElement, setSelectedElement, setPreviewElement,
  pickerActive,
  onOpenReasoning,
  phase, setPhase,
  hasTypedSummary, setHasTypedSummary,
  onStartRecording, recordingPayload, consumeRecordingPayload,
  onApplyRules,
}: {
  template: PopupTemplate | null
  rules: VRRules
  setRules: React.Dispatch<React.SetStateAction<VRRules>>
  highlightedFields: Set<string>
  startPicker: () => void
  stopPicker: () => void
  selectedElement: ElementInfo | null
  setSelectedElement: (el: ElementInfo | null) => void
  setPreviewElement: (el: ElementInfo | null) => void
  pickerActive: boolean
  onOpenReasoning: () => void
  phase: 'loading' | 'summary' | 'manual'
  setPhase: React.Dispatch<React.SetStateAction<'loading' | 'summary' | 'manual'>>
  hasTypedSummary: boolean
  setHasTypedSummary: (v: boolean) => void
  onStartRecording: () => void
  recordingPayload: RecordingPayload | null
  consumeRecordingPayload: () => void
  onApplyRules: (next: Partial<VRRules>, fields: string[]) => void
}) {
  if (phase === 'manual') {
    return <ManualVR onBack={() => setPhase('summary')} />
  }

  return (
    <SummaryView
      isLoadingRules={phase === 'loading'}
      loaderMessages={buildLoaderMessages(template)}
      rules={rules}
      setRules={setRules}
      highlightedFields={highlightedFields}
      startPicker={startPicker}
      stopPicker={stopPicker}
      selectedElement={selectedElement}
      setSelectedElement={setSelectedElement}
      setPreviewElement={setPreviewElement}
      pickerActive={pickerActive}
      onOpenReasoning={onOpenReasoning}
      hasTypedSummary={hasTypedSummary}
      onTypingDone={() => setHasTypedSummary(true)}
      recordingPayload={recordingPayload}
      consumeRecordingPayload={consumeRecordingPayload}
      onApplyRules={onApplyRules}
      onStartRecording={onStartRecording}
    />
  )
}

// ─── Demo scenario data ───────────────────────────────────────────────────────

interface DemoScenario {
  id: string
  category: 'Where' | 'Trigger' | 'When' | 'Who'
  label: string
  prompt: string
}

const demoScenarios: DemoScenario[] = [
  // WHERE
  { id: 'multi-page',     category: 'Where',   label: 'Show on related pages',   prompt: 'Show this on all opportunities pages' },
  { id: 'bulk-url',       category: 'Where',   label: 'Bulk URL targeting',       prompt: 'Show this on multiple pages on my application' },
  { id: 'url-conditions', category: 'Where',   label: 'URL conditions (AND)',     prompt: 'Show this popup when domain contains opportunities and URL hash is admin' },
  { id: 'static-url',     category: 'Where',   label: 'Element-based page',       prompt: 'Show this on Leads page' },
  // TRIGGER
  { id: 'action-trigger',  category: 'Trigger', label: 'After user clicks',       prompt: 'Show this after user clicks submit' },
  { id: 'field-value',     category: 'Trigger', label: 'Field value condition',   prompt: 'Show when SLA category is P3' },
  { id: 'element-present', category: 'Trigger', label: 'Element on page',         prompt: 'Show when SLA Category is there on the page' },
  { id: 'after-flow',      category: 'Trigger', label: 'After flow completion',   prompt: 'Show this popup after user completes onboarding flow' },
  { id: 'mid-flow',        category: 'Trigger', label: 'Mid-flow step',           prompt: 'Show this popup after user completes 3rd step of the onboarding flow' },
  // WHEN
  { id: 'time-window',    category: 'When',    label: 'Time of day',             prompt: 'Show between 4 PM to 6 PM daily' },
  { id: 'date-range',     category: 'When',    label: 'Date range',              prompt: 'Show from today 12pm to 17th April 7pm' },
  { id: 'frequency-days', category: 'When',    label: 'Weekly + frequency',      prompt: 'Show weekly on thursday and friday and total of 5 times' },
  // WHO
  { id: 'cohort',         category: 'Who',     label: 'Existing cohort',         prompt: 'Show this only to cohort of salesforce admins' },
  { id: 'create-cohort',  category: 'Who',     label: 'Create new cohort',       prompt: 'Show this to users logging in for the first time' },
  { id: 'ambiguous',      category: 'Who',     label: 'Ambiguous input',         prompt: 'Show this for premium users' },
]

const scenarioCategories: DemoScenario['category'][] = ['Where', 'Trigger', 'When', 'Who']
const categoryColors: Record<string, string> = { Where: '#2563EB', Trigger: '#D4572A', When: '#059669', Who: '#7C3AED' }
const categoryBgs: Record<string, string> = { Where: '#EFF6FF', Trigger: '#FFF7F4', When: '#ECFDF5', Who: '#F5F3FF' }

// Dummy data for new scenario fluid forms
const dummyFlows = [
  { name: 'Onboarding flow', steps: ['Create account', 'Set preferences', 'Import data', 'Invite team', 'Complete'] },
  { name: 'Account setup', steps: ['Basic info', 'Billing details', 'Done'] },
  { name: 'Feature walkthrough', steps: ['Dashboard', 'Reports', 'Settings', 'Notifications', 'API keys', 'Finish'] },
  { name: 'Checkout process', steps: ['Cart review', 'Shipping address', 'Payment', 'Confirm order'] },
]

const dummyCohorts = ['Salesforce Admins', 'First-time users', 'Premium users', 'Trial users', 'Enterprise accounts', 'Power users']

const dummyPageGroups = [
  { name: 'Opportunities', pages: ['opportunities/list', 'opportunities/detail', 'opportunities/new'] },
  { name: 'Settings', pages: ['settings/general', 'settings/security', 'settings/notifications'] },
  { name: 'Reports', pages: ['reports/overview', 'reports/analytics', 'reports/export'] },
]

// ─── Bottom sheet — prompt + Fluid UI ─────────────────────────────────────────

type FluidKind =
  | 'date' | 'element' | 'audience' | 'compound' | 'frequency'
  | 'flow' | 'flowStep' | 'timeWindow' | 'urlCondition'
  | 'elementCondition' | 'elementPresence' | 'cohort'
  | 'multiPage' | 'enhancedFrequency' | 'ambiguous'
  | 'none'

const suggestionChips: { label: string; prompt: string }[] = [
  { label: 'Change date range',          prompt: 'Change the date range to June 1 through June 15' },
  { label: 'Add audience',               prompt: 'Show this only to Sales team users' },
  { label: 'Show on a specific element', prompt: 'Show this only when the user clicks the Login button' },
  { label: 'Limit occurrences',          prompt: 'Stop showing after 2 occurrences' },
]

function classifyPrompt(text: string): FluidKind {
  const t = text.toLowerCase()

  // New scenario patterns (most specific first)
  if (/(after.*complet.*flow|after.*flow|after.*onboarding)/.test(t) && /(step|\d+(st|nd|rd|th))/.test(t)) return 'flowStep'
  if (/(after.*complet.*flow|after.*flow|after.*onboarding)/.test(t)) return 'flow'
  if (/(between.*\d+\s*(am|pm)\b.*\d+\s*(am|pm)\b|\d+\s*(am|pm)\b.*to.*\d+\s*(am|pm)\b)/.test(t)) return 'timeWindow'
  // Time-only language ("change the time", "time window", "every day at 5pm")
  // resolves to a time clarifier rather than a date one. \bam\b / \bpm\b
  // require word boundaries on both sides — otherwise "team" matches "am".
  if (/(\btime\b|time window|\bhours\b|\bam\b|\bpm\b|midnight|noon|morning|evening)/.test(t) && !/(date|range|month|week)/.test(t)) return 'timeWindow'
  if (/(domain.*contains|url.*hash|url.*contains.*and)/.test(t)) return 'urlCondition'
  if (/(when.*is\s+(there|present|on the page)|there on the page)/.test(t)) return 'elementPresence'
  if (/(when.*category.*is|field.*value|sla.*is\s+\w)/.test(t)) return 'elementCondition'
  if (/(weekly|daily).*(thursday|friday|monday|tuesday|wednesday|saturday|sunday)/.test(t)) return 'enhancedFrequency'
  if (/(cohort|salesforce admin)/.test(t)) return 'cohort'
  if (/(first.time|logging in.*first|new user)/.test(t)) return 'cohort'
  if (/(all.*pages|multiple pages|opportunities pages)/.test(t)) return 'multiPage'
  if (/(on\s+\w+\s+page$|on leads page)/.test(t) && !/(click|button)/.test(t)) return 'elementPresence'
  if (/(premium user)/.test(t)) return 'ambiguous'

  // Existing patterns (unchanged)
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

function extractTimeWindow(text: string): { start: string; end: string } {
  const m = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:to|-|–|until)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (m) {
    const fmt = (h: string, min: string | undefined, mer: string | undefined) =>
      `${h}:${min ?? '00'} ${(mer ?? 'PM').toUpperCase()}`
    return { start: fmt(m[1], m[2], m[3]), end: fmt(m[4], m[5], m[6]) }
  }
  return { start: '9:00 AM', end: '5:00 PM' }
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

export interface RecordingPayload {
  prompt: string
  attachment: { name: string; duration: string }
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
  onStartRecording: () => void
  recordingPayload: RecordingPayload | null
  consumeRecordingPayload: () => void
  initialPrompt: string | null
  consumeInitialPrompt: () => void
  autoSubmit: boolean
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

// Inline clarifier for the time-window step. The caption is contextual — the
// Settings demo passes its own copy, the standalone time clarifier uses a
// neutral default so it doesn't leak Settings-specific language elsewhere.
function ClarifierTimeWindow({ initial, onCancel, onAccept, caption, applyLabel }: {
  initial: { start: string; end: string }
  onCancel: () => void
  onAccept: (window: { start: string; end: string }) => void
  caption?: React.ReactNode
  applyLabel?: string
}) {
  const [start, setStart] = useState(initial.start)
  const [end, setEnd] = useState(initial.end)
  return (
    <FluidWrapper icon={<Clock size={14} color={C.ai} strokeWidth={2.2} />} title="Daily time window">
      <div className="fluid-stagger-item" style={{ fontSize: 12.5, color: C.textSecondary, marginBottom: 12, lineHeight: 1.5 }}>
        {caption ?? 'Pick the daily window when this should appear.'}
      </div>
      <div className="fluid-stagger-item" style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, color: C.textTertiary, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>From</div>
          <input
            value={start}
            onChange={(e) => setStart(e.target.value)}
            style={{
              width: '100%', border: `1px solid ${C.border}`, borderRadius: 9,
              padding: '9px 12px', fontSize: 13, color: C.textPrimary, background: '#FFFFFF',
              outline: 'none', fontFamily: "'Inter', -apple-system, sans-serif", boxSizing: 'border-box',
              fontWeight: 500,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = C.ai)}
            onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, color: C.textTertiary, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>To</div>
          <input
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            style={{
              width: '100%', border: `1px solid ${C.border}`, borderRadius: 9,
              padding: '9px 12px', fontSize: 13, color: C.textPrimary, background: '#FFFFFF',
              outline: 'none', fontFamily: "'Inter', -apple-system, sans-serif", boxSizing: 'border-box',
              fontWeight: 500,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = C.ai)}
            onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
          />
        </div>
      </div>
      <div className="fluid-stagger-item">
        <ApplyButtons onCancel={onCancel} onApply={() => onAccept({ start, end })} applyLabel={applyLabel ?? 'Apply'} />
      </div>
    </FluidWrapper>
  )
}

// Detects the "Settings popup on May 5th 4–8pm" demo scenario which mixes
// concrete values (dates, time, frequency) with ambiguity (which element, which
// pages). When matched, the agent runs a chained clarifier rather than
// dispatching to a single fluid form.
function isSettingsScenario(text: string): boolean {
  const t = text.toLowerCase()
  return /settings/.test(t) && /\b(may|5th)\b/.test(t) && /\d/.test(t)
}

function BottomSheet({
  open, onClose, onApplyRules,
  pickerActive, startPicker, stopPicker,
  selectedElement, setSelectedElement, setPreviewElement,
  onStartRecording, recordingPayload, consumeRecordingPayload,
  initialPrompt, consumeInitialPrompt, autoSubmit,
}: BottomSheetProps) {
  const [prompt, setPrompt] = useState('')
  const [stage, setStage] = useState<'input' | 'processing' | 'fluid' | 'clarifier-time' | 'clarifier-element' | 'clarifier-applying'>('input')
  const [fluidKind, setFluidKind] = useState<FluidKind>('none')
  const [extracted, setExtracted] = useState<{ dates?: { start: string; end: string }; audience?: string; frequency?: number; elementMatches?: ElementInfo[] }>({})
  const [compoundStep, setCompoundStep] = useState<1 | 2>(1)
  const [compoundDates, setCompoundDates] = useState<{ start: string; end: string } | null>(null)
  const [animateIn, setAnimateIn] = useState(false)
  const [showScenarios, setShowScenarios] = useState(false)
  const [attachment, setAttachment] = useState<{ name: string; duration: string } | null>(null)
  // Holds the values we resolved across the chained clarifier so the final
  // apply step has everything in one batch.
  const [pendingRules, setPendingRules] = useState<Partial<VRRules> | null>(null)
  const [pendingFields, setPendingFields] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      // If the drawer was reopened after a recording, the parent has stashed a
      // payload — prefill prompt + attachment instead of clearing. Otherwise
      // honor a passed-in initial prompt from the inline composer.
      if (recordingPayload) {
        setPrompt(recordingPayload.prompt)
        setAttachment(recordingPayload.attachment)
        consumeRecordingPayload()
      } else if (initialPrompt) {
        setPrompt(initialPrompt)
        setAttachment(null)
        consumeInitialPrompt()
      } else {
        setPrompt('')
        setAttachment(null)
      }
      setStage('input')
      setFluidKind('none')
      setExtracted({})
      setCompoundStep(1)
      setCompoundDates(null)
      setShowScenarios(false)
      setPendingRules(null)
      setPendingFields([])
      requestAnimationFrame(() => setAnimateIn(true))
    } else {
      setAnimateIn(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // If the parent asked us to auto-submit (e.g. the inline composer pre-filled
  // the prompt and wants the agent to process immediately), kick off submit
  // after the prefill has settled. Only runs once per open.
  const autoSubmitFired = useRef(false)
  useEffect(() => {
    if (!open) { autoSubmitFired.current = false; return }
    if (autoSubmit && !autoSubmitFired.current && prompt && stage === 'input') {
      autoSubmitFired.current = true
      const t = setTimeout(() => handleSubmit(), 250)
      return () => clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoSubmit, prompt, stage])

  const handleSubmit = () => {
    const text = prompt.trim()
    if (!text && !attachment) return

    // Settings demo scenario — branches based on whether we have a recording.
    // With a video the agent claims it has full context and applies directly.
    // Without one it asks for clarification through chained fluid forms.
    if (isSettingsScenario(text)) {
      setStage('processing')
      if (attachment) {
        // Recorded path: full context, apply everything at once.
        setTimeout(() => {
          const settingsEl = elementCandidates.find(e => e.name === 'Settings')!
          onApplyRules(
            {
              dateRange: { start: 'May 5, 2026', end: 'May 5, 2026' },
              timeWindow: { start: '4:00 PM', end: '8:00 PM' },
              elementTrigger: settingsEl,
              occurrences: 999,
              showFrequency: true,
              urls: [
                { display: 'app.acme.com/settings', full: 'https://app.acme.com/settings' },
                { display: 'app.acme.com/account/settings', full: 'https://app.acme.com/account/settings' },
              ],
            },
            ['dateRange', 'timeWindow', 'elementTrigger', 'occurrences', 'urls'],
          )
          handleClose()
        }, 2600)
        return
      }
      // Typed path: resolve dates + time first, then which Settings element.
      setPendingRules({
        dateRange: { start: 'May 5, 2026', end: 'May 5, 2026' },
        occurrences: 999,
        showFrequency: true,
      })
      setPendingFields(['dateRange', 'occurrences'])
      setTimeout(() => setStage('clarifier-time'), 2200)
      return
    }

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

  // Chained clarifier — step 1 (time window) accepted.
  const handleClarifierTime = (window: { start: string; end: string }) => {
    setPendingRules(prev => ({ ...(prev ?? {}), timeWindow: window }))
    setPendingFields(prev => [...prev, 'timeWindow'])
    setStage('clarifier-element')
  }

  // Chained clarifier — step 2 (Settings element) accepted. Apply everything.
  const handleClarifierElement = () => {
    if (!selectedElement) return
    const settingsPages = dummyPageGroups.find(p => p.name === 'Settings')?.pages ?? []
    const urls = settingsPages.map(p => ({ display: `app.acme.com/${p}`, full: `https://app.acme.com/${p}` }))
    const merged: Partial<VRRules> = {
      ...(pendingRules ?? {}),
      elementTrigger: selectedElement,
      urls: urls.length ? urls : [{ display: 'app.acme.com/settings', full: 'https://app.acme.com/settings' }],
    }
    const fields = [...pendingFields, 'elementTrigger', 'urls']
    setStage('clarifier-applying')
    setTimeout(() => {
      onApplyRules(merged, fields)
      setSelectedElement(null)
      handleClose()
    }, 1100)
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

  const handleApplyGeneric = (updates: Partial<VRRules>, fields: string[]) => {
    onApplyRules(updates, fields)
    handleClose()
  }

  // Adaptive max-height per stage so the drawer feels right-sized for its content
  const stageMaxHeight =
    stage === 'input'              ? (showScenarios ? 580 : (attachment ? 380 : 340))
    : stage === 'processing'       ? 320
    : stage === 'clarifier-time'   ? 440
    : stage === 'clarifier-element' ? 480
    : stage === 'clarifier-applying' ? 320
    : fluidKind === 'audience' ? 480
    : fluidKind === 'compound' ? 460
    : fluidKind === 'flowStep' ? 520
    : fluidKind === 'cohort' || fluidKind === 'flow' || fluidKind === 'multiPage' || fluidKind === 'ambiguous' ? 480
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
              : stage === 'clarifier-time' ? 'Confirm the time window'
              : stage === 'clarifier-element' ? 'Which Settings element?'
              : stage === 'clarifier-applying' ? 'Applying everything…'
              : 'Make the change'}
          </span>
        </div>
        <HeaderBtn title="Close" onClick={handleClose}><X size={14} strokeWidth={2} /></HeaderBtn>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 14px' }}>
        {stage === 'input' && (
          <>
            {attachment && (
              <div className="vr-fade-in" style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', marginBottom: 8,
                background: 'linear-gradient(135deg, #FEF3F2 0%, #FFFFFF 100%)',
                border: '1px solid rgba(220, 38, 38, 0.18)',
                borderRadius: 10,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: '#FEE2E2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <FileVideo size={14} color="#B91C1C" strokeWidth={2.2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary, letterSpacing: '-0.005em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {attachment.name}
                  </div>
                  <div style={{ fontSize: 10.5, color: C.textTertiary, marginTop: 1 }}>
                    Recording · {attachment.duration}
                  </div>
                </div>
                <button
                  onClick={() => setAttachment(null)}
                  title="Remove recording"
                  style={{
                    width: 22, height: 22, border: 'none', borderRadius: 5,
                    background: 'transparent', color: C.textTertiary, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 150ms, color 150ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#B91C1C' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.textTertiary }}
                >
                  <X size={12} strokeWidth={2.4} />
                </button>
              </div>
            )}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2, gap: 8 }}>
                <span style={{ fontSize: 11, color: C.textTertiary }}>⌘↵ to submit</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={onStartRecording}
                    title="Record your scenario instead of typing"
                    style={{
                      background: '#FFFFFF',
                      color: '#B91C1C',
                      border: '1px solid rgba(220, 38, 38, 0.22)',
                      borderRadius: 7,
                      padding: '4px 10px', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5,
                      transition: 'background 150ms, border-color 150ms',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.40)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.22)' }}
                  >
                    <Mic size={11} strokeWidth={2.4} />
                    Record with AI
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!prompt.trim() && !attachment}
                    style={{
                      background: (prompt.trim() || attachment) ? C.textPrimary : '#E5E5E3',
                      color: '#ffffff', border: 'none', borderRadius: 7,
                      padding: '5px 12px', fontSize: 12, fontWeight: 600,
                      cursor: (prompt.trim() || attachment) ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', gap: 5,
                      transition: 'background 150ms',
                    }}
                  >
                    Submit
                    <ArrowUp size={12} strokeWidth={2.5} />
                  </button>
                </div>
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

            {/* Demo scenario selector */}
            <div style={{ marginTop: 14 }}>
              <button
                onClick={() => setShowScenarios(s => !s)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '0 0 6px',
                }}
              >
                <span style={{ fontSize: 10.5, color: C.textTertiary, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Demo scenarios
                </span>
                <ChevronDown
                  size={12} color={C.textTertiary} strokeWidth={2.4}
                  style={{ transform: showScenarios ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
                />
              </button>
              {showScenarios && (
                <div className="vr-fade-in" style={{
                  maxHeight: 240, overflowY: 'auto',
                  background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 10,
                  padding: 4,
                }}>
                  {scenarioCategories.map(cat => {
                    const items = demoScenarios.filter(s => s.category === cat)
                    return (
                      <div key={cat}>
                        <div style={{
                          fontSize: 9.5, fontWeight: 700, color: categoryColors[cat],
                          background: categoryBgs[cat],
                          padding: '4px 10px', borderRadius: 5, margin: '4px 4px 2px',
                          letterSpacing: '0.06em', textTransform: 'uppercase',
                        }}>
                          {cat}
                        </div>
                        {items.map(s => (
                          <button
                            key={s.id}
                            onClick={() => { handleChipClick(s.prompt); setShowScenarios(false) }}
                            style={{
                              display: 'block', width: '100%', textAlign: 'left',
                              padding: '7px 10px', border: 'none', borderRadius: 6,
                              background: 'transparent', cursor: 'pointer',
                              fontSize: 12, color: C.textPrimary, fontWeight: 500,
                              letterSpacing: '-0.005em',
                              transition: 'background 150ms',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#F4F4F2')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {stage === 'processing' && (
          <AILoader messages={
            attachment ? [
              'Reviewing your recording…',
              'Extracting timing, element, and pages…',
              'Applying everything at once…',
            ] : [
              'Understanding your request…',
              'Most things look clear…',
              'I have a couple of questions…',
            ]
          } />
        )}

        {stage === 'clarifier-time' && (
          <ClarifierTimeWindow
            initial={{ start: '4:00 PM', end: '8:00 PM' }}
            onCancel={handleClose}
            onAccept={handleClarifierTime}
          />
        )}

        {stage === 'clarifier-element' && (
          <ElementPickerFluid
            matches={findElementMatches('settings')}
            pickerActive={pickerActive}
            selectedElement={selectedElement}
            onCancel={handleClose}
            onApply={handleClarifierElement}
            onPick={startPicker}
            onSelectMatch={(m) => setSelectedElement(m)}
            onPreviewMatch={setPreviewElement}
          />
        )}

        {stage === 'clarifier-applying' && (
          <AILoader messages={['Applying everything…']} />
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
            {/* Generic handler for all new scenario types */}
            {!['date', 'element', 'audience', 'compound', 'frequency', 'none'].includes(fluidKind) && (
              <GenericScenarioFluid kind={fluidKind} prompt={prompt} onCancel={handleClose} onApply={handleApplyGeneric} />
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
      background: 'transparent', borderRadius: 12,
      padding: 0,
    }}>
      <div className="fluid-stagger-item" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7, background: '#F4F4F5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1F1F32', letterSpacing: '-0.005em' }}>{title}</span>
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
        background: 'rgba(15, 23, 42, 0.05)',
        border: '1px solid rgba(15, 23, 42, 0.10)',
        borderRadius: 9,
        display: 'flex', alignItems: 'flex-start', gap: 8,
      }}>
        <Sparkles size={11} color="#1F1F32" strokeWidth={2.4} style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 11.5, color: '#1F1F32', lineHeight: 1.5, letterSpacing: '-0.005em' }}>
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
        border: `1px solid ${hover ? 'rgba(15, 23, 42, 0.30)' : 'rgba(15, 23, 42, 0.14)'}`,
        borderRadius: 10, cursor: 'pointer',
        textAlign: 'left', width: '100%',
        boxShadow: hover ? '0 2px 8px rgba(15, 23, 42, 0.10)' : 'none',
        transition: 'background 150ms, border-color 150ms, box-shadow 150ms, transform 150ms',
        transform: hover ? 'translateY(-1px)' : 'none',
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: '#F4F4F5',
        border: '1px solid #ECECF3',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Crosshair size={13} color="#1F1F32" strokeWidth={2.4} />
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
      <ChevronRight size={13} color={hover ? '#1F1F32' : C.textTertiary} strokeWidth={2.4} style={{ transition: 'color 150ms' }} />
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
                <Sparkles size={11} color="#1F1F32" strokeWidth={2.4} className="ai-sparkle-twinkle" />
                <span style={{
                  fontSize: 10, color: '#1F1F32', fontWeight: 600,
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
                    <Sparkles size={11} color="#1F1F32" strokeWidth={2.4} className="ai-sparkle-twinkle" />
                    <span style={{
                      fontSize: 10, color: '#1F1F32', fontWeight: 600,
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

// ─── Generic Scenario Fluid (handles all new scenario types) ─────────────────

function ScenarioListSelect({ icon, title, description, options, onCancel, onAccept }: {
  icon: React.ReactNode; title: string; description: string
  options: { label: string; sub?: string }[]
  onCancel: () => void
  onAccept: (selected: string) => void
}) {
  const [selected, setSelected] = useState(options[0]?.label ?? '')
  return (
    <FluidWrapper icon={icon} title={title}>
      <div className="fluid-stagger-item" style={{ fontSize: 12.5, color: C.textSecondary, marginBottom: 12, lineHeight: 1.5 }}>
        {description}
      </div>
      <div className="fluid-stagger-item" style={{
        display: 'flex', flexDirection: 'column', gap: 5,
        maxHeight: 180, overflowY: 'auto',
        background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 10, padding: 4,
      }}>
        {options.map((opt) => {
          const active = selected === opt.label
          return (
            <button
              key={opt.label}
              onClick={() => setSelected(opt.label)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', background: active ? C.aiSoft : 'transparent',
                border: 'none', borderRadius: 7, cursor: 'pointer',
                textAlign: 'left', width: '100%', transition: 'background 150ms',
              }}
            >
              <span style={{
                width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${active ? C.ai : '#D4D4D1'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.ai }} />}
              </span>
              <div>
                <div style={{ fontSize: 12.5, color: C.textPrimary, fontWeight: active ? 600 : 500 }}>{opt.label}</div>
                {opt.sub && <div style={{ fontSize: 10.5, color: C.textTertiary, marginTop: 1 }}>{opt.sub}</div>}
              </div>
            </button>
          )
        })}
      </div>
      <div className="fluid-stagger-item">
        <ApplyButtons onCancel={onCancel} onApply={() => onAccept(selected)} applyLabel="Accept" />
      </div>
    </FluidWrapper>
  )
}

function GenericScenarioFluid({ kind, prompt, onCancel, onApply }: {
  kind: FluidKind
  prompt: string
  onCancel: () => void
  onApply: (updates: Partial<VRRules>, fields: string[]) => void
}) {
  if (kind === 'flow') {
    return (
      <ScenarioListSelect
        icon={<Zap size={14} color={C.ai} strokeWidth={2.2} />}
        title="Select a flow"
        description="AI detected a flow-based trigger. Pick the flow to bind this popup to."
        options={dummyFlows.map(f => ({ label: f.name, sub: `${f.steps.length} steps` }))}
        onCancel={onCancel}
        onAccept={(name) => onApply({ flowTrigger: { name } }, ['flowTrigger'])}
      />
    )
  }

  if (kind === 'flowStep') {
    const flow = dummyFlows[0] // default to onboarding
    const [selectedFlow, setSelectedFlow] = useState(flow.name)
    const [selectedStep, setSelectedStep] = useState('')
    const activeFlow = dummyFlows.find(f => f.name === selectedFlow) ?? flow
    return (
      <FluidWrapper icon={<Zap size={14} color={C.ai} strokeWidth={2.2} />} title="Select flow + step">
        <div className="fluid-stagger-item" style={{ fontSize: 12.5, color: C.textSecondary, marginBottom: 10, lineHeight: 1.5 }}>
          Pick the flow and the specific step to trigger after.
        </div>
        <div className="fluid-stagger-item" style={{ fontSize: 10.5, color: C.textTertiary, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>Flow</div>
        <div className="fluid-stagger-item" style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
          {dummyFlows.map(f => (
            <button key={f.name} onClick={() => { setSelectedFlow(f.name); setSelectedStep('') }} style={{
              padding: '5px 10px', borderRadius: 7, fontSize: 11.5, fontWeight: 500, cursor: 'pointer', border: 'none',
              background: selectedFlow === f.name ? C.aiSoft : '#F4F4F2',
              color: selectedFlow === f.name ? C.ai : C.textSecondary,
              transition: 'all 150ms',
            }}>{f.name}</button>
          ))}
        </div>
        <div className="fluid-stagger-item" style={{ fontSize: 10.5, color: C.textTertiary, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>Step</div>
        <div className="fluid-stagger-item" style={{
          display: 'flex', flexDirection: 'column', gap: 4,
          background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: 10, padding: 4, maxHeight: 130, overflowY: 'auto',
        }}>
          {activeFlow.steps.map((s, i) => {
            const active = selectedStep === s
            return (
              <button key={s} onClick={() => setSelectedStep(s)} style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '7px 9px', border: 'none',
                borderRadius: 6, cursor: 'pointer', background: active ? C.aiSoft : 'transparent', textAlign: 'left', width: '100%',
              }}>
                <span style={{ width: 18, height: 18, borderRadius: 5, background: active ? C.ai : '#E5E5E3', color: active ? '#fff' : C.textTertiary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 12, color: C.textPrimary, fontWeight: active ? 600 : 500 }}>{s}</span>
              </button>
            )
          })}
        </div>
        <div className="fluid-stagger-item">
          <ApplyButtons onCancel={onCancel} onApply={() => onApply({ flowTrigger: { name: selectedFlow, step: selectedStep || undefined } }, ['flowTrigger'])} applyDisabled={!selectedStep} applyLabel="Accept" />
        </div>
      </FluidWrapper>
    )
  }

  if (kind === 'timeWindow') {
    const [start, setStart] = useState('4:00 PM')
    const [end, setEnd] = useState('6:00 PM')
    return (
      <FluidWrapper icon={<Clock size={14} color={C.ai} strokeWidth={2.2} />} title="Time window">
        <div className="fluid-stagger-item" style={{ fontSize: 12.5, color: C.textSecondary, marginBottom: 12, lineHeight: 1.5 }}>
          Show this popup only during specific hours each day.
        </div>
        <div className="fluid-stagger-item" style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, color: C.textTertiary, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>From</div>
            <StyledInput value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, color: C.textTertiary, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>To</div>
            <StyledInput value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        <div className="fluid-stagger-item">
          <ApplyButtons onCancel={onCancel} onApply={() => onApply({ timeWindow: { start, end } }, ['timeWindow'])} applyLabel="Accept" />
        </div>
      </FluidWrapper>
    )
  }

  if (kind === 'cohort') {
    return (
      <ScenarioListSelect
        icon={<Users size={14} color={C.ai} strokeWidth={2.2} />}
        title="Select a cohort"
        description={/first.time|logging|new user/i.test(prompt)
          ? 'This cohort doesn\'t exist yet. Select one to create and apply, or pick an existing one.'
          : 'AI found matching cohorts in your workspace. Select one to apply.'}
        options={dummyCohorts.map(c => ({ label: c }))}
        onCancel={onCancel}
        onAccept={(name) => onApply({ cohort: name, audience: name, showAudience: true }, ['audience'])}
      />
    )
  }

  if (kind === 'urlCondition') {
    const [conditions, setConditions] = useState([
      { field: 'Domain', operator: 'contains', value: 'opportunities' },
      { field: 'URL hash', operator: 'equals', value: 'admin' },
    ])
    return (
      <FluidWrapper icon={<Hash size={14} color={C.ai} strokeWidth={2.2} />} title="URL conditions">
        <div className="fluid-stagger-item" style={{ fontSize: 12.5, color: C.textSecondary, marginBottom: 12, lineHeight: 1.5 }}>
          AI parsed your URL targeting conditions. Adjust if needed.
        </div>
        <div className="fluid-stagger-item" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {conditions.map((c, i) => (
            <div key={i} style={{
              display: 'flex', gap: 6, alignItems: 'center',
              padding: '8px 10px', background: '#F8FAFC', border: `1px solid ${C.border}`, borderRadius: 9,
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.ai, whiteSpace: 'nowrap' }}>{c.field}</span>
              <span style={{ fontSize: 10, color: C.textTertiary }}>{c.operator}</span>
              <input
                value={c.value}
                onChange={(e) => {
                  const next = [...conditions]
                  next[i] = { ...next[i], value: e.target.value }
                  setConditions(next)
                }}
                style={{
                  flex: 1, border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 8px',
                  fontSize: 12, color: C.textPrimary, outline: 'none', background: '#FFFFFF',
                  fontFamily: "'Inter', -apple-system, sans-serif", fontWeight: 500,
                }}
              />
            </div>
          ))}
        </div>
        <div className="fluid-stagger-item">
          <ApplyButtons onCancel={onCancel} onApply={() => onApply({ urlConditions: conditions }, ['urlConditions'])} applyLabel="Accept" />
        </div>
      </FluidWrapper>
    )
  }

  if (kind === 'multiPage') {
    return (
      <ScenarioListSelect
        icon={<Globe2 size={14} color={C.ai} strokeWidth={2.2} />}
        title="Page group detected"
        description="AI found related page groups. Select the group to target."
        options={dummyPageGroups.map(g => ({ label: g.name, sub: `${g.pages.length} pages` }))}
        onCancel={onCancel}
        onAccept={(name) => {
          const group = dummyPageGroups.find(g => g.name === name)
          if (group) {
            onApply({
              urls: group.pages.map(p => ({ full: `https://app.acme.com/${p}`, display: urlToDisplay(`https://app.acme.com/${p}`) })),
            }, ['urls'])
          }
        }}
      />
    )
  }

  if (kind === 'elementPresence' || kind === 'elementCondition') {
    const isCondition = kind === 'elementCondition'
    const element = 'SLA Category'
    const value = isCondition ? 'P3' : undefined
    return (
      <FluidWrapper icon={<Crosshair size={14} color={C.ai} strokeWidth={2.2} />} title={isCondition ? 'Element condition' : 'Element on page'}>
        <div className="fluid-stagger-item" style={{ fontSize: 12.5, color: C.textSecondary, marginBottom: 12, lineHeight: 1.5 }}>
          {isCondition
            ? 'AI detected a field-value condition. The popup will show when this element has the specified value.'
            : 'AI detected an element-based trigger. The popup will show when this element is present on the page.'}
        </div>
        <div className="fluid-stagger-item" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', background: C.aiSoft, border: `1px solid rgba(15, 23, 42, 0.18)`, borderRadius: 9,
        }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FFFFFF', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Crosshair size={13} color={C.ai} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: 12.5, color: C.textPrimary, fontWeight: 600 }}>{element}</div>
            {isCondition && <div style={{ fontSize: 11, color: C.ai, fontWeight: 500, marginTop: 1 }}>value = {value}</div>}
            {!isCondition && <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 1 }}>is present on the page</div>}
          </div>
        </div>
        <div className="fluid-stagger-item">
          <ApplyButtons onCancel={onCancel} onApply={() => onApply({
            elementCondition: { element, condition: isCondition ? 'equals' : 'exists', value },
          }, ['elementCondition'])} applyLabel="Accept" />
        </div>
      </FluidWrapper>
    )
  }

  if (kind === 'enhancedFrequency') {
    const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const [days, setDays] = useState<string[]>(['Thu', 'Fri'])
    const [count, setCount] = useState(5)
    const toggleDay = (d: string) => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
    return (
      <FluidWrapper icon={<Repeat size={14} color={C.ai} strokeWidth={2.2} />} title="Weekly schedule">
        <div className="fluid-stagger-item" style={{ fontSize: 12.5, color: C.textSecondary, marginBottom: 12, lineHeight: 1.5 }}>
          Show on specific days of the week, with a total occurrence cap.
        </div>
        <div className="fluid-stagger-item" style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
          {allDays.map(d => {
            const active = days.includes(d)
            return (
              <button key={d} onClick={() => toggleDay(d)} style={{
                flex: 1, padding: '7px 0', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none',
                background: active ? C.ai : '#F4F4F2', color: active ? '#FFFFFF' : C.textTertiary,
                transition: 'all 150ms',
              }}>{d}</button>
            )
          })}
        </div>
        <div className="fluid-stagger-item" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: C.textSecondary }}>Total occurrences:</span>
          <input type="number" value={count} onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))} style={{
            width: 60, height: 28, border: `1px solid ${C.border}`, borderRadius: 7, textAlign: 'center',
            fontSize: 13, fontWeight: 600, color: C.textPrimary, outline: 'none',
          }} />
        </div>
        <div className="fluid-stagger-item">
          <ApplyButtons onCancel={onCancel} onApply={() => onApply({ weekDays: days, occurrences: count, showFrequency: true }, ['occurrences'])} applyLabel="Accept" />
        </div>
      </FluidWrapper>
    )
  }

  if (kind === 'ambiguous') {
    return (
      <ScenarioListSelect
        icon={<Lightbulb size={14} color={C.ai} strokeWidth={2.2} />}
        title="Which did you mean?"
        description="AI couldn't determine the exact intent. Select the closest match."
        options={[
          { label: 'Premium users cohort', sub: 'Target the "Premium users" cohort' },
          { label: 'Users with premium attribute', sub: 'Check user attribute = premium' },
          { label: 'Enterprise plan users', sub: 'Filter by billing plan' },
        ]}
        onCancel={onCancel}
        onAccept={(name) => onApply({ audience: name, showAudience: true }, ['audience'])}
      />
    )
  }

  // Fallback — should not reach here for known kinds
  return null
}

// ─── Editor (Configurations + VR tabs + footer) ───────────────────────────────

function PopupEditor({ template, onBack, onClose, onMin, rules, setRules, pickerActive, startPicker, stopPicker, selectedElement, setSelectedElement, setPreviewElement, recordingActive, startRecording, recordingPayload, consumeRecordingPayload }: {
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
  recordingActive: boolean
  startRecording: () => void
  recordingPayload: RecordingPayload | null
  consumeRecordingPayload: () => void
}) {
  const [tab, setTab] = useState<'config' | 'visibility'>('config')
  const [popupName, setPopupName] = useState(template.name)
  const [showSheet, setShowSheet] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState(false)
  // Pre-apply snapshot so the toast's Undo link can restore the rules. Cleared
  // when the toast dismisses so we never undo into a stale state.
  const undoSnapshotRef = useRef<VRRules | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Carries a prompt that the inline composer wants to seed the BottomSheet
  // with, so submit from the inline composer feels like one continuous flow
  // (compose → drawer opens already pre-filled → processing starts).
  const [pendingInitialPrompt, setPendingInitialPrompt] = useState<string | null>(null)
  const [pendingAutoSubmit, setPendingAutoSubmit] = useState(false)

  // Recording payload now flows directly to the inline composer in the VR
  // tab — no drawer reopen needed. We still keep the state hooks around so the
  // legacy BottomSheet path remains intact for any non-VR entry point.

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
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setRules(prev => {
      undoSnapshotRef.current = prev
      return { ...prev, ...next }
    })
    setHighlightedFields(new Set(fields))
    setToast(true)
    setTimeout(() => setHighlightedFields(new Set()), 900)
    undoTimerRef.current = setTimeout(() => {
      setToast(false)
      undoSnapshotRef.current = null
    }, 5000)
  }

  const handleUndo = () => {
    if (!undoSnapshotRef.current) return
    setRules(undoSnapshotRef.current)
    undoSnapshotRef.current = null
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current)
      undoTimerRef.current = null
    }
    setToast(false)
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
              startPicker={startPicker}
              stopPicker={stopPicker}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              setPreviewElement={setPreviewElement}
              pickerActive={pickerActive}
              onOpenReasoning={() => setShowReasoning(true)}
              phase={vrPhase}
              setPhase={setVrPhase}
              hasTypedSummary={hasTypedSummary}
              setHasTypedSummary={setHasTypedSummary}
              onStartRecording={startRecording}
              recordingPayload={recordingPayload}
              consumeRecordingPayload={consumeRecordingPayload}
              onApplyRules={applyRules}
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

      {/* Rule updated toast — slides up from the bottom of the studio with an
          Undo affordance so accepting an AI-driven change isn't a one-way door. */}
      {toast && (
        <div className="vr-toast-bottom" style={{
          position: 'absolute', left: '50%', bottom: 88,
          transform: 'translateX(-50%)',
          background: '#1F1F32',
          border: '1px solid #1F1F32',
          color: '#FFFFFF',
          fontSize: 12, fontWeight: 500,
          padding: '7px 8px 7px 14px', borderRadius: 999,
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: '0 1px 0 rgba(255, 255, 255, 0.08) inset, 0 6px 16px rgba(15, 23, 42, 0.20), 0 2px 6px rgba(15, 23, 42, 0.12)',
          letterSpacing: '-0.005em',
          zIndex: 50,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Check size={12} strokeWidth={2.8} color="#86EFAC" />
            Rule updated
          </span>
          <button
            onClick={handleUndo}
            style={{
              background: 'rgba(255, 255, 255, 0.10)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: '#FFFFFF',
              fontSize: 11.5, fontWeight: 600,
              padding: '3px 10px', borderRadius: 999,
              cursor: 'pointer',
              letterSpacing: '-0.005em',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.10)')}
          >
            Undo
          </button>
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
        onClose={() => { setShowSheet(false); setPendingAutoSubmit(false) }}
        onApplyRules={applyRules}
        pickerActive={pickerActive}
        startPicker={startPicker}
        stopPicker={stopPicker}
        selectedElement={selectedElement}
        setSelectedElement={setSelectedElement}
        setPreviewElement={setPreviewElement}
        onStartRecording={() => { setShowSheet(false); startRecording() }}
        recordingPayload={recordingPayload}
        consumeRecordingPayload={consumeRecordingPayload}
        initialPrompt={pendingInitialPrompt}
        consumeInitialPrompt={() => setPendingInitialPrompt(null)}
        autoSubmit={pendingAutoSubmit}
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
  recordingActive: boolean
  startRecording: () => void
  recordingPayload: RecordingPayload | null
  consumeRecordingPayload: () => void
}

export function PopupFlow({
  onClose, onMin, template, setTemplate,
  pickerActive, startPicker, stopPicker,
  selectedElement, setSelectedElement,
  setPreviewElement,
  recordingActive, startRecording, recordingPayload, consumeRecordingPayload,
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
      recordingActive={recordingActive}
      startRecording={startRecording}
      recordingPayload={recordingPayload}
      consumeRecordingPayload={consumeRecordingPayload}
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
