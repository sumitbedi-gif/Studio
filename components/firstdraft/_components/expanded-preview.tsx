"use client"

import { useState } from "react"
import { Pencil, RefreshCw, Trash2, LayoutTemplate, Route, Lightbulb, FileText, FileSearch, X } from "lucide-react"
import type { JourneyCard } from "../_state/types"
import { PopupPreview } from "./popup-preview"
import { ArticlePreview } from "./article-preview"
import { FlowPreview } from "./flow-preview"
import { SmartTipPreview } from "./smarttip-preview"
import { requestChatRefine, requestCardDelete } from "../_state/edit-bus"

const TYPE_META = {
  popup: {
    label: "Pop-up", Icon: LayoutTemplate, page: 3, num: "2.1", heading: "Purchase Requisitions",
    lead: "Any employee can initiate a purchase. Before a supplier can be engaged, the need must be captured as a formal requisition in the Procurement portal.",
    mark: "All purchases above $500 must begin with a purchase requisition raised in the Procurement portal.",
    tail: "The requestor selects the cost center, adds line items, and attaches a supplier quote before submitting for manager approval.",
  },
  flow: {
    label: "Flow", Icon: Route, page: 5, num: "3.0", heading: "Approval Matrix",
    lead: "Every requisition is routed for approval based on its total amount and the cost center it is charged against.",
    mark: "Requisitions are approved in tiers: up to $5,000 by the Cost Center Manager, up to $25,000 by the Finance Approver, and above $25,000 by the VP of Finance.",
    tail: "Each approver can approve, reject with a reason, or request changes. A rejected requisition returns to the requestor; a change request reopens it for editing.",
  },
  smarttip: {
    label: "Smart Tip", Icon: Lightbulb, page: 7, num: "4.2", heading: "PO Generation",
    lead: "Once a requisition clears the approval matrix, Procurement converts it into a purchase order.",
    mark: "An approved requisition is converted into a purchase order, assigned a PO number, and dispatched to the supplier from the Procurement portal.",
    tail: "The supplier, line items, and amounts carry over from the requisition, so nothing is re-keyed.",
  },
  article: {
    label: "Article", Icon: FileText, page: 9, num: "5.1", heading: "Three-Way Match",
    lead: "Before any supplier invoice is paid, Accounts Payable verifies that what was ordered, received, and billed all agree.",
    mark: "Payment is released only after a successful three-way match between the purchase order, the goods receipt, and the supplier invoice.",
    tail: "If the three documents do not match within tolerance, the invoice is placed on hold and routed to Procurement.",
  },
} as const

// The source document the plan was drafted from (same SOP across the demo).
const SOURCE_DOC = { name: "Procure-to-Pay SOP.pdf", url: "/Procure-to-Pay%20SOP.pdf", pages: 12 }

interface Props {
  card: JourneyCard
  onConfirmCard?: (cardId: string) => void
  /** Called when user clicks Refresh — cycles content variant for this card */
  onRefreshCard?: (cardId: string) => void
  /** Variant index: 0 = original, 1 = variant A, 2 = variant B (popup only) */
  variantIndex?: number
}

