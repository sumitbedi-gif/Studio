"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Plus, Mic, ArrowUp, FileText, X, RotateCcw, Folder, Video, Library, FileType2 } from "lucide-react"
import { CANONICAL_FILE, TEMPLATE_CARDS } from "../_state/mock-data"
import type { BrandKit } from "../_state/types"

/**
 * Items that appear in the slash-menu library. Mix of recorded videos and
 * reference docs so the menu reads as a real "everything you've added" surface.
 * `kind` drives the glyph (video play vs. doc icon) and the meta line
 * (duration vs. size).
 */
type LibraryKind = "video" | "doc"
type LibraryItem = {
  id: string
  name: string
  kind: LibraryKind
  meta: string
  description: string
}

const LIBRARY: LibraryItem[] = [
  {
    id: "vid-approval-walkthrough",
    name: "Approval-Bot-walkthrough.mp4",
    kind: "video",
    meta: "2:34",
    description: "Recorded demo of the approval routing flow",
  },
  {
    id: "vid-rollout-recording",
    name: "Q1-rollout-recording.webm",
    kind: "video",
    meta: "4:11",
    description: "Field team kickoff with leadership",
  },
  {
    id: "vid-sales-onboarding",
    name: "Sales-rep-onboarding-flow.mp4",
    kind: "video",
    meta: "3:48",
    description: "Walks a new rep through their first deal",
  },
  {
    id: "doc-brand-voice",
    name: "Brand-voice-style-guide.pdf",
    kind: "doc",
    meta: "184 KB",
    description: "Tone, vocabulary, and writing conventions",
  },
  {
    id: "doc-okrs-fy26",
    name: "OKRs-FY26.docx",
    kind: "doc",
    meta: "92 KB",
    description: "Quarterly objectives for the GTM team",
  },
]

/**
 * Returns the time-of-day prefix. Every hour gets one — the headline always
 * reads as time-aware so the demo lands no matter when it's shown.
 */
function useTimeGreeting(): string {
  return useMemo(() => {
    const h = new Date().getHours()
    if (h >= 7 && h < 11) return "Morning"
    if (h >= 11 && h < 16) return "Afternoon"
    if (h >= 16 && h < 19) return "Evening"
    return "Working late" // 19:00–07:00 (covers dawn through late night)
  }, [])
}

/**
 * Returns the time-of-day bucket as a CSS data-attribute value. Drives a
 * very subtle warm/cool background tint. Aligned with useTimeGreeting().
 */
function useTimeOfDay(): "morning" | "afternoon" | "evening" | "late" {
  return useMemo(() => {
    const h = new Date().getHours()
    if (h >= 7 && h < 11) return "morning"
    if (h >= 11 && h < 16) return "afternoon"
    if (h >= 16 && h < 19) return "evening"
    return "late"
  }, [])
}

interface Props {
  hasOnboarded: boolean
  context: {
    brandKit: BrandKit | null
    rules: string[]
    connectors: string[]
  }
  onSubmit: (prompt: string, attachedFile: string | null) => void
  onOpenSettings: () => void
  onReset: () => void
}

