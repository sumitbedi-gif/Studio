"use client"

import { useEffect, useState } from "react"
import type { JourneyCard } from "../_state/types"
import { ARTICLE_VARIANT_SECTIONS } from "../_state/mock-data"
import { InlineEdit } from "./inline-edit"

interface Props {
  card: Extract<JourneyCard, { type: "article" }>
  isVariant?: boolean
}

export function ArticlePreview({ card, isVariant }: Props) {
  const initialSections = isVariant ? ARTICLE_VARIANT_SECTIONS : card.sections
  const [title, setTitle] = useState(card.title)
  const [sections, setSections] = useState(initialSections)

  useEffect(() => {
    setSections(isVariant ? ARTICLE_VARIANT_SECTIONS : card.sections)
    setTitle(card.title)
  }, [isVariant, card])

  const updateSection = (i: number, patch: Partial<{ heading: string; body: string }>) => {
    setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  }

  return (
    <article className="wfc-article">
      <div className="wfc-article-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/article-hero.jpg" alt="" />
      </div>
      <div className="wfc-article-meta">
        <span>Help Center</span>
        <span className="wfc-article-meta-dot" aria-hidden="true">·</span>
        <span>2 min read</span>
      </div>
      <InlineEdit
        as="h1"
        className="wfc-article-title"
        value={title}
        onChange={setTitle}
        ariaLabel="Article title"
      />
      <hr className="wfc-article-rule" />
      <div className="wfc-article-body">
        {sections.map((section, i) => (
          <section key={i} className="wfc-article-section">
            <InlineEdit
              as="h2"
              className="wfc-article-heading"
              value={section.heading}
              onChange={(v) => updateSection(i, { heading: v })}
              ariaLabel={`Section ${i + 1} heading`}
            />
            <InlineEdit
              as="p"
              className="wfc-article-para"
              value={section.body}
              onChange={(v) => updateSection(i, { body: v })}
              multiline
              ariaLabel={`Section ${i + 1} body`}
            />
          </section>
        ))}
      </div>
    </article>
  )
}
