'use client'

import { useState } from 'react'
import {
  Plus,
  X,
  MoreVertical,
  Bell,
  MessageCircleMore,
  MousePointerClick,
  Lightbulb,
  BarChart2,
  ChevronDown,
  ChevronLeft,
  Signpost,
  Link,
  Video,
  FileText,
  Radar,
  MessageSquare,
  AppWindow,
  PanelBottomOpen,
  ClipboardList,
  ScanLine,
  Search,
  LayoutDashboard,
  Users,
  Settings,
  BarChart,
  Inbox,
  ChevronRight,
  Zap,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Card {
  icon: React.ReactNode
  label: string
}

const contentCards: Card[] = [
  { icon: <Signpost size={22} color="#374151" strokeWidth={1.8} />, label: 'Flow' },
  { icon: <Link size={22} color="#374151" strokeWidth={1.8} />, label: 'Link' },
  { icon: <Video size={22} color="#374151" strokeWidth={1.8} />, label: 'Video' },
  { icon: <FileText size={22} color="#374151" strokeWidth={1.8} />, label: 'Article' },
]

const widgetCards: Card[] = [
  { icon: <Radar size={22} color="#374151" strokeWidth={1.8} />, label: 'Beacon' },
  { icon: <MessageSquare size={22} color="#374151" strokeWidth={1.8} />, label: 'Smart-tip' },
  { icon: <AppWindow size={22} color="#374151" strokeWidth={1.8} />, label: 'Popup' },
  { icon: <PanelBottomOpen size={22} color="#374151" strokeWidth={1.8} />, label: 'Launcher' },
  { icon: <ClipboardList size={22} color="#374151" strokeWidth={1.8} />, label: 'Survey' },
]

// ─── Dummy App Skeleton ───────────────────────────────────────────────────────

function AppSkeleton({ open }: { open: boolean }) {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* App sidebar */}
      <div style={{ width: 220, background: '#ffffff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Acme CRM</span>
          </div>
        </div>
        {/* Nav items */}
        {[
          { icon: <LayoutDashboard size={16} />, label: 'Dashboard', active: true },
          { icon: <Users size={16} />, label: 'Contacts' },
          { icon: <Inbox size={16} />, label: 'Inbox' },
          { icon: <BarChart size={16} />, label: 'Reports' },
          { icon: <Settings size={16} />, label: 'Settings' },
        ].map(({ icon, label, active }) => (
          <div
            key={label}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 16px', margin: '2px 8px', borderRadius: 7,
              background: active ? '#eef2ff' : 'transparent',
              color: active ? '#4f46e5' : '#6b7280',
              fontSize: 14, fontWeight: active ? 600 : 400, cursor: 'pointer',
            }}
          >
            {icon}
            {label}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#4f46e5' }}>SB</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Sumit Bedi</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>Admin</div>
          </div>
        </div>
      </div>

      {/* App main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f9fafb', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ height: 56, background: '#ffffff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#111827', flex: 1 }}>Dashboard</span>
          <div style={{ width: 220, height: 34, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
            <Search size={14} color="#9ca3af" />
            <span style={{ fontSize: 13, color: '#9ca3af' }}>Search…</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', filter: open ? 'blur(1px)' : 'none', transition: 'filter 300ms', paddingRight: open ? 460 : 24 }}>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Users', value: '12,481', delta: '+8.2%', color: '#4f46e5' },
              { label: 'Active Sessions', value: '3,240', delta: '+3.1%', color: '#059669' },
              { label: 'Tickets Open', value: '147', delta: '-12%', color: '#dc2626' },
            ].map(({ label, value, delta, color }) => (
              <div key={label} style={{ background: '#ffffff', borderRadius: 10, padding: '18px 20px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6, fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{value}</div>
                <div style={{ fontSize: 12, color, fontWeight: 600 }}>{delta} vs last month</div>
              </div>
            ))}
          </div>

          {/* Table skeleton */}
          <div style={{ background: '#ffffff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>Recent Contacts</span>
              <span style={{ fontSize: 12, color: '#4f46e5', cursor: 'pointer', fontWeight: 500 }}>View all →</span>
            </div>
            {['Sarah Chen', 'Marcus Patel', 'Lena Kovač', 'David Osei', 'Amara Singh'].map((name, i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: i < 4 ? '1px solid #f9fafb' : 'none' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: ['#e0e7ff','#fce7f3','#d1fae5','#fef3c7','#ede9fe'][i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: ['#4f46e5','#db2777','#059669','#d97706','#7c3aed'][i] }}>
                  {name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{['Account Exec','Product Lead','Designer','Engineer','Marketing'][i]}</div>
                </div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{['2m ago','14m ago','1h ago','3h ago','yesterday'][i]}</div>
                <ChevronRight size={14} color="#d1d5db" />
              </div>
            ))}
          </div>

          {/* Two column bottom */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {['Recent Activity', 'Quick Actions'].map((title) => (
              <div key={title} style={{ background: '#ffffff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '18px 20px' }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 12 }}>{title}</div>
                {[1,2,3].map((r) => (
                  <div key={r} style={{ height: 12, background: '#f3f4f6', borderRadius: 6, marginBottom: 10, width: ['100%','75%','88%'][r-1] }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)',
            zIndex: 99, transition: 'opacity 300ms',
          }}
        />
      )}
    </div>
  )
}

// ─── Decorative illustration (Comp17) ─────────────────────────────────────────

function StudioIllustration() {
  return (
    <svg width="107" height="107" viewBox="0 0 107 107" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <ellipse cx="58" cy="54" rx="34" ry="34" fill="#FEE2D6" />
      <ellipse cx="66" cy="42" rx="26" ry="26" fill="#FBBBBE" />
      <ellipse cx="82" cy="30" rx="20" ry="20" fill="#AAD2F3" />
      <ellipse cx="44" cy="38" rx="16" ry="16" fill="#FFA34F" opacity="0.75" />
      <rect x="0" y="0" width="20" height="20" rx="2" fill="#FF6B18" transform="translate(58,14) rotate(45)" />
      <polygon points="34,107 60,64 86,107" fill="#751C3B" />
    </svg>
  )
}

// ─── Studio logo ──────────────────────────────────────────────────────────────

function StudioLogo() {
  return (
    <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/brand/whatfix_symbol.svg" alt="Whatfix" width={20} height={20} style={{ objectFit: 'contain' }} />
    </div>
  )
}

// ─── Manage icon ──────────────────────────────────────────────────────────────

function ManageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <line x1="3" y1="4" x2="17" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="16" x2="17" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7" cy="4" r="2" fill="#1F1F32" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="13" cy="10" r="2" fill="#1F1F32" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7" cy="16" r="2" fill="#1F1F32" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

// ─── Sidebar icon ─────────────────────────────────────────────────────────────

function SidebarIcon({ children, active = false, title }: { children: React.ReactNode; active?: boolean; title?: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', borderRadius: 6, cursor: 'pointer', flexShrink: 0,
        background: active ? 'rgba(61,60,82,0.9)' : hovered ? 'rgba(255,255,255,0.08)' : 'transparent',
        color: active ? '#ffffff' : hovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)',
        transition: 'background 150ms, color 150ms',
      }}
    >
      {children}
    </button>
  )
}

// ─── Header action button ─────────────────────────────────────────────────────

function HeaderButton({ children, title, onClick }: { children: React.ReactNode; title?: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 28, height: 28, border: 'none', borderRadius: 6,
        background: hovered ? 'rgba(0,0,0,0.07)' : 'transparent',
        color: '#6B697B', cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center', transition: 'background 150ms', flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 16px 6px' }}>
      {children}
    </div>
  )
}

// ─── Card grid ────────────────────────────────────────────────────────────────

function CardGrid({ cards }: { cards: Card[] }) {
  const [hovered, setHovered] = useState<number | null>(null)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '4px 16px 12px' }}>
      {cards.map((card, i) => (
        <div
          key={card.label}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{
            background: '#ffffff', border: `1px solid ${hovered === i ? '#9ca3af' : '#e5e7eb'}`,
            borderRadius: 8, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 6, height: 80,
            cursor: 'pointer', transition: 'border-color 150ms, box-shadow 150ms',
            boxShadow: hovered === i ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          {card.icon}
          <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{card.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 36, height: 20, borderRadius: 10, cursor: 'pointer', position: 'relative',
        background: checked ? '#C74900' : '#d1d5db', transition: 'background 200ms', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 2, left: checked ? 18 : 2, width: 16, height: 16,
        borderRadius: '50%', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'left 200ms',
      }} />
    </div>
  )
}

// ─── Studio Panel ─────────────────────────────────────────────────────────────

function StudioPanel({ onClose }: { onClose: () => void }) {
  const [previewMode, setPreviewMode] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Left sidebar */}
      <div style={{ width: 48, background: '#1F1F32', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 8, paddingBottom: 12 }}>
        <div style={{ marginBottom: 6 }}><StudioLogo /></div>

        {/* Account switcher */}
        <div style={{ width: 40, height: 42, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 4, cursor: 'pointer' }}>
          <svg width="20" height="13" viewBox="0 0 20 13" fill="none">
            <path d="M16.5 13H4.5a4 4 0 0 1 0-8c.28 0 .55.03.82.08A5 5 0 0 1 15.02 7H15.5a2.5 2.5 0 0 1 1 4.8V13Z" stroke="#00A1E0" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
          </svg>
          <ChevronDown size={8} color="rgba(255,255,255,0.35)" style={{ marginTop: 2 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
          <SidebarIcon active title="Create"><Plus size={18} strokeWidth={2.5} /></SidebarIcon>
          <SidebarIcon title="Manage"><ManageIcon /></SidebarIcon>
          <SidebarIcon title="Collaborate"><MessageCircleMore size={18} strokeWidth={1.8} /></SidebarIcon>
          <SidebarIcon title="Tracking"><MousePointerClick size={18} strokeWidth={1.8} /></SidebarIcon>
          <SidebarIcon title="Insights"><Lightbulb size={18} strokeWidth={1.8} /></SidebarIcon>
          <SidebarIcon title="Analyse"><BarChart2 size={18} strokeWidth={1.8} /></SidebarIcon>
        </div>

        <div style={{ width: 48, height: 1, background: 'rgba(255,255,255,0.1)', margin: '8px 0', flexShrink: 0 }} />

        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#C74900', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: 11, fontWeight: 600, cursor: 'pointer', marginBottom: 10, flexShrink: 0 }} title="Profile">T</div>

        <div style={{ position: 'relative', width: 24, height: 24, cursor: 'pointer' }}>
          <Bell size={18} strokeWidth={1.8} color="rgba(255,255,255,0.6)" style={{ display: 'block', margin: 3 }} />
          <div style={{ position: 'absolute', top: 1, right: 1, width: 6, height: 6, borderRadius: '50%', background: '#0875D7', border: '1.5px solid #1F1F32' }} />
        </div>
      </div>

      {/* Main panel */}
      <div style={{ width: 383, background: '#F2F2F8', display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Header / banner */}
        <div style={{ background: '#FFF7F4', padding: '14px 16px 20px 24px', position: 'relative', minHeight: 130, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 2, zIndex: 2 }}>
            <HeaderButton title="Collapse panel"><ChevronLeft size={14} strokeWidth={2} /></HeaderButton>
            <HeaderButton title="More options"><MoreVertical size={14} strokeWidth={2} /></HeaderButton>
            <HeaderButton title="Close" onClick={onClose}><X size={14} strokeWidth={2} /></HeaderButton>
          </div>
          <div style={{ maxWidth: 270, paddingTop: 2 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#C74900', lineHeight: 1.4, letterSpacing: '-0.01em' }}>Studio: </span>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#3D3C52', lineHeight: 1.4, letterSpacing: '-0.01em' }}>Guide. Analyze. Collaborate. In context. All in one place.</span>
          </div>
          <div style={{ position: 'absolute', right: 14, bottom: 6, pointerEvents: 'none' }}>
            <StudioIllustration />
          </div>
        </div>

        {/* User row */}
        <div style={{ background: '#ffffff', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a2332' }}>Sumit_Bedi_Demo</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Preview Mode</span>
            <Toggle checked={previewMode} onChange={() => setPreviewMode(v => !v)} />
          </div>
        </div>

        {/* Element analysis banner */}
        <div style={{ background: '#fefce8', border: '1px solid #fef08a', margin: '10px 12px', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ScanLine size={16} color="#713f12" />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#713f12' }}>Element analysis</span>
          </div>
          <span style={{ fontSize: 13, color: '#2563eb', fontWeight: 500, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}>View</span>
        </div>

        {/* Content section */}
        <div style={{ flexShrink: 0 }}>
          <SectionLabel>Content</SectionLabel>
          <CardGrid cards={contentCards} />
        </div>

        <div style={{ height: 1, background: '#e5e7eb', margin: '0 16px' }} />

        {/* Widgets section */}
        <div style={{ flexShrink: 0, paddingBottom: 20 }}>
          <SectionLabel>Widgets</SectionLabel>
          <CardGrid cards={widgetCards} />
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StudioPage() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <AppSkeleton open={open} />

      {/* Studio panel — slides in from right */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          display: 'flex', zIndex: 100,
          boxShadow: open ? '-4px 0 40px rgba(0,0,0,0.22)' : 'none',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 320ms cubic-bezier(0.32,0,0.15,1)',
        }}
      >
        <StudioPanel onClose={() => setOpen(false)} />
      </div>

      {/* Open Studio button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 200,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: '#1F1F32', color: '#ffffff',
            fontSize: 14, fontWeight: 600,
            fontFamily: "'Inter', -apple-system, sans-serif",
            boxShadow: '0 4px 16px rgba(31,31,50,0.4)',
            transition: 'transform 150ms, box-shadow 150ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(31,31,50,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(31,31,50,0.4)' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/whatfix_symbol.svg" alt="Whatfix" width={18} height={18} style={{ filter: 'brightness(0) invert(1)' }} />
          Open Studio
        </button>
      )}
    </>
  )
}
