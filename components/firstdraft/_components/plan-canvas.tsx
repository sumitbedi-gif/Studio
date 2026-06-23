"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import {
  Undo2, Hammer, ArrowRight, Pause, Play,
  MoreHorizontal, Share2, History, Download, Settings,
  X, Copy, Mail, Globe, Check,
} from "lucide-react"
import { JOURNEY } from "../_state/mock-data"
import { JourneyRibbon } from "./journey-ribbon"
import { ExpandedPreview } from "./expanded-preview"
import type { Confidence, Journey, JourneyCard } from "../_state/types"
import {
  onCardDelete, onRestoreVersion, requestUndoDelete,
  requestBuild, onBuildState,
  type DeleteRequest, type BuildState,
} from "../_state/edit-bus"

type BuildStatus = "queued" | "building" | "built"

export function PlanCanvas() {
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [pendingUndo, setPendingUndo] = useState<DeleteRequest | null>(null)
  const [confidenceOverrides, setConfidenceOverrides] = useState<Record<string, Confidence>>({})
  // Refresh-variant index per card. 0 (or absent) = original, 1 = variant A,
  // 2 = variant B. Cycles on each refresh click. Most previews only have
  // 2 states (original + variant) and treat any non-zero index as "variant";
  // popup-preview uses index 2 to show a second hero image.
  const [variantIndex, setVariantIndex] = useState<Record<string, number>>({})
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Per-version snapshot of removed cards. version=1 means nothing removed.
  // Each subsequent delete records the removed set at the resulting version.
  const versionSnapshotsRef = useRef<Map<number, string[]>>(new Map([[1, []]]))
  const versionRef = useRef(1)
  // Mirrors versionRef for rendering — the header chip needs to re-render when
  // the version changes. versionRef stays the synchronous source of truth so
  // back-to-back deletes don't race.
  const [currentVersion, setCurrentVersion] = useState(1)
  // Version at the moment Build last completed. Null until the first build.
  // Drives the post-build banner above the ribbon — once the user edits past
  // this point, the banner makes the v+1 implication explicit.
  const [lastBuiltVersion, setLastBuiltVersion] = useState<number | null>(null)

  // SSR guard for portals. document.body only exists after mount.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Header overflow menu + share dialog. Both are dismissible overlays anchored
  // to the plan header. Closed by default; mutually exclusive.
  const [menuOpen, setMenuOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const menuPanelRef = useRef<HTMLDivElement | null>(null)

  // Close menu on outside click + Escape
  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (
        menuPanelRef.current?.contains(t) ||
        menuButtonRef.current?.contains(t)
      ) return
      setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false)
    }
    window.addEventListener("mousedown", onDown)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("mousedown", onDown)
      window.removeEventListener("keydown", onKey)
    }
  }, [menuOpen])

  // Close share + history modals on Escape
  useEffect(() => {
    if (!shareOpen && !historyOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShareOpen(false)
        setHistoryOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [shareOpen, historyOpen])

  // Apply confirmation overrides + variant flags + removal on top of canonical journey
  const journey: Journey = useMemo(() => ({
    cards: JOURNEY.cards
      .filter((c) => !removedIds.has(c.id))
      .map((c) =>
        confidenceOverrides[c.id] ? { ...c, confidence: confidenceOverrides[c.id] } : c
      ),
  }), [confidenceOverrides, removedIds])

  // Default-select the first visible card; if currently selected was removed, reset
  const [selectedId, setSelectedId] = useState<string>(JOURNEY.cards[0].id)
  useEffect(() => {
    if (journey.cards.length === 0) return
    if (!journey.cards.find((c) => c.id === selectedId)) {
      setSelectedId(journey.cards[0].id)
    }
  }, [journey.cards, selectedId])


  const selected: JourneyCard | undefined =
    journey.cards.find((c) => c.id === selectedId) ?? journey.cards[0]

  const confirmCard = (cardId: string) => {
    setConfidenceOverrides((prev) => ({ ...prev, [cardId]: "high" }))
  }

  const handleRefreshCard = (cardId: string) => {
    setVariantIndex((prev) => ({
      ...prev,
      [cardId]: ((prev[cardId] ?? 0) + 1) % 3,
    }))
  }

  // Listen for card delete requests (from trash icon)
  useEffect(() => {
    const off = onCardDelete((req) => {
      // Start removal animation
      setRemovingId(req.cardId)
      // After animation, actually remove + show undo toast
      window.setTimeout(() => {
        setRemovedIds((prev) => {
          const next = new Set(prev)
          next.add(req.cardId)
          // Record snapshot under the new version
          const nextVersion = versionRef.current + 1
          versionRef.current = nextVersion
          versionSnapshotsRef.current.set(nextVersion, Array.from(next))
          setCurrentVersion(nextVersion)
          return next
        })
        setRemovingId(null)
        setPendingUndo(req)
        // Auto-dismiss undo after 5s
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
        undoTimerRef.current = setTimeout(() => setPendingUndo(null), 5000)
      }, 320)
    })
    return () => {
      off()
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    }
  }, [])

  // Listen for version restores from chat history clicks
  useEffect(() => {
    const off = onRestoreVersion(({ version }) => {
      const snapshot = versionSnapshotsRef.current.get(version)
      if (!snapshot) return
      setRemovedIds(new Set(snapshot))
      versionRef.current = version
      setCurrentVersion(version)
      // Clear undo (since user explicitly chose a version)
      setPendingUndo(null)
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    })
    return off
  }, [])

  const handleUndo = () => {
    if (!pendingUndo) return
    setRemovedIds((prev) => {
      const next = new Set(prev)
      next.delete(pendingUndo.cardId)
      return next
    })
    setSelectedId(pendingUndo.cardId)
    // Tell ChatStage to roll back its plan-version + post-plan log
    requestUndoDelete(pendingUndo.cardId)
    setPendingUndo(null)
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
  }

  // ── Build state — owned by ChatStage, mirrored here via the bus ─────────
  const [buildState, setBuildState] = useState<BuildState>({
    phase: "idle",
    buildingIndex: 0,
    totalCards: 0,
    elapsedMs: 0,
  })

  useEffect(() => {
    return onBuildState((state) => {
      setBuildState(state)
      // Auto-select the card currently being built so the preview follows
      if (state.phase === "building" && journey.cards[state.buildingIndex]) {
        setSelectedId(journey.cards[state.buildingIndex].id)
      }
      // When build completes, stash the IDs of the cards that were actually
      // built so /content can show only those rows (not the hardcoded 4).
      // Plan-canvas is the only place that knows the surviving-after-deletes
      // journey, so this write has to happen here.
      if (state.phase === "done") {
        // Capture the version at build time so the post-build banner can
        // explain that further edits create v+1.
        setLastBuiltVersion(versionRef.current)
        if (typeof window !== "undefined") {
          const builtIds = journey.cards.map((c) => c.id)
          window.sessionStorage.setItem("wfc-built-ids", JSON.stringify(builtIds))
        }
      }
    })
  }, [journey.cards])

  const buildableCards = journey.cards
  const buildStatuses: Record<string, BuildStatus> = useMemo(() => {
    const map: Record<string, BuildStatus> = {}
    const { phase, buildingIndex } = buildState
    if (phase === "idle") return map
    buildableCards.forEach((c, i) => {
      if (phase === "done") map[c.id] = "built"
      else if (i < buildingIndex) map[c.id] = "built"
      else if (i === buildingIndex) map[c.id] = "building"
      else map[c.id] = "queued"
    })
    return map
  }, [buildState, buildableCards])

  const isBuilding = buildState.phase === "building"
  const isBuildPaused = buildState.phase === "paused"
  const isBuildDone = buildState.phase === "done"

  const handleOpenDraft = () => {
    // Studio-embedded: no separate /content route to navigate to. No-op for the demo.
  }

  return (
    <div className={`wfc-plan ${isBuildDone ? "is-built" : ""}`}>
      {/* Plan canvas header — universal AI-canvas pattern:
          row 1: artifact title + right-aligned action cluster (overflow, Share, primary)
          row 2: status indicator + version chip + experience count
          Matches Manus / v0 / Lovable / Framer header conventions. */}
      <div className="wfc-plan-head">
        <div className="wfc-plan-head-text">
          <h2 className="wfc-plan-head-title">Proposed Plan</h2>
          <div className="wfc-plan-head-meta">
            <span
              className={`wfc-plan-head-status ${isBuildDone ? "is-built" : "is-draft"}`}
              aria-label={isBuildDone ? "Built" : "Draft — not yet built"}
            >
              <span className="wfc-plan-head-status-dot" aria-hidden="true" />
              {isBuildDone ? "Built" : "Draft"}
            </span>
            <span className="wfc-plan-head-meta-sep" aria-hidden="true">·</span>
            <span className="wfc-plan-head-version">v{currentVersion}</span>
            <span className="wfc-plan-head-meta-sep" aria-hidden="true">·</span>
            <span className="wfc-plan-head-count">
              {buildableCards.length} experience{buildableCards.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="wfc-plan-head-actions">
          {/* Overflow menu — Version history / Download / Settings */}
          <div className="wfc-plan-head-menu-wrap">
            <button
              ref={menuButtonRef}
              type="button"
              className="wfc-plan-head-icon-btn"
              aria-label="More actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MoreHorizontal size={16} strokeWidth={1.8} />
            </button>
            {menuOpen && (
              <div
                ref={menuPanelRef}
                className="wfc-plan-head-menu wfc-fade-up"
                role="menu"
              >
                <button
                  type="button"
                  className="wfc-plan-head-menu-item"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    setHistoryOpen(true)
                  }}
                >
                  <History size={13} strokeWidth={1.8} />
                  <span>Version history</span>
                </button>
                <button
                  type="button"
                  className="wfc-plan-head-menu-item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <Download size={13} strokeWidth={1.8} />
                  <span>Download as PDF</span>
                </button>
                <div className="wfc-plan-head-menu-sep" aria-hidden="true" />
                <button
                  type="button"
                  className="wfc-plan-head-menu-item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings size={13} strokeWidth={1.8} />
                  <span>Plan settings</span>
                </button>
              </div>
            )}
          </div>

          {/* Share — secondary outline. Opens dialog with email + visibility + copy link */}
          <button
            type="button"
            className="wfc-plan-head-share"
            onClick={() => setShareOpen(true)}
          >
            <Share2 size={13} strokeWidth={1.8} />
            <span>Share</span>
          </button>

          {/* Primary action — Build / Pause / Resume / Open in Draft */}
          {isBuildDone && (
            <button
              type="button"
              className="wfc-plan-head-build is-done"
              onClick={handleOpenDraft}
            >
              Open in Draft
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          )}
          {isBuilding && (
            <button
              type="button"
              className="wfc-plan-head-build is-building"
              onClick={() => requestBuild("pause")}
            >
              <Pause size={13} strokeWidth={2} />
              Pause
            </button>
          )}
          {isBuildPaused && (
            <button
              type="button"
              className="wfc-plan-head-build is-paused"
              onClick={() => requestBuild("resume")}
            >
              <Play size={13} strokeWidth={2} />
              Resume
            </button>
          )}
          {!isBuilding && !isBuildPaused && !isBuildDone && (
            <button
              type="button"
              className="wfc-plan-head-build"
              onClick={() => requestBuild("start")}
              disabled={buildableCards.length === 0}
            >
              <Hammer size={14} strokeWidth={2} />
              Build
              <ArrowRight size={13} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Post-build banner — appears once a build has run. Makes it explicit
          that the artifact is already shipped to Draft and further edits will
          land in v+1, not overwrite the live version. v0 / Manus convention. */}
      {lastBuiltVersion != null && journey.cards.length > 0 && (
        <div className="wfc-plan-built-banner" role="status">
          <span className="wfc-plan-built-banner-check" aria-hidden="true">
            <Check size={11} strokeWidth={2.8} />
          </span>
          <span className="wfc-plan-built-banner-text">
            Built to Draft as <strong>v{lastBuiltVersion}</strong>
            <span className="wfc-plan-built-banner-sep" aria-hidden="true">·</span>
            {currentVersion === lastBuiltVersion
              ? <>Further edits will create v{lastBuiltVersion + 1}</>
              : <>You&apos;re editing v{currentVersion} — Build to ship it</>}
          </span>
        </div>
      )}

      {journey.cards.length === 0 ? (
        // Empty state — every experience was removed. Surface a clear path back
        // (Restore v1 uses the snapshot recorded at plan creation) instead of
        // letting the canvas read as a dead end. Chronicle / Manus pattern:
        // keep the chrome, replace the body with a pause-point message.
        <div className="wfc-plan-empty">
          <div className="wfc-plan-empty-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
              <circle cx="16" cy="16" r="13" stroke="#C4C3BD" strokeWidth="1.4" strokeDasharray="2 3" />
              <path d="M11 16 L21 16" stroke="#8C899F" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="wfc-plan-empty-title">You&apos;ve removed every experience</h3>
          <p className="wfc-plan-empty-sub">
            Restore the original plan, or describe what you&apos;d like instead in the chat.
          </p>
          <div className="wfc-plan-empty-actions">
            <button
              type="button"
              className="wfc-plan-empty-primary"
              onClick={() => {
                const snapshot = versionSnapshotsRef.current.get(1)
                if (!snapshot) return
                setRemovedIds(new Set(snapshot))
                versionRef.current = 1
                setCurrentVersion(1)
                setPendingUndo(null)
                if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
              }}
            >
              <Undo2 size={13} strokeWidth={2} />
              Restore v1
            </button>
          </div>
        </div>
      ) : (
        <>
          <JourneyRibbon
            journey={journey}
            selectedId={selectedId}
            onSelect={setSelectedId}
            removingId={removingId}
            buildStatuses={buildStatuses}
          />

          {selected && (
            <ExpandedPreview
              card={selected}
              onConfirmCard={confirmCard}
              onRefreshCard={handleRefreshCard}
              variantIndex={variantIndex[selected.id] ?? 0}
            />
          )}
        </>
      )}

      {pendingUndo && (
        <div className="wfc-undo-toast" role="status">
          <span className="wfc-undo-toast-icon">
            <Undo2 size={11} strokeWidth={2.2} />
          </span>
          <span className="wfc-undo-toast-text">{pendingUndo.label} removed</span>
          <button type="button" className="wfc-undo-toast-btn" onClick={handleUndo}>
            Undo
          </button>
        </div>
      )}

      {/* Share dialog — Manus / v0 pattern. Visibility dropdown + email field +
          copy-link footer. Demo-only: actions show feedback but don't call APIs.
          Portaled to document.body — the plan-canvas pane uses a transform
          animation, which would otherwise trap position:fixed inside the pane. */}
      {shareOpen && mounted && createPortal(
        <div
          className="wfc-share-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShareOpen(false)
          }}
        >
          <div
            className="wfc-share-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wfc-share-title"
          >
            <div className="wfc-share-head">
              <h3 id="wfc-share-title" className="wfc-share-title">Share this plan</h3>
              <button
                type="button"
                className="wfc-share-close"
                aria-label="Close"
                onClick={() => setShareOpen(false)}
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
            <p className="wfc-share-sub">Anyone with access can review and comment.</p>

            <label className="wfc-share-field-label" htmlFor="wfc-share-visibility">
              Who can access
            </label>
            <div className="wfc-share-select" id="wfc-share-visibility">
              <Globe size={13} strokeWidth={1.8} />
              <span>Anyone in your team with the link</span>
              <span className="wfc-share-select-chev" aria-hidden="true">▾</span>
            </div>

            <label className="wfc-share-field-label" htmlFor="wfc-share-email">
              Invite by email
            </label>
            <div className="wfc-share-email">
              <Mail size={13} strokeWidth={1.8} />
              <input
                id="wfc-share-email"
                type="email"
                placeholder="name@company.com"
                className="wfc-share-email-input"
              />
              <button type="button" className="wfc-share-email-send">
                Send
              </button>
            </div>

            <div className="wfc-share-footer">
              <div className="wfc-share-link">
                <span className="wfc-share-link-text">first-draft.whatfix.com/p/qz4r8</span>
              </div>
              <button
                type="button"
                className={`wfc-share-copy ${shareCopied ? "is-copied" : ""}`}
                onClick={() => {
                  setShareCopied(true)
                  setTimeout(() => setShareCopied(false), 1600)
                }}
              >
                {shareCopied ? (
                  <>
                    <Check size={12} strokeWidth={2.4} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={12} strokeWidth={1.8} />
                    Copy link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Version history modal — surfaces every snapshot. Each row offers
          Restore (for non-current versions). Manus pattern. */}
      {historyOpen && mounted && createPortal(
        <div
          className="wfc-share-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setHistoryOpen(false)
          }}
        >
          <div
            className="wfc-history-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wfc-history-title"
          >
            <div className="wfc-share-head">
              <h3 id="wfc-history-title" className="wfc-share-title">Version history</h3>
              <button
                type="button"
                className="wfc-share-close"
                aria-label="Close"
                onClick={() => setHistoryOpen(false)}
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
            <p className="wfc-share-sub">
              Every change creates a new version. Restore any point to roll the plan back.
            </p>

            <ul className="wfc-history-list">
              {Array.from(versionSnapshotsRef.current.keys())
                .sort((a, b) => b - a)
                .map((v) => {
                  const removedCount = versionSnapshotsRef.current.get(v)?.length ?? 0
                  const experiences = JOURNEY.cards.length - removedCount
                  const isCurrent = v === currentVersion
                  return (
                    <li key={v} className={`wfc-history-row ${isCurrent ? "is-current" : ""}`}>
                      <div className="wfc-history-row-main">
                        <span className="wfc-history-row-version">v{v}</span>
                        <span className="wfc-history-row-meta">
                          {experiences} experience{experiences === 1 ? "" : "s"}
                          {v === 1 ? " · initial plan" : ` · removed ${removedCount} card${removedCount === 1 ? "" : "s"}`}
                        </span>
                      </div>
                      {isCurrent ? (
                        <span className="wfc-history-row-current">Current</span>
                      ) : (
                        <button
                          type="button"
                          className="wfc-history-row-restore"
                          onClick={() => {
                            // Use the same restore path as chat clicks
                            const snapshot = versionSnapshotsRef.current.get(v)
                            if (!snapshot) return
                            setRemovedIds(new Set(snapshot))
                            versionRef.current = v
                            setCurrentVersion(v)
                            setPendingUndo(null)
                            setHistoryOpen(false)
                          }}
                        >
                          Restore
                        </button>
                      )}
                    </li>
                  )
                })}
            </ul>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
