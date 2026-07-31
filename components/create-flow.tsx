'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowUp, Plus, Mic, Square, Check, FileText, X, Loader2, ChevronRight, ChevronLeft, ChevronDown,
  LayoutTemplate, Route, Lightbulb, SquarePen, History, Search, RotateCw,
  Pause, Sparkles, AlertCircle, Paperclip, MoreVertical, Signpost, Flag,
} from 'lucide-react'
import { ExpandedPreview } from './firstdraft/_components/expanded-preview'
import { ANCHORS } from './firstdraft/_components/flow-preview'
import { FLOW_STEPS } from './firstdraft/_state/mock-data'
import type { JourneyCard } from './firstdraft/_state/types'
import { onChatRefine, type RefineRequest } from './firstdraft/_state/edit-bus'
import { publishBuild, onBuildStop } from './firstdraft/_state/build-bus'

// First Draft palette (verbatim): cream canvas, white rail, blue accent.
const ACCENT = '#0975D7'

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

// Bulk upload (MVP): up to 6 documents per draft. Each click on Upload pulls
// the next file from this pool — the demo needs no real file dialog.
const MAX_FILES = 6
interface MockFile { name: string; type: 'PDF' | 'DOCX'; size: string }
const MOCK_FILES: MockFile[] = [
  { name: 'Procure-to-Pay SOP.pdf',           type: 'PDF',  size: '1.4 MB' },
  { name: 'Vendor Onboarding Guide.docx',     type: 'DOCX', size: '860 KB' },
  { name: 'Expense Policy 2026.pdf',          type: 'PDF',  size: '620 KB' },
  { name: 'Invoice Processing Manual.pdf',    type: 'PDF',  size: '2.1 MB' },
  { name: 'Contract Approval Playbook.docx',  type: 'DOCX', size: '1.1 MB' },
  { name: 'Procurement FAQ.pdf',              type: 'PDF',  size: '480 KB' },
]

type Phase = 'empty' | 'attached' | 'thinking' | 'clarifying' | 'working' | 'plan' | 'building' | 'done'

// Clarifier — two simple questions (Claude / First Draft pattern). Everything
// always builds at once; no build-order question.
interface ClarifyTab { id: string; label: string; question: string; options: string[] }
const CLARIFY_TABS: ClarifyTab[] = [
  { id: 'persona', label: 'Audience',  question: 'Who is the target audience?',      options: ['Requesters', 'Approvers', 'Procurement team', 'Everyone'] },
  { id: 'goal',    label: 'Objective', question: 'What are you trying to achieve?',  options: ['Onboard new users', 'Reduce errors', 'Speed up the process', 'Drive adoption'] },
]

// Document-to-flows: every suggestion is a Flow, tied to the source document
// it was drafted from. Uploading a subset of documents narrows the plan.
interface Suggestion {
  id: string
  type: 'POP-UP' | 'FLOW' | 'SMART TIP' | 'ARTICLE'
  title: string
  steps: string
  section: string
  page: number
  file: string
  checked: boolean
}
const SUGGESTIONS: Suggestion[] = [
  { id: 'flow-1',  type: 'FLOW', title: 'Raise a Purchase Requisition',    steps: '5 steps',  section: 'Raising a Requisition', page: 2, file: 'Procure-to-Pay SOP.pdf',          checked: true },
  { id: 'flow-2',  type: 'FLOW', title: 'Configure Approval Bot',          steps: '12 steps', section: 'Approval Matrix',       page: 3, file: 'Procure-to-Pay SOP.pdf',          checked: true },
  { id: 'flow-3',  type: 'FLOW', title: 'Generate a Purchase Order',       steps: '4 steps',  section: 'PO Generation',         page: 4, file: 'Procure-to-Pay SOP.pdf',          checked: true },
  { id: 'flow-4',  type: 'FLOW', title: 'Complete a Three-Way Match',      steps: '9 steps',  section: 'Three-Way Match',       page: 5, file: 'Procure-to-Pay SOP.pdf',          checked: false },
  { id: 'flow-5',  type: 'FLOW', title: 'Register a New Vendor',           steps: '7 steps',  section: 'Vendor Registration',   page: 1, file: 'Vendor Onboarding Guide.docx',    checked: true },
  { id: 'flow-6',  type: 'FLOW', title: 'Verify Vendor Bank Details',      steps: '5 steps',  section: 'Bank Verification',     page: 3, file: 'Vendor Onboarding Guide.docx',    checked: true },
  { id: 'flow-7',  type: 'FLOW', title: 'Submit an Expense Report',        steps: '6 steps',  section: 'Submitting Expenses',   page: 2, file: 'Expense Policy 2026.pdf',         checked: true },
  { id: 'flow-8',  type: 'FLOW', title: 'Approve Team Expenses',           steps: '4 steps',  section: 'Manager Approvals',     page: 4, file: 'Expense Policy 2026.pdf',         checked: false },
  { id: 'flow-9',  type: 'FLOW', title: 'Process a Supplier Invoice',      steps: '8 steps',  section: 'Invoice Intake',        page: 2, file: 'Invoice Processing Manual.pdf',   checked: true },
  { id: 'flow-10', type: 'FLOW', title: 'Route a Contract for Signature',  steps: '6 steps',  section: 'Signature Routing',     page: 6, file: 'Contract Approval Playbook.docx', checked: true },
]

// Canvas card-type (lowercase, from edit-bus) → our Suggestion type tokens.
const REFINE_TYPE: Record<RefineRequest['cardType'], Suggestion['type']> = {
  popup: 'POP-UP', flow: 'FLOW', smarttip: 'SMART TIP', article: 'ARTICLE',
}

// Per-flow step outlines. Expanding a plan row shows the actual steps the agent
// drafted for *that* flow — not a generic placeholder list. Each entry matches
// its suggestion's "N steps" count so the preview never contradicts the label.
interface OutlineStep { title: string; body: string }
const FLOW_OUTLINES: Record<string, OutlineStep[]> = {
  'flow-1': [
    { title: 'Open the Procurement workspace', body: 'Find it under the Apps menu, or search “Procurement” in the top bar.' },
    { title: 'Start a new requisition', body: 'Click New Requisition. A draft is created and saved automatically.' },
    { title: 'Add line items and quantities', body: 'Search the catalogue or enter a free-text item. Add one row per item.' },
    { title: 'Select the cost centre and budget code', body: 'Pick the cost centre that owns this spend. The budget code auto-fills.' },
    { title: 'Submit for approval', body: 'Routing is based on the total amount and your cost centre.' },
  ],
  'flow-2': [
    { title: 'Open Setup and find Approval Bot', body: 'Click the gear icon, then search “Approval Bot” in Quick Find.' },
    { title: 'Enable Approval Bot for the org', body: 'Flip the master toggle. You can disable it again at any time.' },
    { title: 'Choose how rules cascade', body: 'Decide whether rules apply by amount, by team, or by deal type.' },
    { title: 'Set the approval threshold', body: 'Requests above this amount require approval. Default is $50,000.' },
    { title: 'Assign first-tier approvers', body: 'Pick the user or role that reviews standard requests.' },
    { title: 'Add second-tier approvers', body: 'Anything above the first tier’s limit escalates to this group.' },
    { title: 'Set escalation timing', body: 'If an approver does not respond in this window, Bot escalates.' },
    { title: 'Add a fallback approver', body: 'Used when everyone in the primary chain is unavailable.' },
    { title: 'Configure Slack notifications', body: 'Choose which approvers get pinged, and in which channel.' },
    { title: 'Configure email notifications', body: 'Set the digest frequency and who is copied.' },
    { title: 'Run a test approval', body: 'Submit a dummy request to confirm routing lands where you expect.' },
    { title: 'Activate the rule set', body: 'Publish the configuration. Live requests start routing immediately.' },
  ],
  'flow-3': [
    { title: 'Open the approved requisition', body: 'Find it in the Approved queue, or open it from the email link.' },
    { title: 'Convert it to a purchase order', body: 'Click Convert to PO. Line items carry over unchanged.' },
    { title: 'Confirm vendor and delivery terms', body: 'Check the vendor record, delivery date, and payment terms.' },
    { title: 'Issue the PO to the vendor', body: 'Sends the PO by email and marks the requisition closed.' },
  ],
  'flow-4': [
    { title: 'Open the invoice awaiting match', body: 'Invoices needing a match sit in the Exceptions queue.' },
    { title: 'Pull up the linked purchase order', body: 'The PO number is on the invoice header. Open it side by side.' },
    { title: 'Pull up the goods receipt note', body: 'Confirm the goods were received and by whom.' },
    { title: 'Compare quantities across all three', body: 'Quantities on the invoice, PO, and receipt must agree.' },
    { title: 'Compare unit prices across all three', body: 'Check unit price and any agreed discount.' },
    { title: 'Flag any variance above tolerance', body: 'Default tolerance is 2% or $100, whichever is lower.' },
    { title: 'Add a resolution note', body: 'Explain what you checked and what you decided.' },
    { title: 'Route exceptions to Procurement', body: 'Anything outside tolerance goes to the Procurement queue.' },
    { title: 'Mark the match complete', body: 'Releases the invoice for payment.' },
  ],
  'flow-5': [
    { title: 'Open Vendor Management', body: 'Found under Procurement, or search “Vendors”.' },
    { title: 'Start a new vendor record', body: 'Click New Vendor and choose the vendor type.' },
    { title: 'Enter legal name and tax details', body: 'Use the registered legal name, not a trading name.' },
    { title: 'Upload compliance documents', body: 'W-9 or local equivalent, plus insurance certificates.' },
    { title: 'Assign the vendor category', body: 'Category drives approval routing and payment terms.' },
    { title: 'Set payment terms', body: 'Default is Net 30. Anything else needs Finance approval.' },
    { title: 'Submit for Procurement review', body: 'Procurement verifies the details before the vendor goes live.' },
  ],
  'flow-6': [
    { title: 'Open the vendor record', body: 'Search by vendor name or vendor ID.' },
    { title: 'Go to the Banking tab', body: 'Bank details are separated from the main record for security.' },
    { title: 'Enter account and routing details', body: 'Double-check every digit. Errors here delay payment.' },
    { title: 'Upload the bank confirmation letter', body: 'Must be on the bank letterhead and dated within 90 days.' },
    { title: 'Trigger the verification check', body: 'A micro-deposit is sent. Confirmation usually takes 1–2 days.' },
  ],
  'flow-7': [
    { title: 'Open Expenses and start a report', body: 'Click New Report and give it a name you will recognise later.' },
    { title: 'Add each expense line', body: 'Enter the date, amount, and category for every expense.' },
    { title: 'Attach receipts to every line', body: 'Anything above $25 needs a receipt image.' },
    { title: 'Select the project or cost centre', body: 'This determines which budget the expense lands against.' },
    { title: 'Review the policy warnings', body: 'Amber flags are advisory; red flags block submission.' },
    { title: 'Submit to your manager', body: 'Your manager gets a notification and can approve from email.' },
  ],
  'flow-8': [
    { title: 'Open the approvals queue', body: 'Pending reports are sorted oldest first.' },
    { title: 'Review the report and receipts', body: 'Click any line to see its attached receipt full size.' },
    { title: 'Check the lines flagged by policy', body: 'Flagged lines are highlighted at the top of the report.' },
    { title: 'Approve, or return with a comment', body: 'Returning sends it back to the submitter with your note.' },
  ],
  'flow-9': [
    { title: 'Open the invoice intake queue', body: 'New invoices arrive by email or supplier portal.' },
    { title: 'Verify the vendor and invoice number', body: 'Confirm the vendor is active and the number is not reused.' },
    { title: 'Match the invoice to its PO', body: 'Enter the PO number, or let Bot suggest a match.' },
    { title: 'Confirm the tax treatment', body: 'Check the tax code matches the vendor registration.' },
    { title: 'Check for duplicate submissions', body: 'Bot flags likely duplicates by amount and date.' },
    { title: 'Code the invoice to a GL account', body: 'The PO coding pre-fills; override only if needed.' },
    { title: 'Route it for payment approval', body: 'Routing follows the approval matrix for the amount.' },
    { title: 'Schedule it in the payment run', body: 'Choose the next run, or hold for a specific date.' },
  ],
  'flow-10': [
    { title: 'Open the finalised contract', body: 'Only contracts marked Final can be routed for signature.' },
    { title: 'Confirm the signatory list', body: 'Check names, titles, and email addresses for every party.' },
    { title: 'Set the signing order', body: 'Sequential for counter-signatures, parallel when order does not matter.' },
    { title: 'Add the compliance reviewer', body: 'Legal reviews before the contract leaves your organisation.' },
    { title: 'Send for e-signature', body: 'Each signer gets a unique link. Reminders go out every 3 days.' },
    { title: 'Track status until fully signed', body: 'The record updates as each party signs.' },
  ],
}

