'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowUp, Plus, Mic, Square, Check, FileText, X, Loader2, ChevronRight,
  LayoutTemplate, Route, Lightbulb, SquarePen, History, Search, RotateCw, Copy,
  Pause, Play, Hand, Sparkles,
} from 'lucide-react'
import { PlanCanvas } from './firstdraft/_components/plan-canvas'
import { JOURNEY } from './firstdraft/_state/mock-data'
import { onChatRefine, type RefineRequest } from './firstdraft/_state/edit-bus'

// First Draft palette (verbatim): cream canvas, white rail, blue accent.
const ACCENT = '#0975D7'
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace"

// Mock history (demo) — past sessions grouped by recency, Grok-style.
const HISTORY: { group: string; items: { id: string; title: string; meta: string }[] }[] = [
  { group: 'Today', items: [
    { id: 'h1', title: 'Procure-to-Pay SOP → 4 flows', meta: '4 flows · 2h ago' },
    { id: 'h2', title: 'Onboarding guide → Smart Tips', meta: '3 tips · 5h ago' },
  ]},
  { group: 'Yesterday', items: [
    { id: 'h3', title: 'Release notes → announcement popup', meta: '1 popup' },
    { id: 'h4', title: 'Expense policy → article', meta: '1 article' },
  ]},
  { group: 'Last 7 days', items: [
    { id: 'h5', title: 'Salesforce setup walkthrough', meta: '6-step flow' },
    { id: 'h6', title: 'Refund SOP → flow + tip', meta: '2 experiences' },
    { id: 'h7', title: 'New-hire IT checklist', meta: '1 flow' },
  ]},
]
const DOC = { name: 'Procure-to-Pay SOP.pdf', pages: 12, size: '1.4 MB', url: '/Procure-to-Pay%20SOP.pdf' }

type Phase = 'empty' | 'attached' | 'thinking' | 'clarifying' | 'working' | 'plan' | 'building' | 'done'

// Clarifier — the agent pauses and asks a couple of quick questions (Claude /
// First Draft pattern). Tabs across the top; one selectable answer per tab.
interface ClarifyTab { id: string; label: string; question: string; options: string[] }
const CLARIFY_TABS: ClarifyTab[] = [
  { id: 'persona',  label: 'Persona',   question: 'Who is this guidance for?',         options: ['Requesters', 'Approvers', 'Procurement team', 'Everyone'] },
  { id: 'objective', label: 'Objective', question: 'What are you trying to achieve?',    options: ['Onboard new users', 'Reduce errors', 'Speed up the process', 'Drive adoption'] },
]

// The four experiences mirror the First Draft plan canvas (popup / flow / smarttip / article).
interface Suggestion {
  id: string
  type: 'POP-UP' | 'FLOW' | 'SMART TIP' | 'ARTICLE'
  title: string
  steps: string
  section: string
  page: number
  checked: boolean
}
const SUGGESTIONS: Suggestion[] = [
  { id: 'popup-1',   type: 'POP-UP',    title: 'Meet Approval Bot',            steps: 'Announce',  section: '§2.1 Raising a Requisition', page: 2, checked: true },
  { id: 'flow-1',    type: 'FLOW',      title: 'Configure Approval Bot',       steps: '10 steps',  section: '§3.0 Approval Matrix',       page: 3, checked: true },
  { id: 'tip-1',     type: 'SMART TIP', title: 'Approvals route through Bot',  steps: 'Inline',    section: '§4.2 PO Generation',         page: 4, checked: true },
  { id: 'article-1', type: 'ARTICLE',   title: 'How Approval Bot works',       steps: '4 sections', section: '§5.1 Three-Way Match',      page: 5, checked: false },
]

// Canvas card-type (lowercase, from edit-bus) → our Suggestion type tokens.
const REFINE_TYPE: Record<RefineRequest['cardType'], Suggestion['type']> = {
  popup: 'POP-UP', flow: 'FLOW', smarttip: 'SMART TIP', article: 'ARTICLE',
}

// Clean type labels for the plan card meta row.
const TYPE_LABEL: Record<Suggestion['type'], string> = {
  'POP-UP': 'Pop-up', 'FLOW': 'Flow', 'SMART TIP': 'Smart tip', 'ARTICLE': 'Article',
}

// Content-type icons (same set as the preview canvas).
function TypeIcon({ type }: { type: Suggestion['type'] }) {
  const props = { size: 15, strokeWidth: 1.9 as const }
  if (type === 'POP-UP') return <LayoutTemplate {...props} />
  if (type === 'FLOW') return <Route {...props} />
  if (type === 'SMART TIP') return <Lightbulb {...props} />
  return <FileText {...props} />
}

// First Draft analyzing checklist (verbatim style; sub-lines are code-styled hints).
const ANALYZE_STEPS = [
  { id: 'a1', label: 'Extracted text from 12 pages',          sub: 'Procure-to-Pay SOP.pdf' },
  { id: 'a2', label: 'Detected 5 sections',                   sub: '§1 Purpose · §2 Requests · §3 Approvals · §4 POs · §5 Payment' },
  { id: 'a3', label: 'Identifying processes',                 sub: '§4 PO Generation' },
  { id: 'a4', label: 'Matching to content types',             sub: 'pop-up → flow → smart tip → article' },
]

const HIGHLIGHTS: Record<string, { lead: string; mark: string; tail: string }> = {
  'popup-1':   { lead: 'Any employee can initiate a purchase. Before a supplier can be engaged, the need must be captured as a formal requisition in the Procurement portal.', mark: 'All purchases above $500 must begin with a purchase requisition raised in the Procurement portal.', tail: 'The requestor selects the cost center, adds line items, and attaches a supplier quote before submitting for manager approval.' },
  'flow-1':    { lead: 'Every requisition is routed for approval based on its total amount and the cost center it is charged against.', mark: 'Requisitions are approved in tiers: up to $5,000 by the Cost Center Manager, up to $25,000 by the Finance Approver, and above $25,000 by the VP of Finance.', tail: 'Each approver can approve, reject with a reason, or request changes.' },
  'tip-1':     { lead: 'Once a requisition clears the approval matrix, Procurement converts it into a purchase order.', mark: 'An approved requisition is converted into a purchase order, assigned a PO number, and dispatched to the supplier from the Procurement portal.', tail: 'The supplier, line items, and amounts carry over from the requisition.' },
  'article-1': { lead: 'Before any supplier invoice is paid, Accounts Payable verifies that what was ordered, received, and billed all agree.', mark: 'Payment is released only after a successful three-way match between the purchase order, the goods receipt, and the supplier invoice.', tail: 'If the three documents do not match within tolerance, the invoice is placed on hold and routed to Procurement.' },
}

