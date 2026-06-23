"use client"

import { useState, useRef, useEffect } from "react"
import { Bold, Italic, Underline, Type, Sparkles } from "lucide-react"

interface Props {
  value: string
  onChange: (v: string) => void
  className?: string
  as?: "p" | "h1" | "h2" | "h3" | "span" | "div"
  multiline?: boolean
  placeholder?: string
  ariaLabel?: string
}

/** Dummy color swatches — visual signal only. Real impl would carry a value. */
const COLOR_SWATCHES = [
  { name: "Default", color: "#1F1F32" },
  { name: "Blue",    color: "#0975D7" },
  { name: "Amber",   color: "#D97706" },
  { name: "Green",   color: "#15803D" },
  { name: "Red",     color: "#DC2626" },
]

/**
 * Inline-editable text. Renders as static text by default; clicking it makes
 * it contentEditable. Blur or Enter commits the change; Escape reverts. A
 * floating rich-text toolbar appears above the field while editing — bold /
 * italic / underline, font size, color swatches, and a Rewrite-with-AI
 * sparkle. The toolbar is dummy (no actual formatting applied) — it's a
 * surface-readiness signal, not a real editor.
 */
export function InlineEdit({
  value,
  onChange,
  className = "",
  as = "span",
  multiline = false,
  placeholder = "Click to edit",
  ariaLabel,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  // Local "active" formatting flags — dummy state for visual feedback only.
  // No real document.execCommand or formatted output; the surface just
  // needs to look responsive when the demo audience clicks the buttons.
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [underline, setUnderline] = useState(false)
  const [size, setSize] = useState<"S" | "M" | "L">("M")
  const [color, setColor] = useState<string>("#1F1F32")
  const [rewriting, setRewriting] = useState(false)
  const ref = useRef<HTMLElement | null>(null)

  // Keep draft in sync if value changes externally (e.g. refresh)
  useEffect(() => {
    if (!editing) setDraft(value)
  }, [value, editing])

  // Focus + select all when entering edit mode
  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus()
      // Select all text in the contentEditable node
      const range = document.createRange()
      range.selectNodeContents(ref.current)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [editing])

  // Reset toolbar state when exiting edit mode so a new edit session starts
  // from a clean slate (matches "every selection has its own style" intuition).
  useEffect(() => {
    if (!editing) {
      setBold(false)
      setItalic(false)
      setUnderline(false)
      setSize("M")
      setColor("#1F1F32")
      setRewriting(false)
    }
  }, [editing])

  const commit = () => {
    const next = (ref.current?.innerText ?? draft).trim()
    if (next && next !== value) onChange(next)
    setEditing(false)
  }

  const revert = () => {
    setEditing(false)
    if (ref.current) ref.current.innerText = value
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault()
      revert()
      return
    }
    if (e.key === "Enter" && !multiline) {
      e.preventDefault()
      commit()
    }
  }

  // Critical: any toolbar interaction must NOT pull focus from the editable,
  // otherwise blur fires and commits the edit + closes the toolbar. We
  // preventDefault on mousedown so the click never blurs the contentEditable.
  const swallowMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  const handleRewrite = () => {
    setRewriting(true)
    setTimeout(() => setRewriting(false), 900)
  }

  const Tag = as
  return (
    <span className="wfc-inline-edit-wrap">
      {editing && (
        <div
          className="wfc-inline-toolbar wfc-fade-up"
          role="toolbar"
          aria-label="Text formatting"
          onMouseDown={swallowMouseDown}
        >
          {/* Format toggles — purely visual */}
          <button
            type="button"
            className={`wfc-inline-tb-btn ${bold ? "is-on" : ""}`}
            aria-label="Bold"
            aria-pressed={bold}
            onClick={() => setBold((v) => !v)}
          >
            <Bold size={12} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            className={`wfc-inline-tb-btn ${italic ? "is-on" : ""}`}
            aria-label="Italic"
            aria-pressed={italic}
            onClick={() => setItalic((v) => !v)}
          >
            <Italic size={12} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            className={`wfc-inline-tb-btn ${underline ? "is-on" : ""}`}
            aria-label="Underline"
            aria-pressed={underline}
            onClick={() => setUnderline((v) => !v)}
          >
            <Underline size={12} strokeWidth={2.2} />
          </button>

          <span className="wfc-inline-tb-sep" aria-hidden="true" />

          {/* Font size — cycles S → M → L → S */}
          <button
            type="button"
            className="wfc-inline-tb-size"
            aria-label={`Font size ${size}`}
            onClick={() =>
              setSize((s) => (s === "S" ? "M" : s === "M" ? "L" : "S"))
            }
          >
            <Type size={11} strokeWidth={2} />
            <span className="wfc-inline-tb-size-label">{size}</span>
          </button>

          <span className="wfc-inline-tb-sep" aria-hidden="true" />

          {/* Color swatches */}
          <div className="wfc-inline-tb-colors" role="group" aria-label="Text color">
            {COLOR_SWATCHES.map((s) => (
              <button
                key={s.color}
                type="button"
                className={`wfc-inline-tb-color ${color === s.color ? "is-on" : ""}`}
                aria-label={`Text color ${s.name}`}
                aria-pressed={color === s.color}
                style={{ background: s.color }}
                onClick={() => setColor(s.color)}
              />
            ))}
          </div>

          <span className="wfc-inline-tb-sep" aria-hidden="true" />

          {/* Rewrite with AI — sparkle, the demo signal */}
          <button
            type="button"
            className={`wfc-inline-tb-rewrite ${rewriting ? "is-rewriting" : ""}`}
            aria-label="Rewrite with AI"
            onClick={handleRewrite}
          >
            <Sparkles size={11} strokeWidth={2} />
            <span>Rewrite</span>
          </button>
        </div>
      )}

      <Tag
        // @ts-expect-error — dynamic ref assignment across tag types
        ref={ref}
        className={`wfc-inline-edit ${editing ? "is-editing" : ""} ${rewriting ? "is-rewriting" : ""} ${className}`}
        contentEditable={editing}
        suppressContentEditableWarning
        role="textbox"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-multiline={multiline}
        data-placeholder={placeholder}
        onClick={() => !editing && setEditing(true)}
        onBlur={editing ? commit : undefined}
        onKeyDown={handleKeyDown}
      >
        {value}
      </Tag>
    </span>
  )
}