// Fall back to the generic step list if a suggestion has no bespoke outline.
function outlineFor(s: Suggestion): OutlineStep[] {
  const custom = FLOW_OUTLINES[s.id]
  if (custom) return custom
  const n = parseInt(s.steps, 10) || FLOW_STEPS.length
  return Array.from({ length: n }, (_, i) => {
    const f = FLOW_STEPS[i % FLOW_STEPS.length]
    return { title: f.title, body: f.body }
  })
}

// Starter prompts on the landing — one tap fills the composer.
const STARTERS: { label: string; Icon: typeof FileText }[] = [
  { label: 'Analyze these documents', Icon: FileText },
  { label: 'Create a flow',           Icon: Route },
  { label: 'Propose a plan',          Icon: Sparkles },
]

// "Procure-to-Pay SOP.pdf" → "Procure-to-Pay SOP" for tight meta rows.
const baseName = (f: string) => f.replace(/\.(pdf|docx|pptx)$/i, '')

// Build a flow-type JourneyCard for the review view, titled with the clicked
// suggestion. Step count is sliced to match the row's "N steps" label.
function flowCardFor(s: Suggestion): Extract<JourneyCard, { type: 'flow' }> {
  // Titles come from the flow's own outline so the review list reads as the
  // same flow the user expanded in the plan; anchors/body cycle the mock set.
  // Take ONLY anchor geometry from the mock. Title and body come from this
  // flow's own outline — previously body/anchorLabel were inherited wholesale,
  // so "Start a new requisition" carried an Approval-Bot description.
  const steps = outlineFor(s).map((st, i) => ({
    anchor: FLOW_STEPS[i % FLOW_STEPS.length].anchor,
    anchorLabel: FLOW_STEPS[i % FLOW_STEPS.length].anchorLabel,
    num: i + 1,
    title: st.title,
    body: st.body,
  }))
  return { id: s.id, type: 'flow', title: s.title, confidence: 'high', steps, audience: 'Profile = System Administrator' }
}

// Content-type icons (same set as the preview canvas).
function TypeIcon({ type }: { type: Suggestion['type'] }) {
  const props = { size: 15, strokeWidth: 1.9 as const }
  if (type === 'POP-UP') return <LayoutTemplate {...props} />
  if (type === 'FLOW') return <Route {...props} />
  if (type === 'SMART TIP') return <Lightbulb {...props} />
  return <FileText {...props} />
}

// Chain-of-thought steps — short, unhurried lines. No cramped sub-text; the
// slow reveal is what sells "it is actually reading all of this".
interface AnalyzeStep { id: string; label: string }
function analyzeStepsFor(fileList: MockFile[], flowCount: number): AnalyzeStep[] {
  const n = fileList.length
  return [
    { id: 'a1', label: `Reading ${n} ${n === 1 ? 'document' : 'documents'}` },
    { id: 'a2', label: 'Extracting sections and procedures' },
    { id: 'a3', label: 'Identifying step-by-step processes' },
    { id: 'a4', label: 'Matching processes to flows' },
    { id: 'a5', label: `Drafting ${flowCount} ${flowCount === 1 ? 'flow' : 'flows'}` },
  ]
}

// Conversational build log — the agent narrates the build in the thread.
// Each flow contributes exactly two entries: a 'thought' (the collapsible
// thinking line) and a 'tile' (its card). 'agent' is reserved for the few
// moments that genuinely need prose — the build opener and the one mid-build
// question — not per-flow narration.
type BuildLogEntry =
  | { kind: 'agent'; id: string; text: string }
  | { kind: 'user'; id: string; text: string }
  | { kind: 'thinking'; id: string }
  | { kind: 'thought'; id: string; sug: Suggestion; lead?: string }
  | { kind: 'tile'; id: string; sug: Suggestion }
  /** A stop, marked in place. The log is NEVER cleared on interrupt — the work
   *  already done stays on screen and the build resumes from this point. */
  | { kind: 'interrupted'; id: string; remaining: number }

// Mid-build clarifier about a specific flow (asked once, before flow #2).
// Tabbed like the opening clarifier so one interruption covers both questions
// instead of stopping the build twice.
interface MidQTab { id: string; label: string; question: string; options: string[] }
interface MidQuestion { sug: Suggestion; tabs: MidQTab[] }

// The two things worth asking before drafting a flow: who reads it, and how
// much hand-holding each step needs.
const MIDQ_TABS: MidQTab[] = [
  { id: 'audience', label: 'Audience', question: 'Who is the target audience for this flow?', options: ['System administrators', 'Approvers and managers', 'All end users'] },
  { id: 'depth',    label: 'Detail',   question: 'How much detail should each step carry?',   options: ['Brief — one line per step', 'Standard — a line plus context', 'Thorough — include edge cases'] },
]


