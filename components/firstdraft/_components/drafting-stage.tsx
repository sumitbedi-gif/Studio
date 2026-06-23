"use client"

import { useEffect, useState } from "react"
import { LayoutTemplate, Route, Lightbulb, FileText, Loader2, Check } from "lucide-react"
import { ACTIVITY_STREAM, JOURNEY } from "../_state/mock-data"
import type { JourneyCard } from "../_state/types"

interface Props {
  onComplete: () => void
}

const TYPE_META = {
  popup:    { label: "POP-UP",     Icon: LayoutTemplate },
  flow:     { label: "FLOW",       Icon: Route },
  smarttip: { label: "SMART TIP",  Icon: Lightbulb },
  article:  { label: "ARTICLE",    Icon: FileText },
} as const

type SkeletonState = "pending" | "drafting" | "ready"

/**
 * Compact, human-readable "what's happening right now" line — derived from
 * the canonical ACTIVITY_STREAM so we don't duplicate copy.
 */
function getTickerText(entry: typeof ACTIVITY_STREAM[number] | undefined): string {
  if (!entry) return "Reading source…"
  if (entry.type === "main") return entry.text
  if (entry.type === "sub") return entry.text
  if (entry.type === "sub-list") return `Found ${entry.items.length} candidate intents`
  return entry.text
}

/**
 * Drafting surface — the "wait" between the user's answer and the plan reveal.
 *
 * Top: single rotating live-status ticker (always visible, never blank).
 * Bottom: four skeleton cards. Each transitions pending → drafting → ready
 * with a per-card spinner / checkmark indicator so progress is visible.
 */
export function DraftingStage({ onComplete }: Props) {
  const [tickerIndex, setTickerIndex] = useState(0)
  // `current` = the index of the card currently being drafted.
  // Cards with i < current are "ready", i === current is "drafting",
  // i > current aren't rendered yet (progressive disclosure).
  const [current, setCurrent] = useState(-1)

  // Drive the ticker through ACTIVITY_STREAM in lockstep with its declared delays.
  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = []
    ACTIVITY_STREAM.forEach((entry, i) => {
      timeouts.push(
        setTimeout(() => {
          setTickerIndex(i)
          if (i === ACTIVITY_STREAM.length - 1) {
            timeouts.push(setTimeout(onComplete, 900))
          }
        }, entry.delay)
      )
    })
    return () => { timeouts.forEach(clearTimeout) }
  }, [onComplete])

  // Skeleton-card progression — one card discloses at each beat.
  // Card 0 appears (drafting) at 1.6s → card 1 appears (card 0 becomes ready) at 2.8s → ...
  useEffect(() => {
    const beats: Array<[number, number]> = [
      [1600, 0],
      [2800, 1],
      [3900, 2],
      [4900, 3],
      [5800, 4], // all done — current bumps past the last index so card 3 transitions to "ready"
    ]
    const timers = beats.map(([delay, idx]) =>
      setTimeout(() => setCurrent(idx), delay)
    )
    return () => { timers.forEach(clearTimeout) }
  }, [])

  const tickerText = getTickerText(ACTIVITY_STREAM[tickerIndex])
  const isFinalBeat =
    ACTIVITY_STREAM[tickerIndex] && ACTIVITY_STREAM[tickerIndex].type === "done"

  return (
    <div className="wfc-drafting">
      <div className="wfc-drafting-head">
        <span className="wfc-drafting-spinner" aria-hidden="true">
          <Loader2 size={14} strokeWidth={2.2} className="wfc-spin" />
        </span>
        <span className="wfc-drafting-label">Drafting your plan</span>
        <span className="wfc-drafting-meta">{JOURNEY.cards.length} experiences</span>
      </div>

      {/* Live status ticker — single line, rotates with each activity beat */}
      <div className="wfc-drafting-ticker">
        <span className="wfc-drafting-ticker-dot" aria-hidden="true" />
        <span
          className={`wfc-drafting-ticker-text ${isFinalBeat ? "is-done" : ""}`}
          key={tickerText}
        >
          {tickerText}
        </span>
      </div>

      <div className="wfc-drafting-divider" aria-hidden="true" />

      {/* Skeleton journey ribbon — cards disclose progressively, one at a time. */}
      <div className="wfc-drafting-grid">
        {JOURNEY.cards.map((card, i) => {
          // Don't render at all until this card is being drafted.
          if (i > current) return null
          const state: SkeletonState = i < current ? "ready" : "drafting"
          return (
            <SkeletonCard key={card.id} card={card} state={state} index={i} />
          )
        })}
      </div>
    </div>
  )
}

function SkeletonCard({
  card, state,
}: {
  card: JourneyCard
  state: SkeletonState
  index: number
}) {
  const { label, Icon } = TYPE_META[card.type]
  return (
    <div className={`wfc-skeleton-card wfc-skeleton-${state} wfc-fade-up`}>
      <div className="wfc-skeleton-head">
        <Icon size={13} strokeWidth={1.8} className="wfc-skeleton-icon" />
        <span className="wfc-skeleton-type">{label}</span>
        <span className="wfc-skeleton-status" aria-hidden="true">
          {state === "drafting" && (
            <Loader2 size={11} strokeWidth={2.2} className="wfc-spin" />
          )}
          {state === "ready" && (
            <Check size={11} strokeWidth={2.5} />
          )}
        </span>
      </div>
      <div className="wfc-skeleton-line wfc-skeleton-line-1" />
      <div className="wfc-skeleton-line wfc-skeleton-line-2" />
    </div>
  )
}
