"use client"

import { useEffect, useState } from "react"
import type { JourneyCard } from "../_state/types"
import { SMARTTIP_VARIANT } from "../_state/mock-data"
import { InlineEdit } from "./inline-edit"

interface Props {
  card: Extract<JourneyCard, { type: "smarttip" }>
  isVariant?: boolean
}

/**
 * Smart Tip preview — Salesforce Opportunity close screen with a Smart Tip
 * anchored to the "Request Approval" button. Happy-path: one anchor, one tip,
 * editable title/body. No confidence banner, no alternative-placement toggle.
 */
export function SmartTipPreview({ card, isVariant }: Props) {
  const source = isVariant ? SMARTTIP_VARIANT : { title: card.title, body: card.body }
  const [title, setTitle] = useState(source.title)
  const [body, setBody] = useState(source.body)

  useEffect(() => {
    const src = isVariant ? SMARTTIP_VARIANT : { title: card.title, body: card.body }
    setTitle(src.title)
    setBody(src.body)
  }, [isVariant, card])

  return (
    <div className="wfc-preview-stage">
      {/* Salesforce Opportunity backdrop */}
      <div className="wfc-sf-mock wfc-sf-mock-opp wfc-sf-mock-crisp" aria-hidden="true">
        <div className="wfc-sf-header">
          <div className="wfc-sf-logo-dot" />
          <div className="wfc-sf-nav">
            <span>Home</span>
            <span>Opportunities</span>
            <span>Accounts</span>
          </div>
          <div className="wfc-sf-header-right">
            <div className="wfc-sf-avatar" />
          </div>
        </div>
        <div className="wfc-sf-opp-body">
          <div className="wfc-sf-opp-title" />
          <div className="wfc-sf-opp-meta">
            <div className="wfc-sf-opp-meta-cell" />
            <div className="wfc-sf-opp-meta-cell" />
            <div className="wfc-sf-opp-meta-cell" />
          </div>
          <div className="wfc-sf-opp-action-ribbon">
            <div className="wfc-sf-opp-btn ghost" />
            <div className="wfc-sf-opp-btn ghost" />
            <div className="wfc-sf-opp-btn target is-active-anchor">
              Request Approval
            </div>
            <div className="wfc-sf-opp-btn ghost" />
          </div>
          <div className="wfc-sf-opp-panel">
            <div className="wfc-sf-panel-head" />
            <div className="wfc-sf-panel-row" />
            <div className="wfc-sf-opp-link-row">
              <span className="wfc-sf-opp-link">
                Submit for approval
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Tip tooltip — anchored to the Request Approval button */}
      <div
        className="wfc-smarttip-tip wfc-smarttip-tip-bottom"
        style={{ bottom: "38%", left: "50%" }}
      >
        <div className="wfc-smarttip-tip-pointer" aria-hidden="true" />
        <InlineEdit
          as="div"
          className="wfc-smarttip-tip-title"
          value={title}
          onChange={setTitle}
          ariaLabel="Smart Tip title"
        />
        <InlineEdit
          as="div"
          className="wfc-smarttip-tip-body"
          value={body}
          onChange={setBody}
          multiline
          ariaLabel="Smart Tip body"
        />
      </div>
    </div>
  )
}
