"use client"

import { useEffect, useRef, useState } from "react"
import { Link2, Loader2, Check, Sparkles } from "lucide-react"
import type { BrandKit } from "../_state/types"
import { lookupBrand } from "../_state/brand-kits"

interface Props {
  titleId: string
  initial: BrandKit | null
  skipAnimation: boolean
  onResolved: (kit: BrandKit) => void
}

type RevealState = {
  primary: boolean
  secondary: boolean
  text: boolean
  font: boolean
  logo: boolean
  confirm: boolean
}

const ALL_REVEALED: RevealState = {
  primary: true, secondary: true, text: true, font: true, logo: true, confirm: true,
}
const NONE_REVEALED: RevealState = {
  primary: false, secondary: false, text: false, font: false, logo: false, confirm: false,
}

export function BrandFetch({ titleId, initial, skipAnimation, onResolved }: Props) {
  const [url, setUrl] = useState(initial?.domain ? `https://${initial.domain}` : "")
  const [kit, setKit] = useState<BrandKit | null>(initial)
  const [phase, setPhase] = useState<"idle" | "fetching" | "done">(
    initial ? "done" : "idle"
  )
  const [reveal, setReveal] = useState<RevealState>(
    initial ? ALL_REVEALED : NONE_REVEALED
  )
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    return () => { timeoutsRef.current.forEach(clearTimeout) }
  }, [])

  const runFetch = () => {
    if (!url.trim()) return
    const resolved = lookupBrand(url)
    setKit(resolved)
    // Persist to parent state immediately so closing mid-animation never loses the kit.
    onResolved(resolved)

    if (skipAnimation) {
      setReveal(ALL_REVEALED)
      setPhase("done")
      return
    }

    setPhase("fetching")
    setReveal(NONE_REVEALED)

    const queue: Array<[keyof RevealState, number]> = [
      ["primary",   800],
      ["secondary", 1100],
      ["text",      1400],
      ["font",      1700],
      ["logo",      2000],
      ["confirm",   2400],
    ]
    queue.forEach(([key, ms]) => {
      timeoutsRef.current.push(
        setTimeout(() => setReveal((r) => ({ ...r, [key]: true })), ms)
      )
    })
    timeoutsRef.current.push(
      setTimeout(() => setPhase("done"), 2400)
    )
  }

  const reset = () => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    setKit(null)
    setReveal(NONE_REVEALED)
    setPhase("idle")
  }

  return (
    <div className={`wfc-slide wfc-ambient ${phase !== "idle" ? "active" : ""}`}>
      <div>
        <h2 id={titleId} className="wfc-slide-title">What&apos;s your brand?</h2>
        <p className="wfc-slide-sub" style={{ marginTop: 6 }}>
          I&apos;ll pull your colors, fonts, and logo so everything I generate matches your style.
        </p>
      </div>

      <div className={`wfc-url-input ${phase === "fetching" ? "locked" : ""}`}>
        <Link2 size={15} strokeWidth={1.8} color="#8C899F" />
        <input
          type="text"
          placeholder="https://salesforce.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={phase === "fetching"}
          onKeyDown={(e) => {
            if (e.key === "Enter" && phase === "idle") {
              e.preventDefault()
              runFetch()
            }
          }}
        />
        {phase === "done" && (
          <button type="button" className="wfc-doc-link" onClick={reset} style={{ marginLeft: "auto" }}>
            Change
          </button>
        )}
      </div>

      {phase === "idle" && (
        <>
          <button type="button" className="wfc-fetch-btn" onClick={runFetch} disabled={!url.trim()}>
            <Sparkles size={14} strokeWidth={1.8} />
            Fetch brand kit
          </button>
          <button type="button" className="wfc-doc-link" style={{ alignSelf: "center" }}>
            or upload a brand guidelines doc
          </button>
        </>
      )}

      {phase === "fetching" && (
        <button type="button" className="wfc-fetch-btn busy" disabled>
          <Loader2 size={14} strokeWidth={2} className="wfc-spin" />
          Reading your brand…
        </button>
      )}

      {kit && phase !== "idle" && (
        <>
          <div className="wfc-kit-grid">
            <Swatch label="Primary"   color={kit.colors.primary}   revealed={reveal.primary} />
            <Swatch label="Secondary" color={kit.colors.secondary} revealed={reveal.secondary} />
            <Swatch label="Text"      color={kit.colors.text}      revealed={reveal.text} />
          </div>

          <div className="wfc-kit-meta">
            <div className="wfc-kit-font" style={{ opacity: reveal.font ? 1 : 0, transition: "opacity 320ms ease" }}>
              <span className="wfc-kit-font-glyph" style={{ fontFamily: kit.font }}>Aa</span>
              <div className="wfc-kit-font-meta">
                <span className="wfc-kit-font-name">{kit.font}</span>
                <span className="wfc-kit-font-sub">sans-serif · system fallback</span>
              </div>
            </div>
            <div className="wfc-kit-logo" style={{ opacity: reveal.logo ? 1 : 0, transition: "opacity 320ms ease" }}>
              {kit.faviconUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={kit.faviconUrl} alt={`${kit.name} logo`} />
              )}
            </div>
          </div>

          {reveal.confirm && (
            <div className="wfc-kit-confirm wfc-fade-up" style={{ animationDelay: "60ms" }}>
              <span className="wfc-kit-confirm-mark wfc-check-in">
                <Check size={12} strokeWidth={2.5} />
              </span>
              <span>Got it. I&apos;ll match this style.</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Swatch({ label, color, revealed }: { label: string; color: string; revealed: boolean }) {
  return (
    <div className="wfc-kit-swatch">
      <span className="wfc-kit-swatch-label">{label}</span>
      <div
        className={revealed ? "wfc-kit-swatch-chip wfc-swatch-reveal" : "wfc-kit-swatch-chip"}
        style={{ background: revealed ? color : undefined }}
      />
      <span className="wfc-kit-swatch-hex">{revealed ? color : "—"}</span>
    </div>
  )
}