export function CreateFlow() {
  const [phase, setPhase] = useState<Phase>('empty')
  const [prompt, setPrompt] = useState('')
  const [command, setCommand] = useState('')
  const [attached, setAttached] = useState(false)
  const [analyzeShown, setAnalyzeShown] = useState<Set<string>>(new Set())
  const [analyzeDone, setAnalyzeDone] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState(0)
  const [thinking, setThinking] = useState(false)
  const [thoughtCollapsed, setThoughtCollapsed] = useState(false)
  // Clarifier state
  const [clarifyTab, setClarifyTab] = useState('persona')
  const [clarifyAnswers, setClarifyAnswers] = useState<Record<string, string>>({})
  const [clarifyReply, setClarifyReply] = useState('')   // posted answer summary shown as a user msg
  const [clarifyCardOpen, setClarifyCardOpen] = useState(false)  // gates the card slide-in
  const [toast, setToast] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [attachMenuOpen, setAttachMenuOpen] = useState(false)
  // Living plan: each refinement posts a turn + bumps the version. Old plans
  // collapse into restorable "Plan vN" chips rather than being discarded.
  const [planVersion, setPlanVersion] = useState(1)
  const [refineTurns, setRefineTurns] = useState<{ id: string; text: string; version: number }[]>([])
  const [planRefining, setPlanRefining] = useState(false)
  // Build mini-control state (ported from First Draft)
  const [buildPhase, setBuildPhase] = useState<'idle' | 'building' | 'paused'>('idle')
  const [buildIndex, setBuildIndex] = useState(0)
  const buildIndexRef = useRef(0)
  const buildQueueRef = useRef<Suggestion[]>([])
  const buildTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>(SUGGESTIONS)
  const [buildStatus, setBuildStatus] = useState<Record<string, 'queued' | 'building' | 'ready'>>({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [pdfDrawer, setPdfDrawer] = useState<Suggestion | null>(null)
  // Scoped refine: clicking a card's Edit (Pencil) in the preview canvas drops a
  // reference pill into the composer so the next message is scoped to that card.
  const [refineScope, setRefineScope] = useState<RefineRequest | null>(null)

  const threadRef = useRef<HTMLDivElement | null>(null)
  const composerRef = useRef<HTMLTextAreaElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Card "Edit" (Pencil) in the preview canvas → scope the composer to that card.
  useEffect(() => onChatRefine((req) => {
    setRefineScope(req)
    setPreviewOpen(false)
    setTimeout(() => composerRef.current?.focus(), 60)
  }), [])

  const checked = suggestions.filter((s) => s.checked)

  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [phase, command, analyzeShown.size, analyzeDone.size, thinking])

  // Clarifier keyboard shortcuts — make the footer hints real: number keys
  // select the matching option, ←/→ switch tabs, Enter submits when complete.
  useEffect(() => {
    if (phase !== 'clarifying' || !clarifyCardOpen) return
    const onKey = (e: KeyboardEvent) => {
      const tab = CLARIFY_TABS.find((t) => t.id === clarifyTab) ?? CLARIFY_TABS[0]
      const n = parseInt(e.key, 10)
      if (!Number.isNaN(n) && n >= 1 && n <= tab.options.length) {
        e.preventDefault(); pickClarify(tab.id, tab.options[n - 1]); return
      }
      const idx = CLARIFY_TABS.findIndex((t) => t.id === clarifyTab)
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault(); const nx = CLARIFY_TABS[idx + 1]; if (nx) setClarifyTab(nx.id); return
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault(); const pv = CLARIFY_TABS[idx - 1]; if (pv) setClarifyTab(pv.id); return
      }
      if (e.key === 'Enter' && CLARIFY_TABS.every((t) => clarifyAnswers[t.id])) {
        e.preventDefault(); submitClarify()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, clarifyCardOpen, clarifyTab, clarifyAnswers])

  // Close overlays on Escape (drawer → preview → history priority order).
  useEffect(() => {
    if (!previewOpen && !pdfDrawer && !historyOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (pdfDrawer) setPdfDrawer(null)
      else if (historyOpen) setHistoryOpen(false)
      else if (previewOpen) setPreviewOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [previewOpen, pdfDrawer, historyOpen])

  useEffect(() => {
    const ta = composerRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [prompt])

  const reset = () => {
    timers.current.forEach(clearTimeout); timers.current = []
    setPhase('empty'); setPrompt(''); setCommand(''); setAttached(false)
    setAnalyzeShown(new Set()); setAnalyzeDone(new Set()); setProgress(0); setThinking(false); setThoughtCollapsed(false)
    setSuggestions(SUGGESTIONS); setBuildStatus({}); setPreviewOpen(false); setPdfDrawer(null)
    setClarifyTab('persona'); setClarifyAnswers({}); setClarifyReply(''); setClarifyCardOpen(false); setToast(null)
    setHistoryOpen(false); setAttachMenuOpen(false); setPlanVersion(1); setRefineTurns([]); setPlanRefining(false)
    setBuildPhase('idle'); setBuildIndex(0); buildIndexRef.current = 0
    if (buildTimerRef.current) clearTimeout(buildTimerRef.current)
  }

  // Attach the doc into the composer as a chip. Never sends — the user still
  // has to type (optional) and press Enter. Just like First Draft.
  const attachDoc = () => {
    setAttached(true)
    if (phase === 'empty') setPhase('attached')
    setTimeout(() => composerRef.current?.focus(), 60)
  }

  // Send only fires on Enter / send button. Requires a doc to be attached.
  const submit = () => {
    if (phase === 'working' || phase === 'building') return
    if (!attached) { attachDoc(); return }          // no doc yet → just attach, wait for input
    if (phase !== 'attached' && phase !== 'plan' && phase !== 'done') return
    if (phase === 'attached') {
      const text = prompt.trim() || 'Analyze this and convert it into flows.'
      setCommand(text)
      setPrompt('')
      setAttached(false)   // doc is now part of the sent message → clear the composer chip
      askClarify()
    } else if (phase === 'plan') {
      // Living plan: a refinement posts as a turn, the agent "re-plans", and the
      // version bumps. The prior plan stays in history as a "Plan vN" chip.
      refinePlan(prompt.trim())
    } else {
      setPrompt('')
    }
  }

  // Refine the current plan → post the user's message, show a thinking beat,
  // collapse the old plan to a version chip, then surface the updated plan.
  const refinePlan = (text: string) => {
    if (!text) return
    const fromVersion = planVersion
    // If a card is scoped, prefix the turn so it's clear which one we're editing.
    const scoped = refineScope ? `${refineScope.label} — ${text}` : text
    setRefineScope(null)
    setPrompt('')
    setRefineTurns((p) => [...p, { id: `r-${fromVersion}-${Date.now() % 100000}`, text: scoped, version: fromVersion }])
    setPlanRefining(true)
    timers.current.push(setTimeout(() => {
      setPlanVersion((v) => v + 1)
      setPlanRefining(false)
    }, 1400))
  }

  // Step 1: think beat → agent types "Let me ask you a few questions" → THEN
  // the clarifier card subtly slides in (not instant).
  const askClarify = () => {
    setPhase('thinking')
    setThinking(true)
    setClarifyCardOpen(false)
    // thinking dots for ~1.3s, then the message lands
    timers.current.push(setTimeout(() => {
      setThinking(false)
      setPhase('clarifying')
    }, 1300))
    // a beat after the message, the card animates in
    timers.current.push(setTimeout(() => {
      setClarifyCardOpen(true)
    }, 1300 + 650))
  }

  // Pick an answer for a tab, then auto-advance to the next unanswered tab.
  const pickClarify = (tabId: string, opt: string) => {
    setClarifyAnswers((p) => ({ ...p, [tabId]: opt }))
    const idx = CLARIFY_TABS.findIndex((t) => t.id === tabId)
    const next = CLARIFY_TABS[idx + 1]
    if (next && !clarifyAnswers[next.id]) setTimeout(() => setClarifyTab(next.id), 220)
  }

  // Step 2: user submits the clarifier answers → post as a message → analyze.
  // The attached document chip is cleared so the composer is clean afterwards.
  const submitClarify = () => {
    const parts = CLARIFY_TABS.map((t) => clarifyAnswers[t.id]).filter(Boolean)
    if (parts.length === 0) return
    setClarifyReply(parts.join(' · '))
    setClarifyCardOpen(false)
    setAttached(false)        // remove the doc chip from the composer
    setPrompt('')
    startWorking()
  }

  const startWorking = () => {
    setPhase('working')
    setThinking(true)
    setThoughtCollapsed(false)
    setAnalyzeShown(new Set()); setAnalyzeDone(new Set()); setProgress(15)

    const THINK = 1200      // real "thinking" beat before the agent replies
    timers.current.push(setTimeout(() => setThinking(false), THINK))

    // Progress only ever moves UP — each completed step bumps it by a fixed
    // amount (35 → 50 → 65 → 80 → 90), then 100 at the end. Never decreases.
    const STEP = 850, RESOLVE = 560
    const PCTS = [35, 50, 65, 80]
    ANALYZE_STEPS.forEach((s, i) => {
      timers.current.push(setTimeout(() => setAnalyzeShown((p) => new Set(p).add(s.id)), THINK + i * STEP))
      timers.current.push(setTimeout(() => {
        setAnalyzeDone((p) => new Set(p).add(s.id))
        setProgress(PCTS[i] ?? 90)
      }, THINK + i * STEP + RESOLVE))
    })
    const total = THINK + ANALYZE_STEPS.length * STEP + 350
    // Steps done → fill bar + collapse the thinking block FIRST.
    timers.current.push(setTimeout(() => { setProgress(100); setThoughtCollapsed(true) }, total))
    // Only after the collapse animation settles do we reveal the plan, so the
    // analysis and the plan never overlap on screen.
    timers.current.push(setTimeout(() => setPhase('plan'), total + 520))
  }

  const toggle = (id: string) => setSuggestions((p) => p.map((s) => s.id === id ? { ...s, checked: !s.checked } : s))
  const selectAll = () => { const allOn = suggestions.every((s) => s.checked); setSuggestions((p) => p.map((s) => ({ ...s, checked: !allOn }))) }

  // ── Build orchestration — tick-based so Pause / Resume / Take over work
  //    (ported from First Draft's BuildMiniControl pattern). ──────────────────
  const BUILD_PER = 1600

  const finishBuild = (n: number) => {
    setPhase('done')
    setBuildPhase('idle')
    setToast(`${n} ${n === 1 ? 'flow' : 'flows'} added to Mukul_SF_OOB`)
    timers.current.push(setTimeout(() => setToast(null), 3600))
  }

  const buildTick = () => {
    const queue = buildQueueRef.current
    const i = buildIndexRef.current
    if (i >= queue.length) { finishBuild(queue.length); return }
    const s = queue[i]
    setBuildStatus((p) => ({ ...p, [s.id]: 'building' }))
    buildTimerRef.current = setTimeout(() => {
      setBuildStatus((p) => ({ ...p, [s.id]: 'ready' }))
      buildIndexRef.current = i + 1
      setBuildIndex(i + 1)
      if (i + 1 >= queue.length) finishBuild(queue.length)
      else buildTimerRef.current = setTimeout(buildTick, 250)
    }, BUILD_PER - 250)
  }

  const startBuilding = () => {
    if (checked.length === 0) return
    setPhase('building')
    setBuildPhase('building')
    buildQueueRef.current = checked
    buildIndexRef.current = 0
    setBuildIndex(0)
    const init: Record<string, 'queued' | 'building' | 'ready'> = {}
    checked.forEach((s) => { init[s.id] = 'queued' })
    setBuildStatus(init)
    buildTick()
  }

  const pauseBuild = () => {
    if (buildTimerRef.current) clearTimeout(buildTimerRef.current)
    setBuildPhase('paused')
  }
  const resumeBuild = () => {
    setBuildPhase('building')
    buildTick()
  }
  const takeOverBuild = () => {
    if (buildTimerRef.current) clearTimeout(buildTimerRef.current)
    setBuildPhase('idle')
    setPhase('plan')   // hand control back to the user at the plan
  }

  const working = phase === 'working' || phase === 'building'
  // Composer is inert while the agent is thinking, asking, or working.
  const composerLocked = working || phase === 'thinking' || phase === 'clarifying'

  return (
    <div className="cf-root" style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--wfc-canvas-bg)', overflow: 'hidden', fontFamily: 'var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      {/* Persistent header — identity + new chat + history */}
      <div className="cf-header">
        <span className="cf-header-title">First Draft</span>
        <div className="cf-header-actions">
          <button className="cf-header-btn" title="New chat" aria-label="New chat" onClick={reset}>
            <SquarePen size={16} strokeWidth={1.9} />
          </button>
          <button className="cf-header-btn" title="History" aria-label="History" onClick={() => setHistoryOpen(true)}>
            <History size={16} strokeWidth={1.9} />
          </button>
        </div>
      </div>

      {/* Thread */}
      <div ref={threadRef} className="cf-thread" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: (phase === 'empty' || phase === 'attached') ? '0' : '20px 18px 12px', display: 'flex', flexDirection: 'column' }}>
        {(phase === 'empty' || phase === 'attached') ? (
          <EmptyState onUpload={attachDoc} attached={attached} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', maxWidth: 640, margin: '0 auto' }}>
            {/* user: doc + command */}
            <UserBubble text={command} attachedFile={DOC.name} />

            {/* Pre-message thinking beat — the agent visibly thinks BEFORE it
                replies (Grok / Perplexity / First Draft pattern). */}
            {thinking && phase === 'thinking' && <AgentBubble thinking />}

            {/* Clarifying question — agent pauses and asks before analyzing */}
            {(phase === 'clarifying' || clarifyReply) && (
              <AgentBubble>
                <p className="wfc-msg-text">Let me ask you a few quick questions so the guidance lands right.</p>
              </AgentBubble>
            )}

            {/* User's clarifier answers, posted as a reply */}
            {clarifyReply && <UserBubble text={clarifyReply} />}

            {/* Pre-analysis thinking beat */}
            {thinking && phase === 'working' && <AgentBubble thinking />}

            {/* agent lead-in — only once analysis is underway */}
            {!thinking && (phase === 'working' || phase === 'plan' || phase === 'building' || phase === 'done') && (
              <AgentBubble>
                <p className="wfc-msg-text">Reading <strong>{DOC.name}</strong> and mapping out the processes…</p>
              </AgentBubble>
            )}

            {/* Thinking — one quiet line, collapses when done. */}
            {!thinking && analyzeShown.size > 0 && (
              <ThinkingBlock
                shown={analyzeShown}
                done={analyzeDone}
                progress={progress}
                working={phase === 'working' && !thoughtCollapsed}
                collapsed={thoughtCollapsed}
                onToggle={() => setThoughtCollapsed((v) => !v)}
              />
            )}

            {/* plan */}
            {(phase === 'plan' || phase === 'building' || phase === 'done') && (
              <>
                <AgentBubble>
                  <p className="wfc-msg-text">I found <strong>{suggestions.length} flows</strong> in this document. Pick the ones to build; each links to the section it came from.</p>
                </AgentBubble>

                {/* Refinement history: each prior version collapses to a chip,
                    followed by the user's refine message. The live plan renders
                    last. Old plans are preserved, never silently discarded. */}
                {refineTurns.map((t) => (
                  <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button className="cf-plan-version-chip wfc-fade-up" onClick={() => setPlanVersion(t.version)} title={`Restore plan v${t.version}`}>
                      <Check size={11} strokeWidth={2.6} />
                      <span>Plan v{t.version}</span>
                      <span className="cf-plan-version-meta">{suggestions.length} flows</span>
                    </button>
                    <UserBubble text={t.text} />
                  </div>
                ))}

                {planRefining ? (
                  <AgentBubble thinking />
                ) : (
                  <>
                    {refineTurns.length > 0 && (
                      <AgentBubble>
                        <p className="wfc-msg-text">Updated the plan. Here&apos;s <strong>v{planVersion}</strong>.</p>
                      </AgentBubble>
                    )}
                    <PlanList
                      suggestions={suggestions}
                      phase={phase}
                      version={planVersion}
                      buildStatus={buildStatus}
                      onToggle={toggle}
                      onSelectAll={selectAll}
                      onItemClick={(s) => setPdfDrawer(s)}
                      onRegenerate={() => refinePlan('Regenerate the plan')}
                    />
                    {phase === 'plan' && (
                      <div className="cf-plan-actions wfc-fade-up">
                        <button onClick={startBuilding} disabled={checked.length === 0} className="cf-plan-build">
                          Build {checked.length} {checked.length === 1 ? 'flow' : 'flows'}
                        </button>
                        <button onClick={() => setPreviewOpen(true)} className="cf-plan-preview">
                          Preview all
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {phase === 'building' && (
              <AgentBubble>
                <p className="wfc-msg-text">Building <strong>{checked.length} flows</strong>. I&apos;ll add them to <strong>Mukul_SF_OOB</strong>.</p>
              </AgentBubble>
            )}

            {phase === 'done' && <DoneBubble count={checked.length} onPreview={() => setPreviewOpen(true)} />}
          </div>
        )}
      </div>

      {/* Composer dock */}
      <div className="wfc-chat-refine" style={{ flexShrink: 0, width: '100%', maxWidth: 640, margin: '0 auto', padding: '12px 18px 18px' }}>
        {/* Clarifier — tiny tabbed question card above the input bar (Claude pattern) */}
        {phase === 'clarifying' && clarifyCardOpen && (
          <ClarifierCard
            activeTab={clarifyTab}
            setActiveTab={setClarifyTab}
            answers={clarifyAnswers}
            onPick={pickClarify}
            onSubmit={submitClarify}
          />
        )}

        {/* Build mini-control — ported from First Draft, sits above the composer */}
        {(buildPhase === 'building' || buildPhase === 'paused') && (
          <BuildMiniControl
            paused={buildPhase === 'paused'}
            index={buildIndex}
            total={buildQueueRef.current.length}
            cardName={buildQueueRef.current[Math.min(buildIndex, buildQueueRef.current.length - 1)]?.title ?? ''}
            onPause={pauseBuild}
            onResume={resumeBuild}
            onTakeOver={takeOverBuild}
          />
        )}

        <div className="wfc-composer wfc-composer-mini">
          {/* Scoped refine pill — the next message targets this card only. */}
          {refineScope && (
            <div className="cf-scope-pill cf-fade-up">
              <span className="cf-scope-icon"><TypeIcon type={REFINE_TYPE[refineScope.cardType]} /></span>
              <span className="cf-scope-text">
                <span className="cf-scope-kicker">Editing</span>
                <span className="cf-scope-label">{refineScope.label}</span>
              </span>
              <button type="button" className="cf-scope-close" aria-label="Clear scope" onClick={() => setRefineScope(null)}>
                <X size={12} strokeWidth={2.4} />
              </button>
            </div>
          )}
          {attached && (
            <div className="cf-attach-chip cf-fade-up">
              <span className="cf-attach-icon"><FileText size={15} strokeWidth={1.9} color="#fff" /></span>
              <span className="cf-attach-text">
                <span className="cf-attach-name">{DOC.name}</span>
                <span className="cf-attach-sub">PDF · {DOC.pages} pages · {DOC.size}</span>
              </span>
              <button type="button" className="cf-attach-close" aria-label="Remove attachment"
                onClick={() => { setAttached(false); if (phase === 'attached') setPhase('empty') }}>
                <X size={12} strokeWidth={2.2} />
              </button>
            </div>
          )}
          <textarea
            ref={composerRef}
            className="wfc-composer-textarea"
            placeholder={
              phase === 'empty' || phase === 'attached' ? 'Describe what you want to build…' :
              phase === 'clarifying' ? 'Pick your answers above…' :
              phase === 'plan' ? 'Refine the plan, e.g. "merge flows 3 & 4"' :
              phase === 'done' ? 'Ask a follow-up…' :
              'Working…'
            }
            rows={1}
            value={prompt}
            disabled={composerLocked}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
          />
          <div className="wfc-composer-row">
            <div className="wfc-composer-actions" style={{ position: 'relative' }}>
              <button type="button" className="wfc-mini-btn" aria-label="Add attachment" aria-haspopup="menu" aria-expanded={attachMenuOpen}
                disabled={composerLocked} onClick={() => setAttachMenuOpen((v) => !v)}>
                <Plus size={14} strokeWidth={1.8} />
              </button>
              {attachMenuOpen && (
                <>
                  <div onClick={() => setAttachMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 30 }} />
                  <div className="cf-attach-menu cf-fade-up" role="menu">
                    <button className="cf-attach-menu-item" role="menuitem" onClick={() => { setAttachMenuOpen(false); attachDoc() }}>
                      <FileText size={14} strokeWidth={1.8} /> Upload a document
                    </button>
                    <button className="cf-attach-menu-item" role="menuitem" onClick={() => { setAttachMenuOpen(false); attachDoc() }}>
                      <History size={14} strokeWidth={1.8} /> From your library
                    </button>
                  </div>
                </>
              )}
              <button type="button" className="wfc-mini-btn" aria-label="Voice, coming soon" disabled>
                <Mic size={14} strokeWidth={1.8} />
              </button>
            </div>
            {working ? (
              <button type="button" className="wfc-send-btn wfc-stop-btn" aria-label="Stop" onClick={reset}>
                <Square size={11} strokeWidth={0} fill="currentColor" />
              </button>
            ) : (
              <button type="button" className="wfc-send-btn" aria-label="Send"
                disabled={composerLocked || !(prompt.trim().length > 0 || attached)} onClick={submit}>
                <ArrowUp size={14} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>

      <input ref={fileRef} type="file" accept=".pdf,.docx,.pptx" hidden onChange={attachDoc} />

      {/* Preview all — a contained floating panel over a dim scrim, so the
          background app stays visible. Click the scrim or Close to dismiss. */}
      {mounted && previewOpen && createPortal(
        <div className="cf-preview-scrim" role="presentation"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setPreviewOpen(false) }}>
          <div className="cf-preview-box wfc-create-root" role="dialog" aria-modal="true" aria-label="Plan preview"
            style={{ fontFamily: 'var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
            <div className="cf-preview-bar">
              <span className="cf-preview-title">Preview</span>
              <span className="cf-preview-hint">Esc to close</span>
              <button className="cf-preview-close" onClick={() => setPreviewOpen(false)} title="Close preview">
                <X size={15} strokeWidth={2} /> Close
              </button>
            </div>
            <div className="wfc-plan-canvas cf-preview-canvas">
              <PlanCanvas />
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Bottom drawer PDF source — INSIDE the panel (absolute within cf-root) */}
      {pdfDrawer && <PdfDrawer suggestion={pdfDrawer} onClose={() => setPdfDrawer(null)} />}

      {/* Build-complete toast */}
      {toast && (
        <div className="cf-toast" role="status" aria-live="polite">
          <span className="cf-toast-check"><Check size={11} strokeWidth={3} color="#fff" /></span>
          {toast}
        </div>
      )}

      {/* History slide-over (inside the panel) */}
      {historyOpen && <HistoryPanel onClose={() => setHistoryOpen(false)} onPick={reset} />}
    </div>
  )
}

// ─── First Draft chat atoms (verbatim classes) ────────────────────────────────
function UserBubble({ text, attachedFile }: { text: string; attachedFile?: string }) {
  return (
    <div className="cf-user-row wfc-fade-up">
      <div className="cf-user">
        {attachedFile && (
          <span className="cf-user-file">
            <span className="cf-user-file-icon"><FileText size={11} strokeWidth={2} color="#fff" /></span>
            {attachedFile}
          </span>
        )}
        {text && <span className="cf-user-text">{text}</span>}
      </div>
    </div>
  )
}

function AgentBubble({ children, thinking }: { children?: React.ReactNode; thinking?: boolean }) {
  // Plain text on white — no bubble, no avatar (Claude / First Draft).
  return (
    <div className="cf-agent wfc-fade-up">
      {thinking ? (
        <div className="wfc-thinking-dots" role="status" aria-live="polite" aria-label="Agent is thinking"><span /><span /><span /></div>
      ) : children}
    </div>
  )
}

// ─── Thinking — one quiet line (Claude/First Draft "Thought for Ns"). ─────────
// While working: a single shimmering "Analyzing document" line, no bar/card.
// When done: collapses to "Analyzed · N steps"; click to reveal the plain steps.
function ThinkingBlock({ shown, done, progress, working, collapsed, onToggle }: {
  shown: Set<string>
  done: Set<string>
  progress: number
  working: boolean
  collapsed: boolean
  onToggle: () => void
}) {
  const open = !working && !collapsed
  return (
    <div className="cf-think wfc-fade-up">
      {working ? (
        <>
          <div className="cf-think-head">
            <span className="cf-think-live-label">Analyzing document…</span>
          </div>
          {/* Determinate progress — fixed-width track, only ever grows. */}
          <div className="cf-think-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Analysis progress">
            <div className="cf-think-fill" style={{ width: `${progress}%` }} />
          </div>
          {/* Steps stream in live: pending shows a spinner, resolved shows a check. */}
          <ul className="cf-think-steps">
            {ANALYZE_STEPS.filter((s) => shown.has(s.id)).map((s) => {
              const isDone = done.has(s.id)
              return (
                <li key={s.id} className={`cf-think-step cf-think-live ${isDone ? 'is-done' : 'is-active'}`}>
                  <span className="cf-think-step-mark" aria-hidden="true">
                    {isDone ? <Check size={11} strokeWidth={2.6} /> : <Loader2 size={11} strokeWidth={2.4} className="cf-spin" />}
                  </span>
                  <span className="cf-think-step-label">{s.label}</span>
                  {s.sub && <span className="cf-think-step-sub">{s.sub}</span>}
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <>
          <button type="button" className={`cf-think-head cf-think-toggle ${open ? 'is-open' : ''}`} onClick={onToggle} aria-expanded={open}>
            <span className="cf-think-chev" aria-hidden="true">▸</span>
            Analyzed
            <span className="cf-think-dot" aria-hidden="true">·</span>
            {ANALYZE_STEPS.length} steps
          </button>
          {open && (
            <ul className="cf-think-steps">
              {ANALYZE_STEPS.map((s) => (
                <li key={s.id} className="cf-think-step is-done">
                  <span className="cf-think-step-mark" aria-hidden="true"><Check size={11} strokeWidth={2.6} /></span>
                  <span className="cf-think-step-label">{s.label}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

// ─── Empty state — quiet mark, strong headline, ghost upload (composer leads) ──
function EmptyState({ onUpload, attached }: { onUpload: () => void; attached: boolean }) {
  return (
    <div className="cf-empty">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/paper-education.svg" alt="" width={54} height={54} className="cf-empty-mark cf-empty-reveal" />
      <h1 className="cf-empty-title cf-empty-reveal" style={{ animationDelay: '110ms' }}>
        Hi Sumit. What should we build?
      </h1>
      <p className="cf-empty-sub cf-empty-reveal" style={{ animationDelay: '210ms' }}>
        Describe it below, or{' '}
        <button type="button" onClick={attached ? undefined : onUpload} disabled={attached}
          className={`cf-empty-link ${attached ? 'is-attached' : ''}`}>
          {attached ? (<><Check size={12} strokeWidth={2.6} /> document attached</>) : 'upload a document'}
        </button>{' '}
        to turn into Flows, Articles, or Smart Tips.
      </p>
    </div>
  )
}

// ─── Clarifier — tabbed question card above the composer (Claude pattern) ─────
function ClarifierCard({ activeTab, setActiveTab, answers, onPick, onSubmit }: {
  activeTab: string
  setActiveTab: (id: string) => void
  answers: Record<string, string>
  onPick: (tabId: string, opt: string) => void
  onSubmit: () => void
}) {
  const tab = CLARIFY_TABS.find((t) => t.id === activeTab) ?? CLARIFY_TABS[0]
  const answeredCount = CLARIFY_TABS.filter((t) => answers[t.id]).length
  const allAnswered = answeredCount === CLARIFY_TABS.length
  const tabIdx = CLARIFY_TABS.findIndex((t) => t.id === tab.id)
  return (
    <div className="cf-clarify wfc-fade-up">
      {/* tabs — quiet text, a filled dot marks an answered tab (no checkmark) */}
      <div className="cf-clarify-tabs">
        {CLARIFY_TABS.map((t) => {
          const on = t.id === activeTab
          const done = !!answers[t.id]
          return (
            <button key={t.id} className={`cf-clarify-tab ${on ? 'is-active' : ''} ${done ? 'is-done' : ''}`} onClick={() => setActiveTab(t.id)}>
              <span className="cf-clarify-tab-dot" aria-hidden="true" />
              {t.label}
            </button>
          )
        })}
        <span className="cf-clarify-count">{tabIdx + 1}/{CLARIFY_TABS.length}</span>
      </div>

      {/* question */}
      <div className="cf-clarify-qrow">
        <span className="cf-clarify-q">{tab.question}</span>
      </div>

      {/* simple selectable rows — no number badge, no check on the row */}
      <div className="cf-clarify-rows">
        {tab.options.map((opt) => {
          const sel = answers[tab.id] === opt
          return (
            <button key={opt} className={`cf-clarify-row ${sel ? 'is-sel' : ''}`} aria-pressed={sel} onClick={() => onPick(tab.id, opt)}>
              <span className="cf-clarify-row-radio" aria-hidden="true" />
              <span className="cf-clarify-row-label">{opt}</span>
            </button>
          )
        })}
      </div>

      {/* footer — submit (active once all answered) */}
      <div className="cf-clarify-foot">
        <span className="cf-clarify-progress">{answeredCount} of {CLARIFY_TABS.length} answered</span>
        <button className="cf-clarify-submit" disabled={!allAnswered} onClick={onSubmit}>
          Submit <ArrowUp size={13} strokeWidth={2.6} />
        </button>
      </div>
    </div>
  )
}

// ─── Plan list (checkboxes mirroring the 4 experiences) ───────────────────────
function PlanList({ suggestions, phase, version, buildStatus, onToggle, onSelectAll, onItemClick, onRegenerate }: {
  suggestions: Suggestion[]
  phase: Phase
  version: number
  buildStatus: Record<string, 'queued' | 'building' | 'ready'>
  onToggle: (id: string) => void
  onSelectAll: () => void
  onItemClick: (s: Suggestion) => void
  onRegenerate: () => void
}) {
  const locked = phase === 'building' || phase === 'done'
  const allOn = suggestions.every((s) => s.checked)
  const [copied, setCopied] = useState(false)
  return (
    <div className="wfc-fade-up cf-plan-card">
      <div className="cf-plan-head">
        <span className="cf-plan-head-title">{suggestions.length} flows suggested</span>
        {version > 1 && <span className="cf-plan-head-version">v{version}</span>}
        <div className="cf-plan-head-actions">
          {!locked && (
            <>
              <button className="cf-plan-head-icon" title="Regenerate" aria-label="Regenerate plan" onClick={onRegenerate}>
                <RotateCw size={13} strokeWidth={1.9} />
              </button>
              <button className="cf-plan-head-icon" title={copied ? 'Copied' : 'Copy plan'} aria-label="Copy plan"
                onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1400) }}>
                {copied ? <Check size={13} strokeWidth={2.4} color="var(--wfc-build-done)" /> : <Copy size={13} strokeWidth={1.9} />}
              </button>
              <button className="cf-plan-selectall" onClick={onSelectAll}>{allOn ? 'Clear all' : 'Select all'}</button>
            </>
          )}
        </div>
      </div>
      <div>
        {suggestions.map((s) => {
          const status = buildStatus[s.id]
          return (
            <div key={s.id} className={`cf-plan-item ${!locked && s.checked ? 'is-selected' : ''}`} onClick={() => onItemClick(s)} style={{ cursor: locked ? 'default' : 'pointer' }}>
              {locked ? (
                <span className="cf-plan-mark">
                  {status === 'ready'
                    ? <span className="cf-plan-check-done"><Check size={11} strokeWidth={3} color="#fff" /></span>
                    : status === 'building'
                      ? <Loader2 size={14} strokeWidth={2.4} className="wfc-spin" style={{ color: ACCENT }} />
                      : <span className="cf-plan-check-empty" />}
                </span>
              ) : (
                <button className={`cf-plan-checkbox ${s.checked ? 'is-on' : ''}`} aria-label={s.checked ? `Uncheck ${s.title}` : `Check ${s.title}`} aria-pressed={s.checked}
                  onClick={(e) => { e.stopPropagation(); onToggle(s.id) }}>
                  {s.checked && <Check size={12} strokeWidth={3} color="#fff" />}
                </button>
              )}
              <span className="cf-plan-icon" aria-hidden="true">
                <TypeIcon type={s.type} />
              </span>
              <div className="cf-plan-body">
                <div className="cf-plan-row1">
                  <span className="cf-plan-title">{s.title}</span>
                  {locked && status === 'ready' && <span className="cf-plan-ready"><Check size={11} strokeWidth={3} />Ready</span>}
                  {locked && status === 'building' && <span className="cf-plan-generating">Generating…</span>}
                </div>
                <div className="cf-plan-meta">
                  <span className="cf-plan-type">{TYPE_LABEL[s.type]}</span>
                  <span className="cf-plan-dot" aria-hidden="true">·</span>
                  <span className="cf-plan-steps">{s.steps}</span>
                </div>
              </div>
              {!locked && <ChevronRight size={15} strokeWidth={1.8} className="cf-plan-chev" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DoneBubble({ count, onPreview }: { count: number; onPreview: () => void }) {
  return (
    <div className="cf-agent wfc-fade-up">
      <div className="cf-done">
        <div className="cf-done-head">
          <span className="cf-done-check"><Check size={11} strokeWidth={3} color="#fff" /></span>
          <span className="cf-done-title">{count} {count === 1 ? 'flow' : 'flows'} added to Mukul_SF_OOB</span>
        </div>
        <p className="cf-done-sub">All set. Your flows are live in the project. Preview them or keep refining in chat.</p>
        <button className="cf-done-cta" onClick={onPreview}>Preview all flows <ChevronRight size={13} strokeWidth={2} /></button>
      </div>
    </div>
  )
}

// ─── Build mini-control (ported from First Draft, local state) ────────────────
function BuildMiniControl({ paused, index, total, cardName, onPause, onResume, onTakeOver }: {
  paused: boolean
  index: number
  total: number
  cardName: string
  onPause: () => void
  onResume: () => void
  onTakeOver: () => void
}) {
  const progressPct = total > 0 ? ((index + (paused ? 0 : 0.5)) / total) * 100 : 0
  return (
    <div className="wfc-build-mini wfc-fade-up">
      <div className="wfc-build-mini-progress" aria-hidden="true">
        <div className="wfc-build-mini-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="wfc-build-mini-row">
        <div className="wfc-build-mini-left">
          <span className={`wfc-build-mini-spark ${!paused ? 'is-active' : ''}`} aria-hidden="true">
            {paused ? <Sparkles size={11} strokeWidth={2} /> : <Loader2 size={11} strokeWidth={2.2} className="wfc-spin" />}
          </span>
          <div className="wfc-build-mini-text">
            <div className="wfc-build-mini-status">{paused ? 'Paused' : 'Building'} · {Math.min(index + 1, total)} of {total}</div>
            {cardName && <div className="wfc-build-mini-subtitle">{cardName}</div>}
          </div>
        </div>
        <div className="wfc-build-mini-actions">
          {paused ? (
            <button type="button" className="wfc-build-mini-btn wfc-build-mini-btn-primary" onClick={onResume}>
              <Play size={11} strokeWidth={2} /> Resume
            </button>
          ) : (
            <button type="button" className="wfc-build-mini-btn" onClick={onPause}>
              <Pause size={11} strokeWidth={2} /> Pause
            </button>
          )}
          <button type="button" className="wfc-build-mini-btn" onClick={onTakeOver} title="Take over and stop building">
            <Hand size={11} strokeWidth={2} /> Take over
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── History slide-over (Grok-style, inside the 383px panel) ──────────────────
function HistoryPanel({ onClose, onPick }: { onClose: () => void; onPick: () => void }) {
  const [q, setQ] = useState('')
  const groups = HISTORY
    .map((g) => ({ ...g, items: g.items.filter((it) => it.title.toLowerCase().includes(q.trim().toLowerCase())) }))
    .filter((g) => g.items.length > 0)
  return (
    <>
      <div className="cf-backdrop-in" onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.18)', zIndex: 44, cursor: 'pointer' }} />
      <aside className="cf-history" role="dialog" aria-modal="true" aria-label="History">
        <div className="cf-history-head">
          <span className="cf-history-title">History</span>
          <button className="cf-history-close" onClick={onClose} title="Close" aria-label="Close">
            <X size={15} strokeWidth={2} />
          </button>
        </div>
        <div className="cf-history-search">
          <Search size={13} strokeWidth={1.9} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search history" aria-label="Search history" />
        </div>
        <div className="cf-history-list">
          {groups.length === 0 ? (
            <div className="cf-history-empty">No sessions match “{q}”.</div>
          ) : groups.map((g) => (
            <div key={g.group} className="cf-history-group">
              <div className="cf-history-group-label">{g.group}</div>
              {g.items.map((it) => (
                <button key={it.id} className="cf-history-item" onClick={() => { onClose(); onPick() }}>
                  <span className="cf-history-item-icon"><FileText size={13} strokeWidth={1.8} /></span>
                  <span className="cf-history-item-text">
                    <span className="cf-history-item-title">{it.title}</span>
                    <span className="cf-history-item-meta">{it.meta}</span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
        <button className="cf-history-new" onClick={() => { onClose(); onPick() }}>
          <SquarePen size={14} strokeWidth={1.9} /> New chat
        </button>
      </aside>
    </>
  )
}

// ─── Bottom drawer: PDF source (inside the panel) ─────────────────────────────
function PdfDrawer({ suggestion, onClose }: { suggestion: Suggestion; onClose: () => void }) {
  const h = HIGHLIGHTS[suggestion.id] ?? HIGHLIGHTS['popup-1']
  const heading = suggestion.section.replace(/^§[\d.]+\s*/, '')
  const num = suggestion.section.match(/^§([\d.]+)/)?.[1] ?? ''
  return (
    <>
      <div className="cf-backdrop-in" onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.18)', zIndex: 40, cursor: 'pointer' }} />
      <div className="cf-drawer-up"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 41, background: '#fff', borderRadius: '20px 20px 0 0', boxShadow: '0 -10px 40px rgba(15,23,42,0.18)', height: '56%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
          <div style={{ width: 34, height: 4, borderRadius: 999, background: '#E3E3EA' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px 12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1F1F32', letterSpacing: '-0.01em' }}>Source</div>
          </div>
          <a href={`${DOC.url}#page=${suggestion.page}`} target="_blank" rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: ACCENT, textDecoration: 'none', padding: '6px 8px', whiteSpace: 'nowrap', borderRadius: 7 }}>
            Open PDF <span aria-hidden>↗</span>
          </a>
          <button onClick={onClose} title="Close" style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: '#F4F3EF', color: '#525266', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 16px 10px' }}>
          <span style={{ width: 13, height: 13, borderRadius: 3, background: '#FFEAAF', border: '1px solid #F2D88A', flexShrink: 0 }} />
          <span style={{ fontSize: 11.5, color: '#8C899F' }}>Highlighted text is what this flow was drafted from.</span>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '4px 16px 22px', background: '#F4F4F7' }}>
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid var(--wfc-canvas-border)', padding: '26px 26px', boxShadow: '0 6px 20px rgba(15,23,42,0.07)' }}>
            <div style={{ fontSize: 10.5, color: '#B4B2A9', marginBottom: 16, textAlign: 'right', fontFamily: MONO }}>Procure-to-Pay SOP · {suggestion.page} / {DOC.pages}</div>
            <h4 style={{ margin: '0 0 13px', fontSize: 15, fontWeight: 700, color: '#1F1F32', letterSpacing: '-0.01em' }}>
              <span style={{ color: ACCENT, marginRight: 8 }}>{num}</span>{heading}
            </h4>

            {/* First paragraph + key sentence — fully highlighted as the source */}
            <p style={{ margin: '0 0 13px', fontSize: 12.5, lineHeight: 1.8, color: '#2A2A38' }}>
              <mark className="cf-source-mark">{h.lead} {h.mark}</mark>
            </p>
            {/* Second highlighted paragraph */}
            <p style={{ margin: '0 0 13px', fontSize: 12.5, lineHeight: 1.8, color: '#2A2A38' }}>
              <mark className="cf-source-mark">{h.tail} The requestor completes each required field before the record can advance to the next stage.</mark>
            </p>

            {/* Surrounding un-highlighted context so the highlight stands out */}
            <p style={{ margin: '0 0 13px', fontSize: 12.5, lineHeight: 1.8, color: '#6B697B' }}>
              To complete this step, the responsible role opens the Procurement portal and works through the fields in order. Each entry is validated as it is captured, and the record cannot advance until every required field is present.
            </p>
            <ol style={{ margin: '0 0 4px', paddingLeft: 18, fontSize: 12.5, lineHeight: 1.9, color: '#6B697B' }}>
              <li>Open the relevant record in the Procurement portal.</li>
              <li>Confirm the cost center and supplier details.</li>
              <li>Review the auto-calculated totals against the quote.</li>
              <li>Submit for the next stage in the workflow.</li>
            </ol>
            <p style={{ margin: '14px 0 0', fontSize: 12.5, lineHeight: 1.8, color: '#6B697B' }}>
              Requisitions without a valid cost center are returned automatically. The approval trail is retained for audit and can be exported from Reports → Approvals at any time.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
