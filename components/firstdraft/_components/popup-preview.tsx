"use client"

import { useEffect, useState } from "react"
import type { JourneyCard } from "../_state/types"
import { POPUP_VARIANT } from "../_state/mock-data"
import { InlineEdit } from "./inline-edit"

interface Props {
  card: Extract<JourneyCard, { type: "popup" }>
  /** Refresh-variant index: 0 = original, 1 = text+hero variant A, 2 = original text + hero variant B. */
  variantIndex?: number
}

// Hero image per variant. Two distinct images plus the original.
const HERO_BY_INDEX = [
  "/images/salesforce-bear.webp",
  "/images/article-hero.jpg",
  "/images/popup-hero-variant2.webp",
] as const

/**
 * Pop-up preview — renders the announce moment.
 * Background: faded Salesforce-style mock home screen.
 * Foreground: editable popup card with hero illustration bleeding to top edge.
 * Refresh cycles through three hero images; text content swaps for index 1 only.
 */
export function PopupPreview({ card, variantIndex = 0 }: Props) {
  // Text content: index 1 uses POPUP_VARIANT, indices 0 and 2 use original copy.
  // (Image-only refresh on index 2 lets the demo show "same message, different art.")
  const initial = variantIndex === 1
    ? POPUP_VARIANT
    : { title: card.title, body: card.body, cta: card.cta }

  const [title, setTitle] = useState(initial.title)
  const [body, setBody] = useState(initial.body)
  const [ctaPrimary, setCtaPrimary] = useState(initial.cta.primary)
  const [ctaSecondary, setCtaSecondary] = useState(initial.cta.secondary)

  useEffect(() => {
    const src = variantIndex === 1
      ? POPUP_VARIANT
      : { title: card.title, body: card.body, cta: card.cta }
    setTitle(src.title)
    setBody(src.body)
    setCtaPrimary(src.cta.primary)
    setCtaSecondary(src.cta.secondary)
  }, [variantIndex, card])

  const heroSrc = HERO_BY_INDEX[variantIndex] ?? HERO_BY_INDEX[0]

  return (
    <div className="wfc-preview-stage">
      {/* Faded Salesforce-style backdrop */}
      <div className="wfc-sf-mock" aria-hidden="true">
        <div className="wfc-sf-header">
          <div className="wfc-sf-logo-dot" />
          <div className="wfc-sf-nav">
            <span>Home</span>
            <span>Accounts</span>
            <span>Opportunities</span>
            <span>Leads</span>
            <span>Reports</span>
          </div>
          <div className="wfc-sf-header-right">
            <div className="wfc-sf-avatar" />
          </div>
        </div>
        <div className="wfc-sf-body">
          <div className="wfc-sf-panel">
            <div className="wfc-sf-panel-head" />
            <div className="wfc-sf-panel-row" />
            <div className="wfc-sf-panel-row" />
            <div className="wfc-sf-panel-row short" />
          </div>
          <div className="wfc-sf-panel">
            <div className="wfc-sf-panel-head" />
            <div className="wfc-sf-panel-row" />
            <div className="wfc-sf-panel-row short" />
          </div>
        </div>
      </div>

      {/* The actual popup card — hero illustration on top, editable content below */}
      <div className="wfc-popup-card">
        <div className="wfc-popup-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroSrc} alt="" />
        </div>
        <div className="wfc-popup-content">
          <InlineEdit
            as="div"
            className="wfc-popup-title"
            value={title}
            onChange={setTitle}
            ariaLabel="Pop-up title"
          />
          <InlineEdit
            as="div"
            className="wfc-popup-body"
            value={body}
            onChange={setBody}
            multiline
            ariaLabel="Pop-up body"
          />
          <div className="wfc-popup-actions">
            <button type="button" className="wfc-popup-cta-primary">
              <InlineEdit
                as="span"
                value={ctaPrimary}
                onChange={setCtaPrimary}
                ariaLabel="Primary CTA"
              />
            </button>
            <button type="button" className="wfc-popup-cta-secondary">
              <InlineEdit
                as="span"
                value={ctaSecondary}
                onChange={setCtaSecondary}
                ariaLabel="Secondary CTA"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
