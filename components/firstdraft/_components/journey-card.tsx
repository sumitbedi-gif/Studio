"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { LayoutTemplate, Route, Lightbulb, FileText, Check, Loader2, HelpCircle, X } from "lucide-react"
import type { JourneyCard as Card } from "../_state/types"

const TYPE_META = {
  popup:    { label: "POP-UP",     Icon: LayoutTemplate },
  flow:     { label: "FLOW",       Icon: Route },
  smarttip: { label: "SMART TIP",  Icon: Lightbulb },
  article:  { label: "ARTICLE",    Icon: FileText },
} as const

/**
 * Per-card priority. The agent's opinion on what's worth shipping, framed
 * the way Patrick asked: "must-do, nice-to-have, don't bother." Surfaces
 * a consultative voice instead of treating every recommendation equally.
 * `must` cards are load-bearing for the launch; `nice` lifts adoption but
 * isn't gating; `optional` is durable / catchall and is safe to skip.
 */
type Priority = "must" | "nice" | "optional"
const PRIORITY_META: Record<Priority, { label: string; tone: string }> = {
  must:     { label: "Must do",      tone: "Reps will be blocked without this" },
  nice:     { label: "Nice to have", tone: "Lifts adoption, not required for launch" },
  optional: { label: "Optional",     tone: "Useful later, safe to skip for v1" },
}

const PRIORITY_BY_ID: Record<string, Priority> = {
  "popup-1":   "must",
  "flow-1":    "must",
  "tip-1":     "nice",
  "article-1": "optional",
}

/**
 * Per-card rationale shown in the "Why this?" popover. Each entry follows
 * the user-benefit framing Patrick called out: lead with what the rep /
 * admin / team gets, not why the agent picked it. Source citation makes
 * the agent's read of the doc visible (Patrick: "can it also show from
 * which part of the document has it taken the information").
 */
const RATIONALE_BY_ID: Record<string, { why: string; why_here: string; source: string }> = {
  "popup-1": {
    why: "Reps notice Approval Bot the first time they open a deal, so they don't call IT or wait for a Slack reply just to find the new button.",
    why_here: "First in the sequence because first sight is what gets the change adopted; if reps miss this, the rest of the launch is invisible.",
    source: "From page 1 of Approval-Bot-Release-Notes-Q1-2026.pdf — \"Reps will see a new Request Approval button.\"",
  },
  "flow-1": {
    why: "Admins finish setup in under five minutes instead of digging through Setup screens, so routing is live before the first rep needs it.",
    why_here: "Second because configuration has to land before reps trigger it; without this, the pop-up promises something that doesn't work.",
    source: "From pages 4–6 of Approval-Bot-Release-Notes-Q1-2026.pdf — \"Routing rules\" section.",
  },
  "tip-1": {
    why: "Reps see the routing rule in the moment they click Request Approval, so the right approver gets pinged without anyone needing to remember the policy.",
    why_here: "Reinforcement layer: lives on the deal page so the rule is visible exactly when it fires, not buried in a help article.",
    source: "From page 7 of Approval-Bot-Release-Notes-Q1-2026.pdf — \"Approver assignment logic.\"",
  },
  "article-1": {
    why: "Managers have one link to send when reps ask about Bot weeks from now, so the team isn't answering the same question on repeat.",
    why_here: "Durable last layer: catches reps who skipped the launch pop-up and managers searching the help center.",
    source: "Synthesized across pages 1, 4, 7, and 10 of Approval-Bot-Release-Notes-Q1-2026.pdf.",
  },
}

interface Props {
  card: Card
  selected: boolean
  onSelect: () => void
  index: number
  isRemoving?: boolean
  buildStatus?: "queued" | "building" | "built"
}

