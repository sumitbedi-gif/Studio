"use client"

import { useState } from "react"
import { ChevronDown, Sparkles } from "lucide-react"

export interface RationaleItem {
  question: string
  answer: string
}

interface Props {
  items: RationaleItem[]
}

export function RationalePanel({ items }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`wfc-rationale ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="wfc-rationale-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Sparkles size={12} strokeWidth={1.8} />
        <span>Why this?</span>
        <ChevronDown
          size={13}
          strokeWidth={1.8}
          className="wfc-rationale-chev"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      {open && (
        <div className="wfc-rationale-body wfc-fade-up">
          {items.map((it, i) => (
            <div key={i} className="wfc-rationale-item">
              <div className="wfc-rationale-q">{it.question}</div>
              <div className="wfc-rationale-a">{it.answer}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
