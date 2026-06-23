"use client"

import { useEffect, useRef, useState } from "react"
import { Pencil, MinusCircle } from "lucide-react"
import type { JourneyCard, FlowStep } from "../_state/types"
import { InlineEdit } from "./inline-edit"
import { requestChatRefine } from "../_state/edit-bus"

interface Props {
  card: Extract<JourneyCard, { type: "flow" }>
}

type Placement = "below" | "above" | "right"

// One anchor per step: where the highlight ring sits on the mock, and where
// the tooltip body sits relative to it (with which side facing the anchor).
type Anchor = {
  top: string
  left: string
  tipTop: string
  tipLeft: string
  placement: Placement
}

// Each frame's anchor mapping. Coordinates are in %, anchored to the .wfc-sb-frame.
// 16 unique positions across the Salesforce Setup mock.
const ANCHORS: Anchor[] = [
  { top: "12%", left: "94%", tipTop: "30%", tipLeft: "70%", placement: "below" },   // 1. Setup gear
  { top: "30%", left: "12%", tipTop: "44%", tipLeft: "22%", placement: "below" },   // 2. Setup search
  { top: "62%", left: "13%", tipTop: "60%", tipLeft: "28%", placement: "right" },   // 3. Approval Bot menu
  { top: "60%", left: "78%", tipTop: "72%", tipLeft: "52%", placement: "above" },   // 4. Enable toggle
  { top: "38%", left: "58%", tipTop: "52%", tipLeft: "38%", placement: "below" },   // 5. Rule type dropdown
  { top: "46%", left: "58%", tipTop: "60%", tipLeft: "38%", placement: "below" },   // 6. Amount threshold
  { top: "54%", left: "58%", tipTop: "68%", tipLeft: "38%", placement: "below" },   // 7. Approver field
  { top: "60%", left: "78%", tipTop: "44%", tipLeft: "52%", placement: "above" },   // 8. Escalation timer
  { top: "68%", left: "58%", tipTop: "54%", tipLeft: "38%", placement: "above" },   // 9. Fallback approver
  { top: "60%", left: "78%", tipTop: "72%", tipLeft: "52%", placement: "above" },   // 10. Notification settings
  { top: "60%", left: "78%", tipTop: "44%", tipLeft: "52%", placement: "above" },   // 11. Audit log toggle
  { top: "46%", left: "58%", tipTop: "62%", tipLeft: "38%", placement: "below" },   // 12. Test deal button
  { top: "54%", left: "58%", tipTop: "68%", tipLeft: "38%", placement: "below" },   // 13. Test result panel
  { top: "46%", left: "78%", tipTop: "62%", tipLeft: "52%", placement: "below" },   // 14. Save button
  { top: "60%", left: "78%", tipTop: "44%", tipLeft: "52%", placement: "above" },   // 15. Activate switch
  { top: "20%", left: "55%", tipTop: "38%", tipLeft: "38%", placement: "below" },   // 16. Confirmation banner
]