export function JourneyCard({ card, selected, onSelect, index, isRemoving, buildStatus }: Props) {
  const { label, Icon } = TYPE_META[card.type]
  const confidenceClass =
    card.confidence === "high" ? "high"
    : card.confidence === "medium" ? "medium"
    : "low"

  const buildClass = buildStatus ? `is-build-${buildStatus}` : ""

  const [whyOpen, setWhyOpen] = useState(false)
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const whyButtonRef = useRef<HTMLButtonElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => setMounted(true), [])

  // Position the portaled popover under the card. Computed from the card's
  // bounding rect so it stays anchored even though it's rendered at the
  // document root (which it must be, since .wfc-ribbon has overflow-x:auto
  // and would clip an absolutely-positioned popover).
  const POPOVER_WIDTH = 280
  const updatePosition = () => {
    if (!rootRef.current) return
    const rect = rootRef.current.getBoundingClientRect()
    // Center horizontally on the card, but clamp to the viewport edges.
    const idealLeft = rect.left + rect.width / 2 - POPOVER_WIDTH / 2
    const left = Math.max(12, Math.min(window.innerWidth - POPOVER_WIDTH - 12, idealLeft))
    setPopoverPos({ top: rect.bottom + 8, left })
  }

  // Recompute on open + on scroll/resize while open. Outside click + Escape
  // dismiss.
  useEffect(() => {
    if (!whyOpen) return
    updatePosition()
    const onScroll = () => updatePosition()
    const onResize = () => updatePosition()
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      const inRoot = rootRef.current?.contains(t)
      const inPopover = popoverRef.current?.contains(t)
      if (!inRoot && !inPopover) {
        setWhyOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setWhyOpen(false)
    }
    window.addEventListener("mousedown", onDown)
    window.addEventListener("keydown", onKey)
    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("mousedown", onDown)
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", onResize)
    }
  }, [whyOpen])

  const rationale = RATIONALE_BY_ID[card.id]
  const priority = PRIORITY_BY_ID[card.id]
  const priorityMeta = priority ? PRIORITY_META[priority] : null
  const priorityClass = priority ? `is-pri-${priority}` : ""

  return (
    <div
      ref={rootRef}
      className={`wfc-journey-card ${selected ? "is-selected" : ""} ${isRemoving ? "is-removing" : ""} ${buildClass} ${priorityClass} wfc-fade-up`}
      style={{ animationDelay: `${index * 80}ms` }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      <div className="wfc-journey-card-head">
        <Icon size={14} strokeWidth={1.8} className="wfc-journey-card-icon" />
        <span className="wfc-journey-card-type">{label}</span>
        {buildStatus === "building" && (
          <span className="wfc-journey-card-build-icon" aria-label="Building">
            <Loader2 size={11} strokeWidth={2.2} className="wfc-spin" />
          </span>
        )}
        {buildStatus === "built" && (
          <span className="wfc-journey-card-build-icon is-built" aria-label="Built">
            <Check size={11} strokeWidth={2.5} />
          </span>
        )}
        {!buildStatus && rationale && (
          <button
            ref={whyButtonRef}
            type="button"
            className={`wfc-journey-card-why ${whyOpen ? "is-open" : ""}`}
            aria-label="Why this experience?"
            aria-expanded={whyOpen}
            onClick={(e) => {
              e.stopPropagation()
              setWhyOpen((v) => !v)
            }}
          >
            <HelpCircle size={12} strokeWidth={1.8} />
          </button>
        )}
        {!buildStatus && !rationale && (
          <span
            className={`wfc-journey-card-confidence ${confidenceClass}`}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="wfc-journey-card-title">{card.title}</div>
      {priorityMeta && !buildStatus && (
        <div className={`wfc-journey-card-priority ${priorityClass}`}>
          <span className="wfc-journey-card-priority-dot" aria-hidden="true" />
          <span className="wfc-journey-card-priority-label">{priorityMeta.label}</span>
        </div>
      )}

      {whyOpen && rationale && mounted && popoverPos && createPortal(
        <div
          ref={popoverRef}
          className="wfc-why-popover"
          role="dialog"
          aria-label="Why this experience?"
          style={{ top: popoverPos.top, left: popoverPos.left, width: POPOVER_WIDTH }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="wfc-why-head">
            <span className="wfc-why-title">Why this {label.toLowerCase()}</span>
            <button
              type="button"
              className="wfc-why-close"
              aria-label="Close"
              onClick={(e) => {
                e.stopPropagation()
                setWhyOpen(false)
              }}
            >
              <X size={11} strokeWidth={2.2} />
            </button>
          </div>
          {priorityMeta && (
            <div className={`wfc-why-priority ${priorityClass}`}>
              <span className="wfc-why-priority-dot" aria-hidden="true" />
              <div className="wfc-why-priority-text">
                <span className="wfc-why-priority-label">{priorityMeta.label}</span>
                <span className="wfc-why-priority-tone">{priorityMeta.tone}</span>
              </div>
            </div>
          )}
          <div className="wfc-why-section">
            <div className="wfc-why-section-label">What the team gets</div>
            <p className="wfc-why-section-body">{rationale.why}</p>
          </div>
          <div className="wfc-why-section">
            <div className="wfc-why-section-label">Why here in the sequence</div>
            <p className="wfc-why-section-body">{rationale.why_here}</p>
          </div>
          <div className="wfc-why-source">
            <FileText size={10} strokeWidth={1.8} />
            <span>{rationale.source}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