export function ExpandedPreview({ card, onConfirmCard, onRefreshCard, variantIndex = 0 }: Props) {
  const isVariant = variantIndex > 0
  const meta = TYPE_META[card.type]
  const { label, Icon } = meta
  const [shimmering, setShimmering] = useState(false)
  const [sourceOpen, setSourceOpen] = useState(false)

  const handleEdit = () => {
    requestChatRefine({
      cardId: card.id,
      cardType: card.type,
      label: `${label} · ${card.title}`,
    })
  }

  const handleRefresh = () => {
    if (shimmering) return
    setShimmering(true)
    // Mid-shimmer: swap content
    window.setTimeout(() => {
      onRefreshCard?.(card.id)
    }, 600)
    // End shimmer
    window.setTimeout(() => {
      setShimmering(false)
    }, 1200)
  }

  const handleDelete = () => {
    requestCardDelete({
      cardId: card.id,
      cardType: card.type,
      label: `${label} · ${card.title}`,
    })
  }

  return (
    <div className="wfc-expanded">
      {/* Header strip — type, title, toolbar */}
      <div className="wfc-expanded-head">
        <div className="wfc-expanded-head-title">
          <Icon size={15} strokeWidth={1.8} className="wfc-expanded-head-icon" />
          <span className="wfc-expanded-head-type">{label}</span>
          <span className="wfc-expanded-head-sep" aria-hidden="true">·</span>
          <span className="wfc-expanded-head-card-title">{card.title}</span>
        </div>
        <div className="wfc-expanded-head-toolbar">
          <button
            type="button"
            className="wfc-expanded-tool"
            aria-label="Refine this card in chat"
            title="Refine in chat"
            onClick={handleEdit}
          >
            <Pencil size={13} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className={`wfc-expanded-tool ${sourceOpen ? "is-on" : ""}`}
            aria-label="View the source document for this card"
            aria-pressed={sourceOpen}
            title={sourceOpen ? "Hide source" : "View source"}
            onClick={() => setSourceOpen((v) => !v)}
          >
            <FileSearch size={13} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="wfc-expanded-tool"
            aria-label="Regenerate this card"
            title="Regenerate"
            onClick={handleRefresh}
            disabled={shimmering}
          >
            <RefreshCw size={13} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            className="wfc-expanded-tool"
            aria-label="Remove this card from the journey"
            title="Remove"
            onClick={handleDelete}
          >
            <Trash2 size={13} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Preview body — overlay a shimmer when refreshing */}
      <div className="wfc-expanded-body" style={{ position: "relative" }}>
        {shimmering && <div className="wfc-refresh-shimmer" aria-hidden="true" />}
        {card.type === "popup"    && <PopupPreview card={card} variantIndex={variantIndex} />}
        {card.type === "article"  && <ArticlePreview card={card} isVariant={isVariant} />}
        {card.type === "flow"     && <FlowPreview card={card} />}
        {card.type === "smarttip" && (
          <SmartTipPreview
            card={card}
            isVariant={isVariant}
          />
        )}

        {/* Source — the section this card was drafted from, highlighted and
            scrollable inside the box (same approach as the chat drawer). The
            full PDF is one click away via "Open full PDF". */}
        {sourceOpen && (
          <div className="wfc-source-pane wfc-fade-up" role="dialog" aria-label="Source document">
            <div className="wfc-source-bar">
              <FileText size={13} strokeWidth={1.9} className="wfc-source-bar-icon" />
              <span className="wfc-source-bar-name">{SOURCE_DOC.name}</span>
              <span className="wfc-source-bar-sep" aria-hidden="true">·</span>
              <span className="wfc-source-bar-section">§{meta.num} {meta.heading}</span>
              <a className="wfc-source-bar-open" href={`${SOURCE_DOC.url}#page=${meta.page}`} target="_blank" rel="noreferrer">
                Open full PDF <span aria-hidden="true">↗</span>
              </a>
              <button type="button" className="wfc-source-bar-close" aria-label="Close source" onClick={() => setSourceOpen(false)}>
                <X size={14} strokeWidth={2} />
              </button>
            </div>
            <div className="wfc-source-legend">
              <span className="wfc-source-legend-swatch" aria-hidden="true" />
              Highlighted text is what this {label.toLowerCase()} was drafted from.
            </div>
            <div className="wfc-source-scroll">
              <div className="wfc-source-page">
                <div className="wfc-source-page-meta">{SOURCE_DOC.name.replace(".pdf", "")} · {meta.page} / {SOURCE_DOC.pages}</div>
                <h4 className="wfc-source-page-h"><span className="wfc-source-page-num">{meta.num}</span>{meta.heading}</h4>
                <p className="wfc-source-p"><mark className="wfc-source-mark">{meta.lead} {meta.mark}</mark></p>
                <p className="wfc-source-p"><mark className="wfc-source-mark">{meta.tail}</mark></p>
                <p className="wfc-source-p is-muted">
                  To complete this step, the responsible role opens the Procurement portal and works through the fields in order. Each entry is validated as it is captured, and the record cannot advance until every required field is present.
                </p>
                <ol className="wfc-source-list">
                  <li>Open the relevant record in the Procurement portal.</li>
                  <li>Confirm the cost center and supplier details.</li>
                  <li>Review the auto-calculated totals against the quote.</li>
                  <li>Submit for the next stage in the workflow.</li>
                </ol>
                <p className="wfc-source-p is-muted">
                  Records without a valid cost center are returned automatically. The full trail is retained for audit and can be exported from Reports at any time.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