export function FlowPreview({ card }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [activeStep, setActiveStep] = useState(1)
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set([0]))
  const [removedSteps, setRemovedSteps] = useState<Set<number>>(new Set())

  const visibleStepsList = card.steps.filter((_, i) => !removedSteps.has(i))
  const total = visibleStepsList.length

  const removeStep = (originalIndex: number) => {
    setRemovedSteps((prev) => {
      const next = new Set(prev)
      next.add(originalIndex)
      return next
    })
  }

  // Track active step (sticky counter) + which frames have entered view (entry animation).
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const frames = scroller.querySelectorAll<HTMLDivElement>("[data-step-index]")

    // Most-centered frame drives the sticky counter
    const centerObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) {
          const idx = Number(visible.target.getAttribute("data-step-index"))
          if (!Number.isNaN(idx)) setActiveStep(idx + 1)
        }
      },
      { root: scroller, threshold: [0.5, 0.75, 1] }
    )

    // Lower threshold for "has entered view" → triggers the tooltip entry animation
    const enterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number(e.target.getAttribute("data-step-index"))
            if (!Number.isNaN(idx)) {
              setVisibleSteps((prev) => {
                if (prev.has(idx)) return prev
                const next = new Set(prev)
                next.add(idx)
                return next
              })
            }
          }
        })
      },
      { root: scroller, threshold: 0.25 }
    )

    frames.forEach((el) => {
      centerObserver.observe(el)
      enterObserver.observe(el)
    })
    return () => {
      centerObserver.disconnect()
      enterObserver.disconnect()
    }
  }, [])

  return (
    <div className="wfc-flow-storyboard">
      {/* Sticky step counter at the top of the storyboard */}
      <div className="wfc-sb-progress" aria-live="polite">
        <span className="wfc-sb-progress-label">Step {activeStep} of {total}</span>
        <div className="wfc-sb-progress-track" aria-hidden="true">
          <div
            className="wfc-sb-progress-fill"
            style={{ width: `${(activeStep / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="wfc-sb-scroller" ref={scrollerRef}>
        {card.steps.map((step, i) => {
          if (removedSteps.has(i)) return null
          // displayIndex = position among visible steps (for "Step N of total")
          const displayIndex = card.steps
            .slice(0, i)
            .filter((_, k) => !removedSteps.has(k)).length
          return (
            <Frame
              key={step.num}
              step={step}
              originalIndex={i}
              index={displayIndex}
              total={total}
              anchor={ANCHORS[i] ?? ANCHORS[0]}
              isVisible={visibleSteps.has(i)}
              cardId={card.id}
              onRemove={() => removeStep(i)}
            />
          )
        })}
      </div>
    </div>
  )
}

function Frame({
  step, index, originalIndex, total, anchor, isVisible, cardId, onRemove,
}: {
  step: FlowStep
  index: number          // position among visible steps
  originalIndex: number  // position in canonical card.steps
  total: number
  anchor: Anchor
  isVisible: boolean
  cardId: string
  onRemove: () => void
}) {
  const [title, setTitle] = useState(step.title)
  const [body, setBody] = useState(step.body)

  // Reset if the source step changes (e.g. refresh)
  useEffect(() => {
    setTitle(step.title)
    setBody(step.body)
  }, [step])

  const handleEditStep = () => {
    requestChatRefine({
      cardId,
      cardType: "flow",
      label: `Flow · ${title}`,
      subLabel: `Step ${index + 1} of ${total}`,
    })
  }

  return (
    <div className={`wfc-sb-frame ${isVisible ? "is-visible" : ""}`} data-step-index={originalIndex}>
      <div className="wfc-sb-frame-stage">
        {/* Salesforce Setup backdrop */}
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

        {/* Tooltip — sits at the anchor with the right pointer direction */}
        <div
          className={`wfc-flow-tooltip wfc-flow-tooltip-${anchor.placement}`}
          style={{ top: anchor.tipTop, left: anchor.tipLeft }}
        >
          <div className="wfc-flow-tooltip-pointer" aria-hidden="true" />
          <div className="wfc-flow-tooltip-head">
            <span className="wfc-flow-tooltip-chip">
              {String(index + 1).padStart(2, "0")}<span className="wfc-flow-tooltip-chip-sep">/</span>{total}
            </span>
            <span className="wfc-flow-tooltip-anchor">{step.anchorLabel}</span>
          </div>
          <InlineEdit
            as="div"
            className="wfc-flow-tooltip-title"
            value={title}
            onChange={setTitle}
            ariaLabel={`Step ${index + 1} title`}
          />
          <InlineEdit
            as="div"
            className="wfc-flow-tooltip-body"
            value={body}
            onChange={setBody}
            multiline
            ariaLabel={`Step ${index + 1} body`}
          />
        </div>
      </div>

      {/* Per-frame caption strip — step number + title + per-frame controls */}
      <div className="wfc-sb-frame-caption">
        <span className="wfc-sb-frame-num">{String(index + 1).padStart(2, "0")}</span>
        <span className="wfc-sb-frame-title">{title}</span>
        <div className="wfc-sb-frame-actions">
          <button
            type="button"
            className="wfc-sb-frame-edit"
            aria-label={`Refine step ${index + 1} in chat`}
            title="Refine in chat"
            onClick={handleEditStep}
          >
            <Pencil size={12} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="wfc-sb-frame-edit"
            aria-label={`Remove step ${index + 1} from the flow`}
            title="Remove this step"
            onClick={onRemove}
          >
            <MinusCircle size={12} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  )
}