export function CreateFlow() {
  const [phase, setPhase] = useState<Phase>('empty')
  const [prompt, setPrompt] = useState('')
  const [command, setCommand] = useState('')
  // Bulk upload: files staged in the composer, then the set that was sent.
  const [files, setFiles] = useState<MockFile[]>([])
  const [sentFiles, setSentFiles] = useState<MockFile[]>([])
  const [limitHit, setLimitHit] = useState(false)
  const [analyzeSteps, setAnalyzeSteps] = useState<AnalyzeStep[]>(analyzeStepsFor(MOCK_FILES.slice(0, 1), 4))
  const [analyzeShown, setAnalyzeShown] = useState<Set<string>>(new Set())
  const [analyzeDone, setAnalyzeDone] = useState<Set<string>>(new Set())
  const [progress, setProgress] = useState(0)
  const [thinking, setThinking] = useState(false)
  const [thoughtCollapsed, setThoughtCollapsed] = useState(false)
  // Clarifier state
  const [clarifyTab, setClarifyTab] = useState('persona')
  const [clarifyAnswers, setClarifyAnswers] = useState<Record<string, string>>({})
  const [clarifyReply, setClarifyReply] = useState('')
  const [clarifyCardOpen, setClarifyCardOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [attachMenuOpen, setAttachMenuOpen] = useState(false)
  // Living plan: each refinement posts a turn + bumps the version.
  const [planVersion, setPlanVersion] = useState(1)
  const [refineTurns, setRefineTurns] = useState<{ id: string; text: string; version: number }[]>([])
  const [planRefining, setPlanRefining] = useState(false)
  // The plan card collapses to a slim header once the build starts, so the
  // live build activity gets the space. Expandable any time (accordion).
  const [planCollapsed, setPlanCollapsed] = useState(false)
  // Build state — sequential, Claude-style: message → thought → tile.
  const [buildPhase, setBuildPhase] = useState<'idle' | 'building' | 'paused'>('idle')
  const [buildIndex, setBuildIndex] = useState(0)
  const buildIndexRef = useRef(0)
  const buildQueueRef = useRef<Suggestion[]>([])
  const buildTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Conversational build: narrated log + one mid-build question.
  const [buildLog, setBuildLog] = useState<BuildLogEntry[]>([])
  const [midQ, setMidQ] = useState<MidQuestion | null>(null)
  const midQAskedRef = useRef(false)
  // A stopped build waiting to be resumed. Keeps phase === 'building' so the
  // log stays on screen; only the ticking stops.
  const [buildInterrupted, setBuildInterrupted] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>(SUGGESTIONS)
  const [buildStatus, setBuildStatus] = useState<Record<string, 'queued' | 'building' | 'ready'>>({})
  // Preview popup is HIDDEN in the MVP (kept intact for when preview returns).
  const [previewFlow, setPreviewFlow] = useState<Suggestion | null>(null)
  // MVP review: clicking a built flow opens the Flows step-list view in the
  // panel; clicking a step previews it on the page (left free-zone).
  const [reviewFlow, setReviewFlow] = useState<Suggestion | null>(null)
  const [reviewStep, setReviewStep] = useState<number | null>(null)
  // Scoped refine: composer pill targeting one card.
  const [refineScope, setRefineScope] = useState<RefineRequest | null>(null)
  // Plan rows the user has expanded to read the step outline. Independent of
  // selection — peeking at a flow's steps must not check or uncheck it.
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const threadRef = useRef<HTMLDivElement | null>(null)
  const composerRef = useRef<HTMLTextAreaElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // Flow "Edit" (Pencil) → scope the composer to that flow; popup stays open.
  useEffect(() => onChatRefine((req) => {
    setRefineScope(req)
    setTimeout(() => composerRef.current?.focus(), 60)
  }), [])

  const checked = suggestions.filter((s) => s.checked)

  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [phase, command, analyzeShown.size, analyzeDone.size, thinking, buildLog.length, midQ, buildIndex])

  // Clarifier keyboard shortcuts.
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

  // Close overlays on Escape (step preview → review → history → popup).
  useEffect(() => {
    if (reviewStep === null && !reviewFlow && !previewFlow && !historyOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (reviewStep !== null) setReviewStep(null)
      else if (reviewFlow) { setReviewFlow(null); setReviewStep(null) }
      else if (historyOpen) setHistoryOpen(false)
      else if (previewFlow) setPreviewFlow(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reviewStep, reviewFlow, previewFlow, historyOpen])

  useEffect(() => {
    const ta = composerRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 190)}px`
  }, [prompt])

  const reset = () => {
    timers.current.forEach(clearTimeout); timers.current = []
    setPhase('empty'); setPrompt(''); setCommand('')
    setFiles([]); setSentFiles([]); setLimitHit(false)
    setAnalyzeShown(new Set()); setAnalyzeDone(new Set()); setProgress(0); setThinking(false); setThoughtCollapsed(false)
    setSuggestions(SUGGESTIONS); setBuildStatus({}); setPreviewFlow(null); setExpandedRows(new Set())
    setReviewFlow(null); setReviewStep(null)
    setClarifyTab('persona'); setClarifyAnswers({}); setClarifyReply(''); setClarifyCardOpen(false); setToast(null)
    setHistoryOpen(false); setAttachMenuOpen(false); setPlanVersion(1); setRefineTurns([]); setPlanRefining(false)
    setPlanCollapsed(false); setBuildLog([]); setMidQ(null); midQAskedRef.current = false
    setBuildPhase('idle'); setBuildIndex(0); buildIndexRef.current = 0; setBuildInterrupted(false)
    if (buildTimerRef.current) clearTimeout(buildTimerRef.current)
    publishBuild({ active: false, title: '' })
  }

  // Stage the next mock file in the composer. Quiet on success — the file
  // appearing in the composer IS the feedback. The 7th attempt surfaces the
  // limit notice instead.
  const addFile = () => {
    if (files.length >= MAX_FILES) { setLimitHit(true); return }
    setFiles((prev) => [...prev, MOCK_FILES[prev.length]])
    setLimitHit(false)
    if (phase === 'empty') setPhase('attached')
    setTimeout(() => composerRef.current?.focus(), 60)
  }

  const removeFile = (name: string) => {
    setFiles((prev) => {
      const next = prev.filter((f) => f.name !== name)
      if (next.length === 0 && phase === 'attached') setPhase('empty')
      return next
    })
    setLimitHit(false)
  }

  // Send only fires on Enter / send button. Requires at least one document.
  const submit = () => {
    if (phase === 'working') return
    if (phase === 'building') {
      const t = prompt.trim()
      if (!t) return
      pushLog({ kind: 'user', text: t })
      setPrompt('')
      // While interrupted, "continue" (and friends) resume the queue instead
      // of being filed as a note — the user is answering the divider's CTA.
      if (buildInterrupted && /^(continue|resume|carry on|keep going|go on|proceed)\b/i.test(t)) {
        resumeBuild()
        return
      }
      pushLog({ kind: 'agent', text: buildInterrupted
        ? 'Noted. Say “continue” whenever you want me to pick up the rest.'
        : 'Noted. I will fold that in as I build.' })
      return
    }
    if (phase === 'done') {
      // Post-build follow-ups get a real reply instead of vanishing.
      const t = prompt.trim()
      if (!t) return
      pushLog({ kind: 'user', text: t })
      pushLog({ kind: 'agent', text: 'Got it. Open the flow and use Rewrite steps, or tell me which flow to change and I will redraft it.' })
      setPrompt('')
      return
    }
    if (files.length === 0 && phase !== 'plan') { addFile(); return }
    if (phase !== 'attached' && phase !== 'plan') return
    if (phase === 'attached') {
      const text = prompt.trim() || `Analyze ${files.length === 1 ? 'this document' : 'these documents'} and convert them into flows.`
      const narrowed = SUGGESTIONS.filter((s) => files.some((f) => f.name === s.file))
      const plan = narrowed.length > 0 ? narrowed : SUGGESTIONS
      setCommand(text)
      setPrompt('')
      setSentFiles(files)
      setSuggestions(plan)
      setAnalyzeSteps(analyzeStepsFor(files, plan.length))
      setFiles([])
      setLimitHit(false)
      askClarify()
    } else if (phase === 'plan') {
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

  // Step 1: read the documents FIRST, then ask. An agent that asks before it
  // has looked at anything is guessing at what to ask; the questions only earn
  // their place once the analysis has surfaced what's ambiguous.
  const askClarify = () => {
    setPhase('thinking')
    setThinking(true)
    setClarifyCardOpen(false)
    // Short "on it" beat, then the analysis runs and hands off to the clarifier.
    timers.current.push(setTimeout(() => {
      setThinking(false)
      startAnalysis()
    }, 1300))
  }

  // After the analysis lands, the agent has something concrete to ask about.
  const openClarifier = () => {
    setPhase('clarifying')
    setThinking(true)
    // A beat of thinking before the question — the agent is composing what to
    // ask, not firing a pre-written form the instant analysis stops.
    timers.current.push(setTimeout(() => setThinking(false), 900))
    timers.current.push(setTimeout(() => setClarifyCardOpen(true), 900 + 550))
  }

  // Pick an answer for a tab, then auto-advance to the next unanswered tab.
  const pickClarify = (tabId: string, opt: string) => {
    setClarifyAnswers((p) => ({ ...p, [tabId]: opt }))
    const idx = CLARIFY_TABS.findIndex((t) => t.id === tabId)
    const next = CLARIFY_TABS[idx + 1]
    if (next && !clarifyAnswers[next.id]) setTimeout(() => setClarifyTab(next.id), 220)
  }

  // Step 3: the user answers → the plan (already drafted during analysis) lands.
  const submitClarify = () => {
    const parts = CLARIFY_TABS.map((t) => clarifyAnswers[t.id]).filter(Boolean)
    if (parts.length === 0) return
    setClarifyReply(parts.join(' · '))
    setClarifyCardOpen(false)
    setPrompt('')
    setPhase('working')
    setThinking(true)
    // Short beat applying the answers, then the plan appears.
    timers.current.push(setTimeout(() => {
      setThinking(false)
      setPhase('plan')
    }, 1500))
  }

  // Step 2: the visible analysis pass — reads the documents, then hands off to
  // the clarifier with something concrete to ask about.
  const startAnalysis = () => {
    setPhase('working')
    setThoughtCollapsed(false)
    setAnalyzeShown(new Set()); setAnalyzeDone(new Set()); setProgress(10)

    const STEP = 1400, RESOLVE = 950
    const PCTS = [25, 45, 62, 78, 90]
    analyzeSteps.forEach((s, i) => {
      timers.current.push(setTimeout(() => setAnalyzeShown((p) => new Set(p).add(s.id)), i * STEP))
      timers.current.push(setTimeout(() => {
        setAnalyzeDone((p) => new Set(p).add(s.id))
        setProgress(PCTS[i] ?? 90)
      }, i * STEP + RESOLVE))
    })
    const total = analyzeSteps.length * STEP + 400
    timers.current.push(setTimeout(() => { setProgress(100); setThoughtCollapsed(true) }, total))
    timers.current.push(setTimeout(openClarifier, total + 520))
  }

  const toggle = (id: string) => setSuggestions((p) => p.map((s) => s.id === id ? { ...s, checked: !s.checked } : s))
  const toggleExpanded = (id: string) => setExpandedRows((p) => {
    const next = new Set(p)
    if (next.has(id)) next.delete(id); else next.add(id)
    return next
  })
  const selectAll = () => { const allOn = suggestions.every((s) => s.checked); setSuggestions((p) => p.map((s) => ({ ...s, checked: !allOn }))) }

  const pushLog = (entry: BuildLogEntry extends infer T ? T extends { id: string } ? Omit<T, 'id'> : never : never) => {
    setBuildLog((p) => [...p, { ...entry, id: `bl-${p.length}-${Date.now() % 100000}` } as BuildLogEntry])
  }

  // ── Build orchestration — sequential and conversational (Claude-style):
  //    message → visible thought → (sometimes a question) → artifact tile. ────
  const BUILD_THOUGHT = 3600   // how long each flow "thinks" while drafting
  const BUILD_LEAD = 900       // message lands, then the thought starts

  const finishBuild = (n: number) => {
    setPhase('done')
    setBuildPhase('idle')
    publishBuild({ active: false, title: '' })
    setToast(`${n} ${n === 1 ? 'flow' : 'flows'} added to Mukul_SF_OOB`)
    timers.current.push(setTimeout(() => setToast(null), 3600))
  }

  // Drafts flow `i` as exactly TWO blocks: a thinking line and its card.
  //
  // Everything else the build used to emit — a section heading, a narration
  // bubble, a separate thought block, a separate tile — has been folded into
  // these two. At 10 flows the old shape produced ~50 blocks of chat that all
  // said roughly the same thing; this produces 20, and half of them are
  // one-line summaries. The reasoning is not lost, only collapsed: the
  // thinking line stays expandable after it resolves.
  const buildTick = (lead?: string, opts?: { skipSection?: boolean }) => {
    const queue = buildQueueRef.current
    const i = buildIndexRef.current
    if (i >= queue.length) { finishBuild(queue.length); return }
    const s = queue[i]

    // 1. The thinking line + its card land together and stay paired.
    setBuildStatus((p) => ({ ...p, [s.id]: 'building' }))
    publishBuild({ active: true, title: s.title })
    pushLog({ kind: 'thought', sug: s, lead })
    pushLog({ kind: 'tile', sug: s })

    buildTimerRef.current = setTimeout(() => {
      // 2. The card resolves to Ready; its thinking line collapses to one
      //    quiet, still-expandable summary.
      setBuildStatus((p) => ({ ...p, [s.id]: 'ready' }))
      buildIndexRef.current = i + 1
      setBuildIndex(i + 1)
      if (i + 1 >= queue.length) { finishBuild(queue.length); return }

      // 3. One mid-build question, after flow 1 lands.
      if (i === 0 && !midQAskedRef.current) {
        midQAskedRef.current = true
        buildTimerRef.current = setTimeout(openQuestioningSection, 700)
        return
      }
      buildTimerRef.current = setTimeout(() => buildTick(), 700)
    }, BUILD_THOUGHT)
  }

  // Opens the next flow's chapter and asks its questions INSIDE it. The
  // heading, the "here's what I'm looking at" line, and a visible thinking
  // beat all land before the card appears — so the question reads as something
  // the agent arrived at after looking, not a form fired on a timer.
  const openQuestioningSection = () => {
    const queue = buildQueueRef.current
    const i = buildIndexRef.current
    if (i >= queue.length) { finishBuild(queue.length); return }
    const s = queue[i]

    setBuildPhase('paused')
    publishBuild({ active: true, title: s.title, paused: true })

    // One line naming the flow and why it needs input — the only prose the
    // build emits, and it earns its place by explaining an interruption.
    pushLog({ kind: 'agent', text: `Before I draft “${s.title}” — ${s.steps} from ${s.section} — it reads differently depending on who runs it.` })

    // A visible thinking beat, then the question docks above the composer.
    buildTimerRef.current = setTimeout(() => {
      pushLog({ kind: 'thinking' })
      buildTimerRef.current = setTimeout(() => {
        setBuildLog((p) => p.filter((e) => e.kind !== 'thinking'))
        setMidQ({ sug: s, tabs: MIDQ_TABS })
      }, 1600)
    }, 1100)
  }

  const startBuilding = () => {
    if (checked.length === 0) return
    setPhase('building')
    setBuildPhase('building')
    setBuildInterrupted(false)
    setPlanCollapsed(true)   // accordion: the plan folds so the build takes the stage
    midQAskedRef.current = checked.length < 2   // only ask with 2+ flows queued
    setBuildLog([])
    buildQueueRef.current = checked
    buildIndexRef.current = 0
    setBuildIndex(0)
    const init: Record<string, 'queued' | 'building' | 'ready'> = {}
    checked.forEach((s) => { init[s.id] = 'queued' })
    setBuildStatus(init)
    pushLog({ kind: 'agent', text: `Okay, starting to build ${checked.length} ${checked.length === 1 ? 'flow' : 'flows'}. They will land in Mukul_SF_OOB as each one finishes.` })
    buildTimerRef.current = setTimeout(buildTick, 800)
  }

  // Both mid-build answers arrive together. They post as one user turn, then
  // the next flow's section opens with a lead that reflects what was chosen —
  // so the answer visibly changes what the agent does next.
  const answerMidQ = (answers: Record<string, string>) => {
    if (!midQ) return
    const audience = answers.audience ?? ''
    const depth = answers.depth ?? ''
    pushLog({ kind: 'user', text: midQ.tabs.map((t) => answers[t.id]).filter(Boolean).join(' · ') })
    setMidQ(null)
    setBuildPhase('building')
    // Strip the "Brief — " prefix so the sentence reads naturally.
    const depthPhrase = depth.split('—')[0].trim().toLowerCase()
    const lead = `Got it — writing it for ${audience.toLowerCase()}, ${depthPhrase} detail on each step.`
    // This flow's section is already open (openQuestioningSection opened it),
    // so resume mid-chapter rather than emitting a second heading for it.
    buildTimerRef.current = setTimeout(() => buildTick(lead, { skipSection: true }), 600)
  }

  // Stop in place. The build log is preserved and a divider marks where the
  // agent was interrupted; the queue index is untouched so "Continue" picks up
  // from exactly that flow. Previously this reset to 'plan', which discarded
  // every flow already built — the work looked lost even though it wasn't.
  const takeOverBuild = () => {
    if (buildTimerRef.current) clearTimeout(buildTimerRef.current)
    const remaining = Math.max(0, buildQueueRef.current.length - buildIndexRef.current)
    setBuildPhase('idle')
    setMidQ(null)
    setBuildInterrupted(true)
    // Any flow caught mid-draft rolls back to queued — it was never finished.
    const inFlight = buildQueueRef.current[buildIndexRef.current]
    if (inFlight) setBuildStatus((p) => (p[inFlight.id] === 'building' ? { ...p, [inFlight.id]: 'queued' } : p))
    // Drop a trailing live "thought" so the log doesn't freeze mid-spinner.
    setBuildLog((p) => {
      const next = p.filter((e) => !(e.kind === 'thought' && e.sug.id === inFlight?.id) && e.kind !== 'thinking')
      return [...next, { kind: 'interrupted', id: `int-${next.length}-${Date.now() % 100000}`, remaining }]
    })
    publishBuild({ active: false, title: '' })
  }

  // Resume from where the queue stopped — same tick loop, same index.
  const resumeBuild = () => {
    if (buildIndexRef.current >= buildQueueRef.current.length) return
    setBuildInterrupted(false)
    setPhase('building')
    setBuildPhase('building')
    setBuildLog((p) => p.filter((e) => e.kind !== 'interrupted'))
    const s = buildQueueRef.current[buildIndexRef.current]
    // The interrupted flow's section heading is still in the log above, so
    // resuming must NOT emit a second one for the same flow.
    buildTimerRef.current = setTimeout(
      () => buildTick(`Picking up where I left off — “${s.title}”: ${s.steps} from ${s.section}.`, { skipSection: true }),
      500,
    )
  }

  // The home-page guard modal can ask us to stop ("Stop the build").
  const takeOverRef = useRef(takeOverBuild)
  takeOverRef.current = takeOverBuild
  useEffect(() => onBuildStop(() => takeOverRef.current()), [])

  const working = phase === 'working' || phase === 'building'
  // The composer stays live during a build — only analysis and the clarifier
  // lock it.
  const composerLocked = phase === 'working' || phase === 'thinking' || phase === 'clarifying'
  const canSend = !composerLocked && (prompt.trim().length > 0 || files.length > 0)

  const openReview = (s: Suggestion) => { setReviewFlow(s); setReviewStep(null) }
  const reviewCard = reviewFlow ? flowCardFor(reviewFlow) : null
  const readyCount = Object.values(buildStatus).filter((v) => v === 'ready').length

  return (
    <div className="cf-root" style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--wfc-canvas-bg)', overflow: 'hidden', fontFamily: 'var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      {reviewFlow && reviewCard ? (
        /* ── Flow review — the studio Flows view, verbatim design ──────────── */
        <FlowReviewPanel
          flow={reviewFlow}
          card={reviewCard}
          activeStep={reviewStep}
          onStep={(i) => setReviewStep((cur) => (cur === i ? null : i))}
          onBack={() => { setReviewFlow(null); setReviewStep(null) }}
          onSave={() => {
            const title = reviewFlow.title
            setReviewFlow(null); setReviewStep(null)
            setToast(`“${title}” saved to Mukul_SF_OOB`)
            timers.current.push(setTimeout(() => setToast(null), 3200))
          }}
        />
      ) : (
        <>
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
              <EmptyState onUpload={addFile} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', maxWidth: 640, margin: '0 auto' }}>
                {/* user: docs + command */}
                <UserBubble text={command} attachedFiles={sentFiles} />

                {/* Pre-analysis thinking beat — "on it", before reading starts. */}
                {thinking && phase === 'thinking' && <AgentBubble thinking />}

                {/* Agent lead-in — the agent says what it is about to read.
                    Order matters: analysis runs FIRST, questions come after.
                    Asking before reading is guessing at what to ask. */}
                {(phase === 'working' || phase === 'clarifying' || phase === 'plan' || phase === 'building' || phase === 'done') && (
                  <AgentBubble>
                    <p className="wfc-msg-text">
                      Reading <strong>{sentFiles.length === 1 ? sentFiles[0].name : `${sentFiles.length} documents`}</strong> and mapping out the processes…
                    </p>
                  </AgentBubble>
                )}

                {/* Chain of thought — vertical rail + simple bullets. */}
                {analyzeShown.size > 0 && (
                  <ThinkingBlock
                    steps={analyzeSteps}
                    shown={analyzeShown}
                    done={analyzeDone}
                    progress={progress}
                    working={phase === 'working' && !thoughtCollapsed}
                    collapsed={thoughtCollapsed}
                    onToggle={() => setThoughtCollapsed((v) => !v)}
                  />
                )}

                {/* Now that the documents are read, the agent has something
                    concrete to ask about. Thinking beat, then the question. */}
                {thinking && phase === 'clarifying' && <AgentBubble thinking />}

                {(clarifyCardOpen || clarifyReply) && (
                  <AgentBubble>
                    <p className="wfc-msg-text">
                      I found <strong>{suggestions.length} processes</strong> worth turning into flows.
                      Two quick questions before I write them up.
                    </p>
                  </AgentBubble>
                )}

                {/* User's clarifier answers, posted as a reply */}
                {clarifyReply && <UserBubble text={clarifyReply} />}

                {/* Applying the answers, before the plan lands. */}
                {thinking && phase === 'working' && clarifyReply && <AgentBubble thinking />}

                {/* plan */}
                {(phase === 'plan' || phase === 'building' || phase === 'done') && (
                  <>
                    <AgentBubble>
                      <p className="wfc-msg-text">
                        I found <strong>{suggestions.length} flows</strong> {sentFiles.length === 1 ? 'in this document' : <>across <strong>{sentFiles.length} documents</strong></>}. Pick the ones to build.
                      </p>
                    </AgentBubble>

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
                          docCount={sentFiles.length}
                          phase={phase}
                          version={planVersion}
                          buildStatus={buildStatus}
                          collapsed={planCollapsed}
                          readyCount={readyCount}
                          queueTotal={buildQueueRef.current.length}
                          expanded={expandedRows}
                          onExpand={toggleExpanded}
                          onToggleCollapsed={() => setPlanCollapsed((v) => !v)}
                          onToggle={toggle}
                          onSelectAll={selectAll}
                          onOpenFlow={openReview}
                          onRegenerate={() => refinePlan('Regenerate the plan')}
                        />
                        {phase === 'plan' && (
                          <div className="cf-plan-actions wfc-fade-up">
                            <button onClick={startBuilding} disabled={checked.length === 0} className="cf-plan-build" style={{ flex: 1 }}>
                              Build {checked.length} {checked.length === 1 ? 'flow' : 'flows'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Conversational build — the agent narrates, thinks visibly,
                    asks when unsure, and lands each flow as a clickable tile. */}
                {(phase === 'building' || phase === 'done') && buildLog.map((e) => (
                  e.kind === 'agent' ? (
                    <AgentBubble key={e.id}><p className="wfc-msg-text">{e.text}</p></AgentBubble>
                  ) : e.kind === 'user' ? (
                    <UserBubble key={e.id} text={e.text} />
                  ) : e.kind === 'interrupted' ? (
                    <BuildInterrupted key={e.id} remaining={e.remaining} onResume={resumeBuild} />
                  ) : e.kind === 'thinking' ? (
                    <AgentBubble key={e.id} thinking />
                  ) : e.kind === 'thought' ? (
                    <BuildThought key={e.id} sug={e.sug} lead={e.lead}
                      done={buildStatus[e.sug.id] === 'ready'} />
                  ) : (
                    <BuiltTile key={e.id} sug={e.sug}
                      status={buildStatus[e.sug.id] ?? 'queued'}
                      onOpen={() => openReview(e.sug)} />
                  )
                ))}

                {phase === 'done' && <DoneBubble count={checked.length} onPreview={() => { const first = checked[0] ?? suggestions[0]; if (first) openReview(first) }} />}
              </div>
            )}
          </div>

          {/* Wash behind ANY question card — the opening clarifier and the
              mid-build question are the same interruption, so they get the
              same treatment. Was gated on midQ only, which left the first
              question with no veil at all. */}
          {(midQ || (phase === 'clarifying' && clarifyCardOpen)) && (
            <div className="cf-midq-veil" aria-hidden="true" />
          )}

          {/* Composer dock */}
          <div className="wfc-chat-refine" style={{ flexShrink: 0, width: '100%', maxWidth: 640, margin: '0 auto', padding: '12px 18px 18px' }}>
            {/* Starter prompts — stacked, left-aligned, hugging the composer. */}
            {(phase === 'empty' || phase === 'attached') && (
              <div className="cf-starters">
                {STARTERS.map(({ label, Icon }, i) => (
                  <button key={label} type="button" className="cf-starter"
                    style={{ animationDelay: `${380 + i * 100}ms` }}
                    onClick={() => { setPrompt(label); composerRef.current?.focus() }}>
                    <Icon size={14} strokeWidth={1.8} />
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Clarifier — tiny tabbed question card above the input bar */}
            {phase === 'clarifying' && clarifyCardOpen && (
              <ClarifierCard
                activeTab={clarifyTab}
                setActiveTab={setClarifyTab}
                answers={clarifyAnswers}
                onPick={pickClarify}
                onSubmit={submitClarify}
              />
            )}

            {/* Mid-build question — same card design as the clarifier. The
                veil sits behind it (rendered in the root, below) so the card
                reads as slightly forward without dimming the thread. */}
            {midQ && <MidQCard q={midQ} onSubmit={answerMidQ} />}

            {/* File-limit notice — appears only when the 7th upload is tried. */}
            {limitHit && (
              <div className="cf-limit wfc-fade-up" role="status" aria-live="polite">
                <AlertCircle size={14} strokeWidth={2} />
                <span>Maximum file limit reached. Up to {MAX_FILES} documents per draft.</span>
                <button type="button" className="cf-limit-x" aria-label="Dismiss" onClick={() => setLimitHit(false)}>
                  <X size={12} strokeWidth={2.4} />
                </button>
              </div>
            )}

            {/* Composer — Claude-style block: file chips in a two-column grid
                (prompt-kit), big textarea, actions row pinned at the bottom. */}
            <div className="wfc-composer wfc-composer-mini cf-composer-v2" onClick={(e) => { if (e.target === e.currentTarget) composerRef.current?.focus() }}>
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

              {/* Staged documents — two-column chip grid (prompt-kit). */}
              {files.length > 0 && (
                <div className="cf-files">
                  {files.map((f) => (
                    <div key={f.name} className="cf-file-chip cf-fade-up">
                      <Paperclip size={13} strokeWidth={1.9} />
                      <span className="cf-file-name">{f.name}</span>
                      <button type="button" className="cf-file-x" aria-label={`Remove ${f.name}`} onClick={() => removeFile(f.name)}>
                        <X size={12} strokeWidth={2.4} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                ref={composerRef}
                className="wfc-composer-textarea"
                placeholder={
                  phase === 'empty' ? 'Describe what you want to build…' :
                  phase === 'attached' ? 'Ask for flows across your documents…' :
                  phase === 'clarifying' ? 'Pick your answers above…' :
                  phase === 'plan' ? 'Refine the plan, e.g. "merge flows 3 & 4"' :
                  phase === 'building' ? (buildInterrupted ? 'Type “continue” to resume…' : 'Ask or refine while I build…') :
                  phase === 'done' ? 'Ask a follow-up…' :
                  'Working…'
                }
                rows={1}
                value={prompt}
                disabled={composerLocked}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
              />

              <div className="cf-composer-row2">
                <div className="cf-composer-tools" style={{ position: 'relative' }}>
                  <button type="button" className="wfc-mini-btn" aria-label="Add attachment" aria-haspopup="menu" aria-expanded={attachMenuOpen}
                    disabled={composerLocked} onClick={() => setAttachMenuOpen((v) => !v)}>
                    <Plus size={16} strokeWidth={1.9} />
                  </button>
                  {attachMenuOpen && (
                    <>
                      <div onClick={() => setAttachMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 30 }} />
                      <div className="cf-attach-menu cf-fade-up" role="menu">
                        <button className="cf-attach-menu-item" role="menuitem" onClick={() => { setAttachMenuOpen(false); addFile() }}>
                          <FileText size={14} strokeWidth={1.8} /> Upload a document
                        </button>
                        <button className="cf-attach-menu-item" role="menuitem" onClick={() => { setAttachMenuOpen(false); addFile() }}>
                          <History size={14} strokeWidth={1.8} /> From your library
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="cf-composer-tools">
                  <button type="button" className="wfc-mini-btn" aria-label="Voice, coming soon" disabled>
                    <Mic size={16} strokeWidth={1.9} />
                  </button>
                  {working && !canSend && !buildInterrupted ? (
                    /* Stop is non-destructive mid-build: it hands control back
                       at the plan instead of wiping the whole session. */
                    <button type="button" className="wfc-send-btn wfc-stop-btn" aria-label={phase === 'building' ? 'Stop building' : 'Stop'}
                      onClick={() => { if (phase === 'building') takeOverBuild(); else reset() }}>
                      <Square size={11} strokeWidth={0} fill="currentColor" />
                    </button>
                  ) : (
                    <button type="button" className="wfc-send-btn" aria-label="Send" disabled={!canSend} onClick={submit}>
                      <ArrowUp size={14} strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <input ref={fileRef} type="file" accept=".pdf,.docx,.pptx" hidden onChange={addFile} />

      {/* Per-flow popup — HIDDEN in the MVP (nothing sets previewFlow), kept
          intact so tomorrow's preview work re-enables it in one line. */}
      {mounted && previewFlow && createPortal(
        <div className="cf-preview-scrim" role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget) setPreviewFlow(null) }}>
          <div className="cf-preview-box cf-flow-popup wfc-create-root" role="dialog" aria-modal="true" aria-label={`Preview: ${previewFlow.title}`}
            style={{ fontFamily: 'var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
            <button className="cf-flow-popup-close" onClick={() => setPreviewFlow(null)} aria-label="Close preview" title="Close (Esc)">
              <X size={16} strokeWidth={2} />
            </button>
            <div key={previewFlow.id} className="cf-flow-popup-body cf-flow-swap">
              <ExpandedPreview card={flowCardFor(previewFlow)} />
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* Agent takeover — while First Draft is building, the page (left
          free-zone) is "controlled by the agent": breathing orange frame +
          a status chip. Purely informational; pointer-events pass through. */}
      {mounted && (buildPhase === 'building' || buildPhase === 'paused') && createPortal(
        <div className={`cf-takeover ${buildPhase === 'paused' ? 'is-paused' : ''}`} aria-hidden="true">
          <div className="cf-takeover-ring" />
          <div className="cf-takeover-chip">
            <span className="cf-takeover-spark">
              {buildPhase === 'paused' ? <Pause size={12} strokeWidth={2.2} /> : <Sparkles size={12} strokeWidth={2.2} />}
            </span>
            <span className="cf-takeover-text">
              {buildPhase === 'paused' ? 'Waiting for your answer' : 'First Draft is controlling this window'}
            </span>
            {buildPhase === 'building' && (
              <span className="cf-takeover-sub">
                Building “{buildQueueRef.current[Math.min(buildIndex, buildQueueRef.current.length - 1)]?.title ?? ''}”
              </span>
            )}
          </div>
        </div>,
        document.body,
      )}

      {/* Step preview — clicking a step in the review list shows that step on
          the page: the app mock with the Whatfix tooltip pinned to its anchor. */}
      {mounted && reviewFlow && reviewCard && reviewStep !== null && createPortal(
        <div className="cf-step-scrim" role="presentation"
          onClick={(e) => { if (e.target === e.currentTarget) setReviewStep(null) }}>
          <div className="cf-step-card wfc-create-root" role="dialog" aria-modal="true" aria-label={`Step ${reviewStep + 1}: ${reviewCard.steps[reviewStep].title}`}
            style={{ fontFamily: 'var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
            <div className="cf-step-card-head">
              <span className="cf-step-kicker">Step {reviewStep + 1} of {reviewCard.steps.length}</span>
              <span className="cf-step-title">{reviewCard.steps[reviewStep].title}</span>
              <button type="button" className="cf-step-close" aria-label="Close step preview" onClick={() => setReviewStep(null)}>
                <X size={14} strokeWidth={2} />
              </button>
            </div>
            <div key={reviewStep} className="wfc-sb-frame is-visible cf-step-frame">
              <div className="wfc-sb-frame-stage">
                <SetupMock />
                <StepTooltip step={reviewCard.steps[reviewStep]} index={reviewStep} total={reviewCard.steps.length} />
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}

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
function UserBubble({ text, attachedFiles }: { text: string; attachedFiles?: MockFile[] }) {
  return (
    <div className="cf-user-row wfc-fade-up">
      <div className="cf-user">
        {attachedFiles && attachedFiles.length > 0 && (
          <div className="cf-user-files">
            {attachedFiles.map((f) => (
              <span key={f.name} className="cf-user-file">
                <Paperclip size={11} strokeWidth={2} />
                {f.name}
              </span>
            ))}
          </div>
        )}
        {text && <span className="cf-user-text">{text}</span>}
      </div>
    </div>
  )
}

function AgentBubble({ children, thinking }: { children?: React.ReactNode; thinking?: boolean }) {
  return (
    <div className="cf-agent wfc-fade-up">
      {thinking ? (
        <div className="wfc-thinking-dots" role="status" aria-live="polite" aria-label="Agent is thinking"><span /><span /><span /></div>
      ) : children}
    </div>
  )
}

// Stop marker — amber divider showing where the agent was halted and how much
// is left. Resuming picks up from exactly this point.
function BuildInterrupted({ remaining, onResume }: { remaining: number; onResume: () => void }) {
  return (
    <div className="cf-interrupt wfc-fade-up">
      <div className="cf-interrupt-rule" aria-hidden="true" />
      <div className="cf-interrupt-row">
        <span className="cf-interrupt-label">
          <Pause size={11} strokeWidth={2.4} />
          Interrupted
        </span>
        {remaining > 0 && (
          <span className="cf-interrupt-meta">
            {remaining} {remaining === 1 ? 'flow' : 'flows'} left
          </span>
        )}
        {remaining > 0 && (
          <button type="button" className="cf-interrupt-resume" onClick={onResume}>
            Continue
            <ChevronRight size={12} strokeWidth={2.4} />
          </button>
        )}
      </div>
    </div>
  )
}

// A finished flow, landed in the thread. Click → review view.
// The flow card. Appears the moment its flow starts and resolves in place —
// same element, three states — so the card is the thing you watch rather than
// a tile that shows up after the fact.
function BuiltTile({ sug, status, onOpen }: {
  sug: Suggestion
  status: 'building' | 'ready' | 'queued'
  onOpen: () => void
}) {
  const ready = status === 'ready'
  return (
    <button
      type="button"
      className={`cf-built-tile wfc-fade-up ${ready ? 'is-ready' : 'is-building'}`}
      onClick={ready ? onOpen : undefined}
      disabled={!ready}
      aria-busy={!ready}
    >
      <span className="cf-built-icon">
        {ready
          ? <Signpost size={15} strokeWidth={1.9} />
          : <Loader2 size={15} strokeWidth={2.2} className="cf-spin" />}
      </span>
      <span className="cf-built-text">
        <span className="cf-built-title">{sug.title}</span>
        <span className="cf-built-meta">
          {ready
            ? <><Check size={10} strokeWidth={3} /> Ready · {sug.steps}</>
            : <>Building · {sug.steps}</>}
        </span>
      </span>
      {ready
        ? <span className="cf-built-cta">Review <ChevronRight size={13} strokeWidth={2} /></span>
        : <span className="cf-built-progress" aria-hidden="true"><span className="cf-built-progress-fill" /></span>}
    </button>
  )
}

// Per-flow thought — the agent visibly drafts each flow (Claude-style).
// Lines reveal one by one while building; collapses to a quiet toggle when done.
function BuildThought({ sug, done, lead }: { sug: Suggestion; done: boolean; lead?: string }) {
  const lines = [
    `Reading ${sug.section} in ${baseName(sug.file)}`,
    `Drafting ${sug.steps} with screen anchors`,
    'Placing tooltips and checks',
  ]
  // While live the header shows ONE line that swaps in place — the current
  // action, shimmering. It never accumulates, so a 10-flow build adds ten
  // one-line summaries instead of thirty stacked bullets. Expanding reveals
  // the full list; collapsed is the default in both states.
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (done) return
    const t1 = setTimeout(() => setStep(1), 1200)
    const t2 = setTimeout(() => setStep(2), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [done])

  const headText = done
    ? `Drafted ${sug.steps} · ${sug.section}`
    : lines[step]

  return (
    <div className="cf-think wfc-fade-up">
      <button
        type="button"
        className={`cf-think-head cf-think-toggle ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {/* No spinner while live — the card below already carries one, and the
            shimmering text is itself the "working" signal. Two spinners for a
            single operation read as two operations. */}
        <ChevronRight size={13} strokeWidth={2.2} className="cf-think-chev" aria-hidden="true" />
        <span key={headText} className={done ? 'cf-think-head-text' : 'cf-think-shimmer cf-think-swap'}>
          {headText}
        </span>
      </button>

      {/* The acknowledgement of a mid-build answer rides with this flow's
          thinking line rather than as its own bubble. */}
      {lead && !done && <p className="cf-think-lead">{lead}</p>}

      {open && (
        <ul className="cf-think-steps">
          {lines.map((l, idx) => {
            const state = done || idx < step ? 'is-done' : idx === step ? 'is-active' : 'is-idle'
            return (
              <li key={l} className={`cf-think-step ${state}`}>
                <span className="cf-think-step-mark" aria-hidden="true">
                  {state === 'is-active'
                    ? <Loader2 size={11} strokeWidth={2.4} className="cf-spin" />
                    : state === 'is-done'
                      ? <Check size={11} strokeWidth={2.6} />
                      : <span className="cf-think-step-pending" />}
                </span>
                <span className="cf-think-step-label">{l}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ─── Thinking — chain of thought with a quiet vertical rail. ──────────────────
function ThinkingBlock({ steps, shown, done, progress, working, collapsed, onToggle }: {
  steps: AnalyzeStep[]
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
            <span className="cf-think-live-label">Analyzing documents…</span>
          </div>
          <div className="cf-think-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Analysis progress">
            <div className="cf-think-fill" style={{ width: `${progress}%` }} />
          </div>
          <ul className="cf-think-steps">
            {steps.filter((s) => shown.has(s.id)).map((s) => {
              const isDone = done.has(s.id)
              return (
                <li key={s.id} className={`cf-think-step cf-think-live ${isDone ? 'is-done' : 'is-active'}`}>
                  <span className="cf-think-step-mark" aria-hidden="true">
                    {isDone ? <Check size={11} strokeWidth={2.6} /> : <Loader2 size={11} strokeWidth={2.4} className="cf-spin" />}
                  </span>
                  <span className="cf-think-step-label">{s.label}</span>
                </li>
              )
            })}
          </ul>
        </>
      ) : (
        <>
          <button type="button" className={`cf-think-head cf-think-toggle ${open ? 'is-open' : ''}`} onClick={onToggle} aria-expanded={open}>
            <ChevronRight size={13} strokeWidth={2.2} className="cf-think-chev" aria-hidden="true" />
            Analyzed
            <span className="cf-think-dot" aria-hidden="true">·</span>
            {steps.length} steps
          </button>
          {open && (
            <ul className="cf-think-steps">
              {steps.map((s) => (
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

// ─── Empty state — hero, headline, and the primary Upload CTA ─────────────────
// The CTA is constant: no counters, no label changes, never disabled. Success
// feedback is the file landing in the composer; only the 7th attempt speaks.
function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="cf-empty">
      <div className="cf-hero cf-empty-reveal" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/document-icon.svg" alt="" width={160} height={160} className="cf-hero-doc" />
        <svg className="cf-hero-spark cf-hero-spark-1" viewBox="0 0 24 24"><path d="M12 0 L14.4 9.6 L24 12 L14.4 14.4 L12 24 L9.6 14.4 L0 12 L9.6 9.6 Z" /></svg>
        <svg className="cf-hero-spark cf-hero-spark-2" viewBox="0 0 24 24"><path d="M12 0 L14.4 9.6 L24 12 L14.4 14.4 L12 24 L9.6 14.4 L0 12 L9.6 9.6 Z" /></svg>
      </div>
      <h1 className="cf-empty-title cf-empty-reveal" style={{ animationDelay: '110ms' }}>
        What should we build?
      </h1>
      <p className="cf-empty-sub cf-empty-reveal" style={{ animationDelay: '210ms' }}>
        Upload up to {MAX_FILES} documents and ask for flows
      </p>
      <button type="button" className="cf-upload-cta cf-empty-reveal" style={{ animationDelay: '300ms' }} onClick={onUpload}>
        <Plus size={15} strokeWidth={2.2} />
        Upload documents
      </button>
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

      <div className="cf-clarify-qrow">
        <span className="cf-clarify-q">{tab.question}</span>
      </div>

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

      <div className="cf-clarify-foot">
        <span className="cf-clarify-progress">{answeredCount} of {CLARIFY_TABS.length} answered</span>
        <button className="cf-clarify-submit" disabled={!allAnswered} onClick={onSubmit}>
          Submit <ArrowUp size={13} strokeWidth={2.6} />
        </button>
      </div>
    </div>
  )
}

// ─── Mid-build question — SAME design language as the clarifier card, now
//     tabbed so both questions land in one interruption rather than two. ───────
function MidQCard({ q, onSubmit }: { q: MidQuestion; onSubmit: (answers: Record<string, string>) => void }) {
  const [activeTab, setActiveTab] = useState(q.tabs[0].id)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const tab = q.tabs.find((t) => t.id === activeTab) ?? q.tabs[0]
  const answeredCount = q.tabs.filter((t) => answers[t.id]).length
  const allAnswered = answeredCount === q.tabs.length
  const tabIdx = q.tabs.findIndex((t) => t.id === tab.id)

  // Picking an answer auto-advances to the next unanswered tab, so two
  // questions feel like one continuous motion instead of two decisions.
  const pick = (tabId: string, opt: string) => {
    setAnswers((p) => ({ ...p, [tabId]: opt }))
    const idx = q.tabs.findIndex((t) => t.id === tabId)
    const next = q.tabs[idx + 1]
    if (next && !answers[next.id]) setTimeout(() => setActiveTab(next.id), 220)
  }

  return (
    <div className="cf-clarify wfc-fade-up">
      <div className="cf-clarify-tabs">
        {q.tabs.map((t) => {
          const on = t.id === activeTab
          const done = !!answers[t.id]
          return (
            <button key={t.id} type="button" className={`cf-clarify-tab ${on ? 'is-active' : ''} ${done ? 'is-done' : ''}`} onClick={() => setActiveTab(t.id)}>
              <span className="cf-clarify-tab-dot" aria-hidden="true" />
              {t.label}
            </button>
          )
        })}
        <span className="cf-clarify-count">{tabIdx + 1}/{q.tabs.length}</span>
      </div>

      {/* Which flow this is about — the card interrupts a build, so it has to
          name its subject or the questions read as context-free. */}
      <div className="cf-midq-subject">
        <Route size={12} strokeWidth={2} />
        <span>{q.sug.title}</span>
      </div>

      <div className="cf-clarify-qrow">
        <span className="cf-clarify-q">{tab.question}</span>
      </div>

      <div className="cf-clarify-rows">
        {tab.options.map((opt) => {
          const sel = answers[tab.id] === opt
          return (
            <button key={opt} className={`cf-clarify-row ${sel ? 'is-sel' : ''}`} aria-pressed={sel} onClick={() => pick(tab.id, opt)}>
              <span className="cf-clarify-row-radio" aria-hidden="true" />
              <span className="cf-clarify-row-label">{opt}</span>
            </button>
          )
        })}
      </div>

      <div className="cf-clarify-foot">
        <span className="cf-clarify-progress">{answeredCount} of {q.tabs.length} answered</span>
        <button className="cf-clarify-submit" disabled={!allAnswered} onClick={() => allAnswered && onSubmit(answers)}>
          Submit <ArrowUp size={13} strokeWidth={2.6} />
        </button>
      </div>
    </div>
  )
}

// ─── Plan list — collapsible accordion. Checkboxes only (no preview); once a
//     flow is built, its row opens the review view instead. ───────────────────
function PlanList({ suggestions, docCount, phase, version, buildStatus, collapsed, readyCount, queueTotal, expanded, onExpand, onToggleCollapsed, onToggle, onSelectAll, onOpenFlow, onRegenerate }: {
  suggestions: Suggestion[]
  docCount: number
  phase: Phase
  version: number
  buildStatus: Record<string, 'queued' | 'building' | 'ready'>
  collapsed: boolean
  readyCount: number
  queueTotal: number
  expanded: Set<string>
  onExpand: (id: string) => void
  onToggleCollapsed: () => void
  onToggle: (id: string) => void
  onSelectAll: () => void
  onOpenFlow: (s: Suggestion) => void
  onRegenerate: () => void
}) {
  const locked = phase === 'building' || phase === 'done'
  const allOn = suggestions.every((s) => s.checked)
  return (
    <div className="wfc-fade-up cf-plan-card">
      <div className={`cf-plan-head ${collapsed ? 'is-collapsed' : ''}`} onClick={onToggleCollapsed} role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleCollapsed() } }}
        aria-expanded={!collapsed}>
        <ChevronDown size={14} strokeWidth={2} className={`cf-plan-fold ${collapsed ? 'is-folded' : ''}`} aria-hidden="true" />
        <span className="cf-plan-head-title">Proposed flows</span>
        {version > 1 && <span className="cf-plan-head-version">v{version}</span>}
        {locked && collapsed && (
          <span className="cf-plan-progresschip">
            {readyCount === queueTotal ? <><Check size={11} strokeWidth={3} /> All built</> : `${readyCount} of ${queueTotal} built`}
          </span>
        )}
        <div className="cf-plan-head-actions" onClick={(e) => e.stopPropagation()}>
          {!locked && !collapsed && (
            <>
              <button className="cf-plan-head-icon" title="Regenerate" aria-label="Regenerate plan" onClick={onRegenerate}>
                <RotateCw size={13} strokeWidth={1.9} />
              </button>
              <button className="cf-plan-selectall" onClick={onSelectAll}>{allOn ? 'Clear all' : 'Select all'}</button>
            </>
          )}
        </div>
      </div>
      {!collapsed && (
        <div>
          {suggestions.map((s) => {
            const status = buildStatus[s.id]
            const openable = locked && status === 'ready'
            const isOpen = expanded.has(s.id)
            const outline = outlineFor(s)
            return (
              <div key={s.id} className={`cf-plan-entry ${isOpen ? 'is-open' : ''}`}>
                <div
                  className={`cf-plan-item ${!locked && s.checked ? 'is-selected' : ''}`}
                  onClick={() => { if (openable) onOpenFlow(s); else if (!locked) onToggle(s.id) }}
                  style={{ cursor: locked && !openable ? 'default' : 'pointer' }}
                >
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
                  <div className="cf-plan-body">
                    <div className="cf-plan-row1">
                      <span className="cf-plan-title">{s.title}</span>
                      {locked && status === 'ready' && <span className="cf-plan-ready"><Check size={11} strokeWidth={3} />Ready</span>}
                      {locked && status === 'building' && <span className="cf-plan-generating">Generating…</span>}
                    </div>
                    <div className="cf-plan-meta">
                      <span className="cf-plan-steps">{s.steps}</span>
                      {docCount > 1 && (
                        <>
                          <span className="cf-plan-dot" aria-hidden="true">·</span>
                          <span className="cf-plan-steps">{baseName(s.file)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Expand — reveals this flow's steps inline. Its own hit area
                      so it never fights the row's select / open behaviour. */}
                  <button
                    type="button"
                    className={`cf-plan-expand ${isOpen ? 'is-open' : ''}`}
                    aria-expanded={isOpen}
                    aria-label={isOpen ? `Hide steps for ${s.title}` : `Show steps for ${s.title}`}
                    onClick={(e) => { e.stopPropagation(); onExpand(s.id) }}
                  >
                    <ChevronDown size={15} strokeWidth={2} />
                  </button>
                </div>
                {isOpen && (
                  <ol className="cf-plan-steps-list">
                    {outline.map((st, i) => (
                      <li key={st.title} className="cf-plan-step">
                        <span className="cf-plan-step-num">{i + 1}</span>
                        <span className="cf-plan-step-label">{st.title}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )
          })}
        </div>
      )}
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
        <p className="cf-done-sub">All set. Your flows are live in the project. Open one to review its steps, or keep refining in chat.</p>
        <button className="cf-done-cta" onClick={onPreview}>Review flows <ChevronRight size={13} strokeWidth={2} /></button>
      </div>
    </div>
  )
}

// ─── Flow review — the studio "Flow" view, reused verbatim ────────────────────
function StepMain({ text }: { text: string }) {
  const parts = text.split(' ')
  if (parts.length < 2) return <span className="cf-fv-stepmain">{text}</span>
  return (
    <span className="cf-fv-stepmain">{parts[0]} <strong>{parts.slice(1).join(' ')}</strong></span>
  )
}

function FlowReviewPanel({ flow, card, activeStep, onStep, onBack, onSave }: {
  flow: Suggestion
  card: Extract<JourneyCard, { type: 'flow' }>
  activeStep: number | null
  onStep: (i: number) => void
  onBack: () => void
  onSave: () => void
}) {
  return (
    <div className="cf-fv">
      {/* Header — back chevron + "Flow", matching the studio Flow view */}
      <div className="cf-fv-head">
        <button type="button" className="cf-fv-back" onClick={onBack} aria-label="Back to chat">
          <ChevronLeft size={22} strokeWidth={2.5} />
          <span>Flow</span>
        </button>
        <div className="cf-fv-hbtns">
          <button type="button" className="cf-fv-hbtn" title="More options" aria-label="More options"><MoreVertical size={18} strokeWidth={2} /></button>
          <button type="button" className="cf-fv-hbtn" title="Back to chat" aria-label="Back to chat" onClick={onBack}><X size={18} strokeWidth={2} /></button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="cf-fv-scroll">
        {/* Title section — white */}
        <div className="cf-fv-titlecard">
          <div className="cf-fv-titlerow">
            <span className="cf-fv-orb"><Signpost size={20} strokeWidth={1.8} /></span>
            <span className="cf-fv-title">{flow.title}</span>
          </div>
          <button type="button" className="cf-fv-details">Details</button>
        </div>

        {/* Gray body — steps */}
        <div className="cf-fv-body">
          <button type="button" className="cf-fv-rewrite">
            <Sparkles size={15} strokeWidth={2} />
            Rewrite steps
          </button>

          {card.steps.map((st, i) => (
            <button key={st.num} type="button" className={`cf-fv-step ${activeStep === i ? 'is-active' : ''}`} onClick={() => onStep(i)} aria-pressed={activeStep === i}>
              <span className="cf-fv-num">{activeStep === i ? <Sparkles size={14} strokeWidth={2} /> : i + 1}</span>
              <span className="cf-fv-steptext">
                <StepMain text={st.title} />
                <span className="cf-fv-stepsub">{st.body}</span>
              </span>
              <span className="cf-fv-stepmore" aria-hidden="true"><MoreVertical size={16} strokeWidth={1.8} /></span>
            </button>
          ))}

          <button type="button" className="cf-fv-addstep">
            <Plus size={18} strokeWidth={2.5} />
            Add Step
          </button>

          <div className="cf-fv-endmsg">
            <span className="cf-fv-num"><Flag size={14} strokeWidth={1.8} /></span>
            <span className="cf-fv-endlabel">End Message</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="cf-fv-foot">
        <button type="button" className="cf-fv-discard" onClick={onBack}>Discard</button>
        <div className="cf-fv-footright">
          <button type="button" className="cf-fv-previewbtn" onClick={() => onStep(0)}>Preview</button>
          <button type="button" className="cf-fv-savebtn" onClick={onSave}>Save Flow</button>
        </div>
      </div>
    </div>
  )
}

// The Salesforce Setup backdrop — same markup as the storyboard frames.
function SetupMock() {
  return (
    <div className="wfc-sf-mock wfc-sf-mock-setup wfc-sf-mock-crisp" aria-hidden="true">
      <div className="wfc-sf-header">
        <div className="wfc-sf-logo-dot" />
        <div className="wfc-sf-nav">
          <span>Setup</span>
          <span>Object Manager</span>
        </div>
        <div className="wfc-sf-header-right">
          <div className="wfc-sf-avatar" />
        </div>
      </div>
      <div className="wfc-sf-setup-body">
        <div className="wfc-sf-setup-sidebar">
          <div className="wfc-sf-setup-sidebar-search" />
          <div className="wfc-sf-setup-sidebar-section">
            <div className="wfc-sf-setup-sidebar-row" />
            <div className="wfc-sf-setup-sidebar-row" />
            <div className="wfc-sf-setup-sidebar-row" />
          </div>
          <div className="wfc-sf-setup-sidebar-section">
            <div className="wfc-sf-setup-sidebar-row active" />
            <div className="wfc-sf-setup-sidebar-row" />
            <div className="wfc-sf-setup-sidebar-row" />
          </div>
        </div>
        <div className="wfc-sf-setup-main">
          <div className="wfc-sf-setup-bread" />
          <div className="wfc-sf-setup-h1" />
          <div className="wfc-sf-setup-row tall" />
          <div className="wfc-sf-setup-row" />
          <div className="wfc-sf-setup-row short" />
          <div className="wfc-sf-setup-toggle-row">
            <div className="wfc-sf-setup-toggle-label" />
            <div className="wfc-sf-setup-toggle" />
          </div>
          <div className="wfc-sf-setup-row" />
        </div>
      </div>
    </div>
  )
}

// The Whatfix tooltip pinned at the step's anchor (read-only, no InlineEdit).
function StepTooltip({ step, index, total }: {
  step: { title: string; body: string; anchorLabel: string }
  index: number
  total: number
}) {
  const anchor = ANCHORS[index % ANCHORS.length]
  return (
    <div
      className={`wfc-flow-tooltip wfc-flow-tooltip-${anchor.placement}`}
      style={{ top: anchor.tipTop, left: anchor.tipLeft }}
    >
      <div className="wfc-flow-tooltip-pointer" aria-hidden="true" />
      <div className="wfc-flow-tooltip-head">
        <span className="wfc-flow-tooltip-chip">
          {String(index + 1).padStart(2, '0')}<span className="wfc-flow-tooltip-chip-sep">/</span>{total}
        </span>
        <span className="wfc-flow-tooltip-anchor">{step.anchorLabel}</span>
      </div>
      <div className="wfc-flow-tooltip-title">{step.title}</div>
      <div className="wfc-flow-tooltip-body">{step.body}</div>
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
