"use client"

import { ChevronRight } from "lucide-react"
import { JourneyCard } from "./journey-card"
import type { Journey, JourneyCard as Card } from "../_state/types"

// Each card type maps to a fixed lifecycle stage. The label only renders
// for cards that are still in the journey — orphan labels disappear.
const LIFECYCLE_BY_TYPE: Record<Card["type"], string> = {
  popup:    "Announce",
  flow:     "Configure",
  smarttip: "Use",
  article:  "Reference",
}

interface Props {
  journey: Journey
  selectedId: string
  onSelect: (id: string) => void
  removingId?: string | null
  buildStatuses?: Record<string, "queued" | "building" | "built">
}

export function JourneyRibbon({ journey, selectedId, onSelect, removingId, buildStatuses }: Props) {
  return (
    <div className="wfc-ribbon-wrap">
      <div className="wfc-ribbon-lifecycle" aria-hidden="true">
        {journey.cards.map((card, i) => (
          <div key={`label-${card.id}`} className="wfc-ribbon-row">
            <div
              className="wfc-ribbon-lifecycle-cell wfc-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span>{LIFECYCLE_BY_TYPE[card.type]}</span>
            </div>
            {i < journey.cards.length - 1 && (
              <span className="wfc-ribbon-lifecycle-spacer" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>

      <div className="wfc-ribbon">
        {journey.cards.map((card, i) => (
          <div key={card.id} className="wfc-ribbon-row">
            <JourneyCard
              card={card}
              selected={card.id === selectedId}
              onSelect={() => onSelect(card.id)}
              index={i}
              isRemoving={card.id === removingId}
              buildStatus={buildStatuses?.[card.id]}
            />
            {i < journey.cards.length - 1 && (
              <ChevronRight
                size={14}
                strokeWidth={1.6}
                className="wfc-ribbon-chevron wfc-fade-up"
                style={{ animationDelay: `${i * 80 + 40}ms` }}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