export function EmptyState({ hasOnboarded, context, onSubmit, onOpenSettings, onReset }: Props) {
  const [prompt, setPrompt] = useState("")
  const [attachedFile, setAttachedFile] = useState<string | null>(null)
  const [voicePulse, setVoicePulse] = useState(false)
  const [composerFocused, setComposerFocused] = useState(false)
  // Slash-menu state. Opens when the textarea is empty + the user types "/".
  // Text after the "/" filters the library list. Highlighted index is keyboard-
  // navigable (Up/Down) and tracks mouse hover.
  const [slashOpen, setSlashOpen] = useState(false)
  const [slashQuery, setSlashQuery] = useState("")
  const [slashIndex, setSlashIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const slashMenuRef = useRef<HTMLDivElement | null>(null)
  const greeting = useTimeGreeting()
  const timeOfDay = useTimeOfDay()

  const canSend = prompt.trim().length > 0

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${ta.scrollHeight}px`
  }, [prompt])

  const handleAttach = () => {
    setAttachedFile(CANONICAL_FILE.name)
  }

  const handleVoice = () => {
    setVoicePulse(true)
    setTimeout(() => setVoicePulse(false), 480)
  }

  const handleTemplate = (text: string) => {
    setPrompt(text)
    textareaRef.current?.focus()
  }

  const handleSend = () => {
    if (!canSend) return
    onSubmit(prompt.trim(), attachedFile)
  }

  // Filter library by everything typed after the "/" — case-insensitive
  // substring match on name OR description so the menu narrows naturally as
  // the user keeps typing.
  const filteredLibrary = useMemo(() => {
    const q = slashQuery.trim().toLowerCase()
    if (!q) return LIBRARY
    return LIBRARY.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q),
    )
  }, [slashQuery])

  // Clamp the highlighted index whenever the filtered list changes so the
  // arrow keys never point at a missing row.
  useEffect(() => {
    if (slashIndex >= filteredLibrary.length) {
      setSlashIndex(Math.max(0, filteredLibrary.length - 1))
    }
  }, [filteredLibrary.length, slashIndex])

  // Dismiss the slash menu on outside click.
  useEffect(() => {
    if (!slashOpen) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (
        slashMenuRef.current?.contains(t) ||
        textareaRef.current?.contains(t)
      ) return
      setSlashOpen(false)
    }
    window.addEventListener("mousedown", onDown)
    return () => window.removeEventListener("mousedown", onDown)
  }, [slashOpen])

  const selectLibraryItem = (item: LibraryItem) => {
    setAttachedFile(item.name)
    setPrompt("")
    setSlashOpen(false)
    setSlashQuery("")
    setSlashIndex(0)
    // Refocus the composer so the user can keep typing their prompt.
    window.setTimeout(() => textareaRef.current?.focus(), 0)
  }

  // Drive slash-menu open/close + query from the textarea contents. The menu
  // opens when the input starts with "/"; the substring after the "/" is the
  // query. Typing anything that breaks the leading-slash rule closes it.
  const handlePromptChange = (next: string) => {
    setPrompt(next)
    if (next.startsWith("/")) {
      setSlashOpen(true)
      setSlashQuery(next.slice(1))
      setSlashIndex(0)
    } else if (slashOpen) {
      setSlashOpen(false)
      setSlashQuery("")
    }
  }

  // Brand initial for the project badge (first letter of the kit name) —
  // falls back to a folder glyph if no kit is connected.
  const brandInitial = context.brandKit?.name?.[0]?.toUpperCase() ?? null

  return (
    <div className="wfc-empty-page" data-tod={timeOfDay}>
      <div className="wfc-empty-shell">
        <div className="wfc-empty-stack">
          <h1 className="wfc-empty-headline wfc-fade-up" style={{ animationDelay: "60ms" }}>
            {greeting && (
              <span className="wfc-empty-greeting">{greeting}. </span>
            )}
            What are we drafting today?
          </h1>
          <p className="wfc-empty-sub wfc-fade-up" style={{ animationDelay: "140ms" }}>
            Drop a doc, point at a connector, or describe what just landed.
          </p>

          {/* Composer — pill shape, generous breathing room.
              Action row carries the project chip (replaces the bottom-of-page
              context pill) alongside attach/voice. */}
          <div
            className={`wfc-composer wfc-fade-up ${
              composerFocused && !prompt.trim() ? "is-listening" : ""
            } ${composerFocused ? "is-focused" : ""}`}
            style={{ animationDelay: "260ms" }}
          >
            {/* Slash menu — opens above the composer when the user types "/"
                in an otherwise-empty input. Lists items from the demo library;
                selecting one attaches its file name and clears the prompt. */}
            {slashOpen && (
              <div
                ref={slashMenuRef}
                className="wfc-slash-menu"
                role="listbox"
                aria-label="My library"
              >
                <div className="wfc-slash-head">
                  <Library size={12} strokeWidth={1.8} className="wfc-slash-head-icon" />
                  <span className="wfc-slash-head-label">My library</span>
                  {filteredLibrary.length > 0 && (
                    <span className="wfc-slash-head-count">
                      {filteredLibrary.length}
                    </span>
                  )}
                </div>
                {filteredLibrary.length === 0 ? (
                  <div className="wfc-slash-empty">
                    Nothing matches &ldquo;{slashQuery}&rdquo; in your library yet.
                  </div>
                ) : (
                  <ul className="wfc-slash-list">
                    {filteredLibrary.map((item, i) => {
                      const isActive = i === slashIndex
                      return (
                        <li
                          key={item.id}
                          className={`wfc-slash-item ${isActive ? "is-active" : ""}`}
                          role="option"
                          aria-selected={isActive}
                          onMouseEnter={() => setSlashIndex(i)}
                          onMouseDown={(e) => {
                            // Prevent the textarea from losing focus before
                            // the click registers — otherwise mousedown ->
                            // blur -> outside-click would race.
                            e.preventDefault()
                            selectLibraryItem(item)
                          }}
                        >
                          <span className={`wfc-slash-icon is-${item.kind}`} aria-hidden="true">
                            {item.kind === "video"
                              ? <Video size={13} strokeWidth={1.8} />
                              : item.name.endsWith(".pdf")
                                ? <FileText size={13} strokeWidth={1.8} />
                                : <FileType2 size={13} strokeWidth={1.8} />}
                          </span>
                          <span className="wfc-slash-text">
                            <span className="wfc-slash-name">{item.name}</span>
                            <span className="wfc-slash-desc">{item.description}</span>
                          </span>
                          <span className="wfc-slash-meta">{item.meta}</span>
                        </li>
                      )
                    })}
                  </ul>
                )}
                <div className="wfc-slash-foot">
                  <span className="wfc-slash-foot-key">↑↓</span>
                  <span>navigate</span>
                  <span className="wfc-slash-foot-sep" aria-hidden="true">·</span>
                  <span className="wfc-slash-foot-key">↵</span>
                  <span>attach</span>
                  <span className="wfc-slash-foot-sep" aria-hidden="true">·</span>
                  <span className="wfc-slash-foot-key">esc</span>
                  <span>close</span>
                </div>
              </div>
            )}

            {attachedFile && (
              <div className="wfc-composer-attachment">
                {/Mp4|webm|mov|m4v/i.test(attachedFile)
                  ? <Video size={13} strokeWidth={1.8} color="#6B697B" />
                  : <FileText size={13} strokeWidth={1.8} color="#6B697B" />}
                <span className="wfc-composer-attachment-name">{attachedFile}</span>
                <button
                  type="button"
                  className="wfc-composer-attachment-close"
                  aria-label="Remove attachment"
                  onClick={() => setAttachedFile(null)}
                >
                  <X size={12} strokeWidth={2} />
                </button>
              </div>
            )}

            <textarea
              ref={textareaRef}
              className="wfc-composer-textarea"
              placeholder="Describe what you want, paste a doc, or type / to pull from your library"
              value={prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              onFocus={() => setComposerFocused(true)}
              onBlur={() => setComposerFocused(false)}
              onKeyDown={(e) => {
                // While the slash menu is open, intercept nav keys so they
                // drive the highlighted row, not the textarea cursor.
                if (slashOpen && filteredLibrary.length > 0) {
                  if (e.key === "ArrowDown") {
                    e.preventDefault()
                    setSlashIndex((i) => (i + 1) % filteredLibrary.length)
                    return
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault()
                    setSlashIndex((i) => (i - 1 + filteredLibrary.length) % filteredLibrary.length)
                    return
                  }
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    selectLibraryItem(filteredLibrary[slashIndex])
                    return
                  }
                  if (e.key === "Escape") {
                    e.preventDefault()
                    setSlashOpen(false)
                    setSlashQuery("")
                    setPrompt("")
                    return
                  }
                }
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              rows={1}
            />
            <span className="wfc-composer-listening-dot" aria-hidden="true" />

            <div className="wfc-composer-row">
              <div className="wfc-composer-actions">
                <button
                  type="button"
                  className="wfc-mini-btn"
                  aria-label="Attach a file"
                  onClick={handleAttach}
                >
                  <Plus size={16} strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  className={`wfc-mini-btn ${voicePulse ? "wfc-pulse-once" : ""}`}
                  aria-label="Voice input, coming soon"
                  aria-disabled="true"
                  onClick={handleVoice}
                  title="Voice input · coming soon"
                >
                  <Mic size={16} strokeWidth={1.8} />
                </button>
              </div>

              <button
                type="button"
                className="wfc-send-btn"
                aria-label="Send"
                disabled={!canSend}
                onClick={handleSend}
              >
                <ArrowUp size={16} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Template cards — 2x2, transparent fill, hairline border.
              Title + short description per card. Diagonal arrow bottom-right. */}
          <div className="wfc-starter-section">
            <p
              className="wfc-starter-heading-label wfc-fade-up"
              style={{ animationDelay: "320ms" }}
            >
              Try these prompts
            </p>
            <div className="wfc-starter-grid">
              {TEMPLATE_CARDS.map((card, i) => (
                <button
                  key={card.id}
                  type="button"
                  className="wfc-starter-card wfc-fade-up"
                  style={{ animationDelay: `${380 + i * 60}ms` }}
                  onClick={() => handleTemplate(card.prompt)}
                >
                  <span className="wfc-starter-label">{card.label}</span>
                  <span className="wfc-starter-desc">{card.description}</span>
                  <span className="wfc-starter-arrow" aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top-right toolbar — Reset icon + labeled Project settings pill */}
      <div className="wfc-page-toolbar">
        <button
          type="button"
          className="wfc-toolbar-btn"
          aria-label="Reset demo"
          title="Reset demo — replays first-run experience"
          onClick={onReset}
        >
          <RotateCcw size={15} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          className="wfc-toolbar-project"
          onClick={onOpenSettings}
          title="Edit project context"
        >
          {hasOnboarded && brandInitial ? (
            <span className="wfc-toolbar-project-mark">{brandInitial}</span>
          ) : (
            <Folder size={13} strokeWidth={1.8} />
          )}
          <span>Project settings</span>
        </button>
      </div>
    </div>
  )
}
