"use client"

import { useEffect } from "react"
import { ArrowRight } from "lucide-react"
import { ConfettiBurst } from "./confetti-burst"

interface Props {
  experienceCount: number
  onGoToDraft: () => void
  onDismiss: () => void
}

/**
 * Build-complete celebration modal. Fires once when the build finishes:
 * confetti burst at mount + animated check-ring drawing, then headline,
 * meta, and two-button row. Escape and backdrop click also dismiss.
 *
 * Sits over the chat + canvas; the build summary card in chat remains
 * intact behind it, so dismissing returns the user to the same state.
 */
export function CompletionModal({ experienceCount, onGoToDraft, onDismiss }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onDismiss])

  return (
    <div
      className="wfc-completion-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onDismiss()
      }}
    >
      <div
        className="wfc-completion-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wfc-completion-title"
      >
        {/* Confetti burst emanates from the top of the modal */}
        <div className="wfc-completion-confetti-anchor">
          <ConfettiBurst />
        </div>

        {/* Animated check ring */}
        <div className="wfc-completion-check" aria-hidden="true">
          <svg viewBox="0 0 60 60" width="60" height="60">
            <circle
              cx="30" cy="30" r="27"
              fill="none"
              stroke="#16A34A"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="wfc-completion-check-ring"
            />
            <path
              d="M 18 31 L 27 39 L 43 22"
              fill="none"
              stroke="#16A34A"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="wfc-completion-check-mark"
            />
          </svg>
        </div>

        <h2 id="wfc-completion-title" className="wfc-completion-title">
          Content created
        </h2>
        <p className="wfc-completion-meta">
          {experienceCount} {experienceCount === 1 ? "experience" : "experiences"}, ready for you to review and ship.
        </p>

        <div className="wfc-completion-actions">
          <button
            type="button"
            className="wfc-completion-secondary"
            onClick={onDismiss}
          >
            Stay here
          </button>
          <button
            type="button"
            className="wfc-completion-primary"
            onClick={onGoToDraft}
            autoFocus
          >
            <span>Go to Draft</span>
            <ArrowRight size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
