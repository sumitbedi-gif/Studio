"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUp, Plus, Mic, Square, Check, FileText, Pin, X, Trash2, Pause, Play, Hand, Loader2, Sparkles } from "lucide-react"
import { UserBubble, AgentBubble } from "./chat-bubble"
import { PlanCanvas } from "./plan-canvas"
import { CompletionModal } from "./completion-modal"
import { CLARIFICATION, JOURNEY } from "../_state/mock-data"
import {
  onChatRefine, onCardDelete, onUndoDelete, onRestoreVersion,
  onBuildRequest, emitBuildState, requestRestoreVersion, requestBuild,
  type RefineRequest, type BuildState,
} from "../_state/edit-bus"

type Phase =
  | "clarifying"     // agent asks question, chips visible
  | "working"        // user picked an answer, animated status row mutating
  | "reasoning"      // assistant message with recommendation + "Show plan" CTA
  | "plan"           // canvas split, plan rendered

interface Props {
  prompt: string
  attachedFile: string | null
  onPlanReady: () => void
}

export function ChatStage({ prompt, attachedFile, onPlanReady }: Props) {
  const [phase, setPhase] = useState<Phase>("clarifying")
  const [thinkingDots, setThinkingDots] = useState(true)
  const [userAnswer, setUserAnswer] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [showFreeText, setShowFreeText] = useState(false)
  const [composerDraft, setComposerDraft] = useState("")
  // Sub-line is a code-styled current-action hint (e.g. the page being read,
  // the query being run). Shown only while the step is pending; disappears
  // once the step resolves — Perplexity pattern, signals concrete work.
  type ChecklistStep = { id: string; label: string; sub?: string; state: "pending" | "done" }
  const [checklist, setChecklist] = useState<ChecklistStep[]>([])
  const [refChip, setRefChip] = useState<RefineRequest | null>(null)
  // Gates the reasoning bullet list + CTA until after the lead-in lands, so
  // the message feels composed beat-by-beat rather than dumped at once.
  const [reasoningRevealed, setReasoningRevealed] = useState(false)
  // Pre-checklist thinking beat — agent shows typing dots after the user picks
  // an audience, before the checklist starts ticking through sources.
  const [workThinking, setWorkThinking] = useState(false)
  // Build completion celebration modal. Fires once when build transitions to
  // "done"; user can dismiss to keep editing. The flag stays set so the modal
  // doesn't refire on re-renders of the same build.
  const [completionOpen, setCompletionOpen] = useState(false)
  const completionShownForBuildRef = useRef(false)
  // Total elapsed seconds for the checklist work, captured at the moment
  // reasoning lands. Drives the "Thought for 9s" collapsed summary.
  const [thoughtSeconds, setThoughtSeconds] = useState(0)
  // User can re-expand the collapsed checklist after reasoning arrives.
  const [checklistExpanded, setChecklistExpanded] = useState(true)

  // Post-plan chat additions (delete requests + plan re-issues + build summary).
  type PostPlanMsg =
    | { kind: "user-delete"; id: string; label: string }
    | { kind: "system-thinking"; id: string }
    | { kind: "system-plan"; id: string; version: number; experiences: number; cardId: string }
    | { kind: "system-build"; id: string; experiences: number; elapsedMs: number; cardTitles: string[] }
  const [postPlan, setPostPlan] = useState<PostPlanMsg[]>([])
  const [planVersion, setPlanVersion] = useState(1)
  const [experienceCount, setExperienceCount] = useState(4)
  const threadRef = useRef<HTMLDivElement | null>(null)
  const freeTextRef = useRef<HTMLInputElement | null>(null)
  const composerRef = useRef<HTMLTextAreaElement | null>(null)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Initial agent thinking → first message. 2.6s so the agent visibly
  // composes before its question lands; faster than streaming, slower than
  // an instant reply.
  useEffect(() => {
    const t = setTimeout(() => setThinkingDots(false), 2600)
    return () => {
      clearTimeout(t)
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
    }
  }, [])

  // Scroll thread to bottom on phase changes AND on new post-plan messages
  // (so delete events scroll the new agent response into view).
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTo({
        top: threadRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [phase, userAnswer, postPlan.length])

  // Auto-grow the bottom composer textarea
  useEffect(() => {
    const ta = composerRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${ta.scrollHeight}px`
  }, [composerDraft])

  // Listen for refine requests from card pencils / per-step pencils
  useEffect(() => {
    const off = onChatRefine((req) => {
      setRefChip(req)
      // Focus composer after refchip lands
      window.setTimeout(() => composerRef.current?.focus(), 60)
    })
    return off
  }, [])

  // Listen for card deletes → log to chat + bump plan version.
  // Use a ref to track the latest values so we can compute everything synchronously
  // without nesting setters (which double-fires under React StrictMode dev).
  const planStateRef = useRef({ version: 1, count: 4 })
  useEffect(() => {
    planStateRef.current = { version: planVersion, count: experienceCount }
  }, [planVersion, experienceCount])

  useEffect(() => {
    const off = onCardDelete((req) => {
      const { version, count } = planStateRef.current
      const nextV = version + 1
      const newCount = Math.max(0, count - 1)
      const ts = Date.now()
      const userId = `del-${req.cardId}-${ts}`
      const thinkingId = `think-${req.cardId}-${ts}`
      const planId = `sys-${req.cardId}-${ts}`

      // Update ref synchronously so back-to-back deletes don't read stale values
      planStateRef.current = { version: nextV, count: newCount }
      setPlanVersion(nextV)
      setExperienceCount(newCount)

      // 1) Append user-delete + a "thinking" status line
      setPostPlan((prev) => [
        ...prev,
        { kind: "user-delete", id: userId, label: req.label },
        { kind: "system-thinking", id: thinkingId },
      ])

      // 2) After ~1.4s, swap the thinking line for the actual plan card
      timeoutsRef.current.push(
        setTimeout(() => {
          setPostPlan((prev) => prev.map((m) =>
            m.kind === "system-thinking" && m.id === thinkingId
              ? { kind: "system-plan", id: planId, version: nextV, experiences: newCount, cardId: req.cardId }
              : m
          ))
        }, 1400)
      )
    })
    return off
  }, [])

  // Listen for undo → strip the last delete pair + roll version back
  useEffect(() => {
    const off = onUndoDelete(() => {
      const { version, count } = planStateRef.current
      const prevV = Math.max(1, version - 1)
      const newCount = count + 1
      planStateRef.current = { version: prevV, count: newCount }
      setPlanVersion(prevV)
      setExperienceCount(newCount)
      // remove the last logical pair (user-delete + system-plan, also any
      // lingering thinking line for that pair).
      setPostPlan((prev) => {
        const next = [...prev]
        while (next.length && next[next.length - 1].kind !== "user-delete") next.pop()
        if (next.length) next.pop() // pop the user-delete itself
        return next
      })
    })
    return off
  }, [])

  // Listen for explicit restore-version clicks in the chat history
  useEffect(() => {
    const off = onRestoreVersion(({ version }) => {
      // Calculate the experiences count for that version:
      // v1 = 4, each subsequent version drops 1.
      const experiences = Math.max(0, 4 - (version - 1))
      planStateRef.current = { version, count: experiences }
      setPlanVersion(version)
      setExperienceCount(experiences)
    })
    return off
  }, [])

  // ── Build orchestration ────────────────────────────────────────────────
  // Note: all setters use pre-computed values (no nested setter callbacks)
  // so React strict-mode dev double-invocation doesn't duplicate the summary
  // card in chat.
  const BUILD_DURATION_PER_CARD = 3000
  const [buildState, setBuildState] = useState<BuildState>({
    phase: "idle",
    buildingIndex: 0,
    totalCards: 0,
    elapsedMs: 0,
  })
  const buildStateRef = useRef<BuildState>(buildState)
  const buildTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const buildStartRef = useRef<number>(0)
  const buildPausedAtRef = useRef<number>(0)

  // Keep the ref in sync (single source of truth, no closure staleness)
  useEffect(() => { buildStateRef.current = buildState }, [buildState])

  const commitBuildState = (next: BuildState) => {
    buildStateRef.current = next
    setBuildState(next)
    emitBuildState(next)
  }

  useEffect(() => {
    const tickBuild = () => {
      const prev = buildStateRef.current
      if (prev.phase !== "building") return

      const nextIdx = prev.buildingIndex + 1
      if (nextIdx >= prev.totalCards) {
        // Done — append the summary exactly once, derived from canonical journey.
        const elapsed = Date.now() - buildStartRef.current
        const titles = JOURNEY.cards.slice(0, prev.totalCards).map((c) => c.title)
        const ts = Date.now()
        setPostPlan((p) => [
          ...p,
          {
            kind: "system-build",
            id: `build-${ts}`,
            experiences: prev.totalCards,
            elapsedMs: elapsed,
            cardTitles: titles,
          },
        ])
        commitBuildState({
          phase: "done",
          buildingIndex: prev.totalCards - 1,
          totalCards: prev.totalCards,
          elapsedMs: elapsed,
        })
        return
      }

      commitBuildState({
        ...prev,
        buildingIndex: nextIdx,
        elapsedMs: Date.now() - buildStartRef.current,
      })
      buildTimerRef.current = setTimeout(tickBuild, BUILD_DURATION_PER_CARD)
    }

    const off = onBuildRequest((action) => {
      if (action === "start") {
        const total = planStateRef.current.count
        if (total === 0) return
        buildStartRef.current = Date.now()
        commitBuildState({ phase: "building", buildingIndex: 0, totalCards: total, elapsedMs: 0 })
        buildTimerRef.current = setTimeout(tickBuild, BUILD_DURATION_PER_CARD)
      } else if (action === "pause") {
        const prev = buildStateRef.current
        if (prev.phase !== "building") return
        if (buildTimerRef.current) clearTimeout(buildTimerRef.current)
        buildPausedAtRef.current = Date.now() - buildStartRef.current
        commitBuildState({ ...prev, phase: "paused" })
      } else if (action === "resume") {
        const prev = buildStateRef.current
        if (prev.phase !== "paused") return
        buildStartRef.current = Date.now() - buildPausedAtRef.current
        commitBuildState({ ...prev, phase: "building" })
        buildTimerRef.current = setTimeout(tickBuild, BUILD_DURATION_PER_CARD)
      } else if (action === "stop") {
        if (buildTimerRef.current) clearTimeout(buildTimerRef.current)
        commitBuildState({ phase: "idle", buildingIndex: 0, totalCards: 0, elapsedMs: 0 })
      }
    })
    return () => {
      off()
      if (buildTimerRef.current) clearTimeout(buildTimerRef.current)
    }
  }, [])

  // Fire the completion modal exactly once when build flips to done.
  // The ref guards against React StrictMode double-invocation; the modal can
  // be dismissed and stays dismissed until a new build runs.
  useEffect(() => {
    if (buildState.phase === "done" && !completionShownForBuildRef.current) {
      completionShownForBuildRef.current = true
      // Slight delay so the canvas's "all cards built" state settles into view
      // before the modal lands on top.
      const t = setTimeout(() => setCompletionOpen(true), 280)
      return () => clearTimeout(t)
    }
    // Reset the latch if the user starts a fresh build (returns to idle/building)
    if (buildState.phase === "idle" || buildState.phase === "building") {
      completionShownForBuildRef.current = false
    }
  }, [buildState.phase])

  const handleCompletionGoToDraft = () => {
    if (typeof window === "undefined") return
    window.sessionStorage.setItem("wfc-just-built", "true")
    window.location.href = "/content"
  }

  const cancelTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  const handleStop = () => {
    cancelTimeouts()
    setPhase("clarifying")
    setUserAnswer(null)
    setChecklist([])
    setReasoningRevealed(false)
    setWorkThinking(false)
    setThoughtSeconds(0)
    setChecklistExpanded(true)
  }

  const handleComposerSubmit = () => {
    // While the agent is working, composer is read-only; only Stop is active.
    if (phase === "clarifying") {
      const v = composerDraft.trim()
      if (!v) return
      setComposerDraft("")
      setRefChip(null)
      submitAnswer(v)
      return
    }
    // Plan phase: accept text into a follow-up bubble (visual only for now).
    if (phase === "plan") {
      setComposerDraft("")
      setRefChip(null) // clear chip on send — chip is a contract for *this* message only
      // (Real refinement routing comes in Phase 7+.)
    }
  }

  const submitAnswer = (text: string) => {
    if (phase !== "clarifying") return // guard against double-click race
    setUserAnswer(text)
    setChecklist([])
    setChecklistExpanded(true)
    setThoughtSeconds(0)
    setPhase("working")

    // Pre-checklist thinking beat: agent shows typing dots first so the user
    // sees an "okay, I'm on it" moment before the checklist begins. Tightened
    // to keep the full working sequence at ~5s — Patrick's read was that the
    // chat preamble shouldn't be a wait.
    const THINK_BEAT = 700
    setWorkThinking(true)
    timeoutsRef.current.push(
      setTimeout(() => setWorkThinking(false), THINK_BEAT)
    )

    // Sequential checklist — each step appears as "pending" (green dot),
    // resolves to "done" (check) ~1.5s later, and the next one lands.
    const steps: Array<Omit<ChecklistStep, "state">> = [
      { id: "s1", label: "Analyzing salesforce.com for brand context",        sub: "color palette · type · voice samples" },
      { id: "s2", label: "Reading Approval-Bot-Release-Notes-Q1-2026.pdf",    sub: "page 4 of 12 · \"Routing rules\"" },
      { id: "s3", label: "Reviewing recent ServiceNow tickets",               sub: "INC-2841 · INC-2856 · INC-2903" },
      { id: "s4", label: "Matching to past high-adoption launches",           sub: "Q4 2025 · CPQ rollout · 87% adoption" },
      { id: "s5", label: "Composing recommendation",                          sub: "pop-up → flow → smart tip → article" },
    ]

    const STEP_INTERVAL = 750  // time between new steps appearing
    const STEP_RESOLVE  = 550  // time after appearing before turning green

    steps.forEach((step, i) => {
      const appearAt  = THINK_BEAT + i * STEP_INTERVAL
      const resolveAt = THINK_BEAT + i * STEP_INTERVAL + STEP_RESOLVE

      // Append this step as pending
      timeoutsRef.current.push(
        setTimeout(() => {
          setChecklist((prev) => [...prev, { ...step, state: "pending" }])
        }, appearAt)
      )

      // Resolve this step to done
      timeoutsRef.current.push(
        setTimeout(() => {
          setChecklist((prev) =>
            prev.map((s) => (s.id === step.id ? { ...s, state: "done" } : s))
          )
        }, resolveAt)
      )
    })

    // After all steps resolve, flip to reasoning + auto-collapse the checklist
    const totalDuration = THINK_BEAT + steps.length * STEP_INTERVAL + 250
    timeoutsRef.current.push(
      setTimeout(() => {
        // Round to nearest second for a clean "Thought for 9s" label
        setThoughtSeconds(Math.round(totalDuration / 1000))
        setChecklistExpanded(false) // collapse when reasoning arrives
        setPhase("reasoning")
      }, totalDuration)
    )
  }

  // After the reasoning lead-in lands, reveal the bullet list a beat later so
  // the message feels composed in two passes. Then auto-advance to "plan" so
  // the Plan ready card lands without a user click — Patrick's feedback was
  // that the user shouldn't have to work to get to the canvas; reasoning and
  // canvas should arrive together.
  useEffect(() => {
    if (phase !== "reasoning") {
      setReasoningRevealed(false)
      return
    }
    const tReveal = setTimeout(() => setReasoningRevealed(true), 750)
    const tAdvance = setTimeout(() => {
      setPhase("plan")
      onPlanReady()
    }, 1900)
    return () => {
      clearTimeout(tReveal)
      clearTimeout(tAdvance)
    }
  }, [phase, onPlanReady])

  const handleDraftSubmit = () => {
    const v = draft.trim()
    if (!v) return
    submitAnswer(v)
  }

  const openFreeText = () => {
    setShowFreeText(true)
    // focus after render
    setTimeout(() => freeTextRef.current?.focus(), 50)
  }

  // Canvas opens after the agent has had a beat to show it's working. Patrick
  // called out that the chat preamble was gating the canvas reveal — but
  // opening the canvas *instantly* on audience-pick felt abrupt. Small delay
  // (~1.2s) lets the "working" beat land in chat first so the split reads as
  // a response to the user's pick, not a pre-staged reveal.
  const [canvasUnlocked, setCanvasUnlocked] = useState(false)
  useEffect(() => {
    if (phase === "working" && !canvasUnlocked) {
      const t = setTimeout(() => setCanvasUnlocked(true), 1200)
      return () => clearTimeout(t)
    }
    if (phase === "clarifying") {
      // Reset if user starts over so the next split also delays.
      setCanvasUnlocked(false)
    }
  }, [phase, canvasUnlocked])

  const isSplit = canvasUnlocked && (phase === "working" || phase === "reasoning" || phase === "plan")
  // Show the canvas in a loading shell during "working," populated during
  // "reasoning" + "plan." canvasReady gates the actual journey ribbon /
  // expanded preview so cards don't appear before the agent has reasoned.
  const canvasReady = phase === "reasoning" || phase === "plan"
  const showReasoning = phase === "reasoning" || phase === "plan"
  const showPlanReadyCard = phase === "plan"

  return (
    <div className={`wfc-chat-stage ${isSplit ? "wfc-chat-split" : ""}`}>
      {/* Chat thread */}
      <div className="wfc-chat-rail">
        <div className="wfc-chat-thread" ref={threadRef}>
          <UserBubble text={prompt} attachedFile={attachedFile} />

          <AgentBubble thinking={thinkingDots} delay={400}>
            <p>
              Got it. Quick check — is this aimed at{" "}
              <strong>Sales Reps</strong> who&apos;ll use the bot during deal close, or{" "}
              <strong>Admins</strong> who&apos;ll configure approval routing?
            </p>
          </AgentBubble>

          {/* Inline option chips */}
          {!thinkingDots && phase === "clarifying" && (
            <div className="wfc-clarify-row wfc-fade-up" style={{ animationDelay: "200ms" }}>
              <div className="wfc-clarify-chips">
                {CLARIFICATION.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className="wfc-clarify-chip"
                    onClick={() => submitAnswer(opt)}
                  >
                    {opt}
                  </button>
                ))}
                {!showFreeText && (
                  <button
                    type="button"
                    className="wfc-clarify-chip wfc-clarify-chip-other"
                    onClick={openFreeText}
                  >
                    Something else…
                  </button>
                )}
              </div>

              {showFreeText && (
                <div className="wfc-clarify-input wfc-fade-up" style={{ animationDelay: "60ms" }}>
                  <input
                    ref={freeTextRef}
                    type="text"
                    placeholder="Tell me more…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleDraftSubmit()
                      } else if (e.key === "Escape") {
                        setShowFreeText(false)
                        setDraft("")
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="wfc-send-btn"
                    aria-label="Send"
                    disabled={!draft.trim()}
                    onClick={handleDraftSubmit}
                  >
                    <ArrowUp size={14} strokeWidth={2} />
                  </button>
                </div>
              )}
            </div>
          )}

          {userAnswer && <UserBubble text={userAnswer} />}

          {/* Pre-checklist "thinking" beat — agent acknowledges the audience
              pick with typing dots before starting the live checklist. */}
          {workThinking && (
            <AgentBubble thinking={true} delay={80}>
              {null}
            </AgentBubble>
          )}

          {/* Live checklist + collapsed "Thought for Xs · N steps" summary */}
          {checklist.length > 0 && (
            <div className="wfc-msg wfc-msg-agent wfc-fade-up" style={{ animationDelay: "120ms" }}>
              <div className="wfc-thought">
                {/* Header: live "Working" while checklist ticks; once work is
                    done (thoughtSeconds set), header becomes the collapsible
                    "Thought for Xs · N steps" — stays that way through plan. */}
                {thoughtSeconds > 0 ? (
                  <button
                    type="button"
                    className={`wfc-thought-head is-collapsible ${checklistExpanded ? "is-open" : ""}`}
                    onClick={() => setChecklistExpanded((v) => !v)}
                    aria-expanded={checklistExpanded}
                  >
                    <span className="wfc-thought-chev" aria-hidden="true">▸</span>
                    <span className="wfc-thought-head-text">
                      Thought for {thoughtSeconds}s
                      <span className="wfc-thought-head-sep">·</span>
                      {checklist.length} step{checklist.length === 1 ? "" : "s"}
                    </span>
                  </button>
                ) : (
                  <div className="wfc-thought-head is-live">
                    <Loader2 size={11} strokeWidth={2.4} className="wfc-spin wfc-thought-head-spinner" />
                    <span className="wfc-thought-head-text">Working</span>
                  </div>
                )}

                {/* Body: visible while live; collapsible after reasoning lands */}
                <div className={`wfc-thought-body ${checklistExpanded ? "is-open" : ""}`}>
                  <ul className="wfc-checklist" aria-live="polite">
                    {checklist.map((step) => (
                      <li key={step.id} className={`wfc-checklist-item is-${step.state}`}>
                        <span className="wfc-checklist-mark" aria-hidden="true">
                          {step.state === "pending" ? (
                            <Loader2 size={11} strokeWidth={2.4} className="wfc-spin" />
                          ) : (
                            <Check size={11} strokeWidth={2.8} />
                          )}
                        </span>
                        <span className="wfc-checklist-text">
                          <span className="wfc-checklist-label">{step.label}</span>
                          {step.state === "pending" && step.sub && (
                            <span className="wfc-checklist-sub">{step.sub}</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {showReasoning && (
            <div className="wfc-msg wfc-msg-agent wfc-fade-up" style={{ animationDelay: "60ms" }}>
              <div className="wfc-reasoning">
                <p className="wfc-msg-text">
                  Based on the release notes and a <strong>{userAnswer ?? "sales-rep"}</strong>{" "}
                  audience, here&apos;s what I&apos;d ship and what each piece does for your team:
                </p>
                {(reasoningRevealed || phase === "plan") && (
                  <>
                    <ul className="wfc-reasoning-list">
                      <li>
                        <strong>Pop-up:</strong> reps notice Approval Bot the first time they
                        open a deal, so they don&apos;t call IT or wait for a Slack reply just
                        to find the new button.
                      </li>
                      <li>
                        <strong>Flow:</strong> admins finish setup in under five minutes
                        instead of digging through Setup screens, so routing is live before
                        the first rep needs it.
                      </li>
                      <li>
                        <strong>Smart tip:</strong> reps see the routing rule in the moment
                        they click Request Approval, so the right approver gets pinged
                        without anyone needing to remember the policy.
                      </li>
                      <li>
                        <strong>Article:</strong> managers have one link to send when reps
                        ask about Bot weeks from now, so the team isn&apos;t answering the
                        same question on repeat.
                      </li>
                    </ul>
                    {phase === "reasoning" && (
                      <p className="wfc-reasoning-closer">
                        Take a look on the right — tweak anything, or tell me what to change.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {showPlanReadyCard && (
            <>
              <div className="wfc-msg wfc-msg-agent wfc-fade-up" style={{ animationDelay: "60ms" }}>
                <button
                  type="button"
                  className={`wfc-plan-ready-card ${planVersion === 1 ? "is-current" : ""}`}
                  onClick={() => requestRestoreVersion(1)}
                  aria-label={planVersion === 1 ? "Current plan" : "Restore plan v1"}
                >
                  <span className="wfc-plan-ready-icon" aria-hidden="true">
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                  <span className="wfc-plan-ready-text">
                    <span className="wfc-plan-ready-title">
                      Plan ready
                      {planVersion === 1 && <span className="wfc-plan-current-tag">Current</span>}
                    </span>
                    <span className="wfc-plan-ready-meta">v1 · 4 experiences · 10 steps</span>
                  </span>
                  <FileText size={14} strokeWidth={1.6} className="wfc-plan-ready-chev" />
                </button>
              </div>

              {postPlan.map((msg) => {
                if (msg.kind === "user-delete") {
                  // System event row — honest model: the agent acknowledges the
                  // user's UI action rather than putting words in their mouth.
                  return (
                    <div key={msg.id} className="wfc-system-event wfc-fade-up">
                      <Trash2 size={11} strokeWidth={1.8} />
                      <span>Removed {msg.label}</span>
                    </div>
                  )
                }
                if (msg.kind === "system-build") {
                  return (
                    <div key={msg.id} className="wfc-msg wfc-msg-agent wfc-fade-up">
                      <div className="wfc-build-summary">
                        <div className="wfc-build-summary-head">
                          <span className="wfc-build-summary-check">
                            <Check size={11} strokeWidth={2.5} />
                          </span>
                          <span className="wfc-build-summary-title">
                            Built {msg.experiences} experience{msg.experiences === 1 ? "" : "s"}
                          </span>
                          <span className="wfc-build-summary-meta">in {(msg.elapsedMs / 1000).toFixed(1)}s</span>
                        </div>
                        <ul className="wfc-build-summary-list">
                          {msg.cardTitles.map((t, i) => (
                            <li key={i}>
                              <Check size={10} strokeWidth={2.5} className="wfc-build-summary-li-check" />
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="wfc-build-summary-footer">
                          <p className="wfc-build-summary-foot">All saved to Draft.</p>
                          <button
                            type="button"
                            className="wfc-build-summary-cta"
                            onClick={() => {
                              if (typeof window !== "undefined") {
                                window.sessionStorage.setItem("wfc-just-built", "true")
                                window.location.href = "/content"
                              }
                            }}
                          >
                            <span>Go to Draft</span>
                            <span className="wfc-build-summary-cta-arrow" aria-hidden="true">→</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                }
                if (msg.kind === "system-thinking") {
                  return (
                    <div
                      key={msg.id}
                      className="wfc-msg wfc-msg-agent wfc-fade-up"
                      style={{ animationDelay: "60ms" }}
                    >
                      <p className="wfc-msg-status">Updating plan…</p>
                    </div>
                  )
                }
                const isCurrent = msg.version === planVersion
                return (
                  <div
                    key={msg.id}
                    className="wfc-msg wfc-msg-agent wfc-fade-up"
                    style={{ animationDelay: "60ms" }}
                  >
                    <button
                      type="button"
                      className={`wfc-plan-ready-card ${isCurrent ? "is-current" : ""}`}
                      onClick={() => requestRestoreVersion(msg.version)}
                      aria-label={isCurrent ? "Current plan" : `Restore plan v${msg.version}`}
                    >
                      <span className="wfc-plan-ready-icon" aria-hidden="true">
                        <Check size={12} strokeWidth={2.5} />
                      </span>
                      <span className="wfc-plan-ready-text">
                        <span className="wfc-plan-ready-title">
                          Plan updated
                          {isCurrent && <span className="wfc-plan-current-tag">Current</span>}
                        </span>
                        <span className="wfc-plan-ready-meta">
                          v{msg.version} · {msg.experiences} experience{msg.experiences === 1 ? "" : "s"}
                        </span>
                      </span>
                      <FileText size={14} strokeWidth={1.6} className="wfc-plan-ready-chev" />
                    </button>
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Persistent bottom composer. Renders Send → Stop based on phase. */}
        <div className="wfc-chat-refine">
          {/* Build mini-control — sits above the composer during build */}
          {(buildState.phase === "building" || buildState.phase === "paused") && (
            <BuildMiniControl state={buildState} />
          )}

          <div className="wfc-composer wfc-composer-mini">
            {refChip && (
              <div className="wfc-composer-ref-chip wfc-fade-up">
                <Pin size={11} strokeWidth={2} className="wfc-composer-ref-chip-pin" />
                <span className="wfc-composer-ref-chip-label">{refChip.label}</span>
                {refChip.subLabel && (
                  <span className="wfc-composer-ref-chip-sub">· {refChip.subLabel}</span>
                )}
                <button
                  type="button"
                  className="wfc-composer-ref-chip-close"
                  aria-label="Clear reference"
                  onClick={() => setRefChip(null)}
                >
                  <X size={9} strokeWidth={2} />
                </button>
              </div>
            )}
            <textarea
              ref={composerRef}
              className="wfc-composer-textarea"
              placeholder={
                phase === "clarifying"
                  ? "Reply or ask a follow-up…"
                  : phase === "plan"
                    ? refChip ? "Describe what to change…" : "Refine the plan or ask a follow-up…"
                    : "Working… press stop to interrupt"
              }
              rows={1}
              value={composerDraft}
              onChange={(e) => setComposerDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleComposerSubmit()
                } else if (e.key === "Escape" && refChip) {
                  e.preventDefault()
                  setRefChip(null)
                }
              }}
              disabled={phase === "working"}
              aria-label="Reply to the agent"
            />
            <div className="wfc-composer-row">
              <div className="wfc-composer-actions">
                <button
                  type="button"
                  className="wfc-mini-btn"
                  aria-label="Attach a file"
                  disabled={phase === "working"}
                >
                  <Plus size={14} strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  className="wfc-mini-btn"
                  aria-label="Voice input, coming soon"
                  disabled
                >
                  <Mic size={14} strokeWidth={1.8} />
                </button>
              </div>

              {phase === "clarifying" || phase === "plan" ? (
                <button
                  type="button"
                  className="wfc-send-btn"
                  aria-label="Send"
                  disabled={!composerDraft.trim()}
                  onClick={handleComposerSubmit}
                >
                  <ArrowUp size={14} strokeWidth={2} />
                </button>
              ) : (
                <button
                  type="button"
                  className="wfc-send-btn wfc-stop-btn"
                  aria-label="Stop"
                  onClick={handleStop}
                >
                  <Square size={11} strokeWidth={0} fill="currentColor" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Plan canvas / split right pane. Opens as soon as the agent starts
          working so the user never has to click through to see the artifact.
          During "working" the canvas shows a skeleton; the real ribbon and
          preview land once reasoning has been composed. */}
      {isSplit && (
        <div className="wfc-plan-canvas wfc-plan-fade-in">
          {canvasReady ? (
            <PlanCanvas />
          ) : (
            <PlanCanvasSkeleton />
          )}
        </div>
      )}

      {/* Build-complete celebration modal — sits above the chat + canvas.
          Dismissing returns to the same state (summary card still in chat). */}
      {completionOpen && (
        <CompletionModal
          experienceCount={buildState.totalCards}
          onGoToDraft={handleCompletionGoToDraft}
          onDismiss={() => setCompletionOpen(false)}
        />
      )}
    </div>
  )
}

/**
 * Lightweight skeleton shown in the right canvas pane while the agent is
 * still working through its sources. Mirrors the real PlanCanvas layout
 * (header row, ribbon row, preview block) with shimmer placeholders so the
 * canvas reads as "filling in" rather than appearing from nothing once
 * reasoning lands. Patrick's ask was to remove the gating between chat and
 * canvas; this is what fills the canvas pane in parallel.
 */
function PlanCanvasSkeleton() {
  return (
    <div className="wfc-plan wfc-plan-skel" aria-hidden="true">
      <div className="wfc-plan-skel-head">
        <div className="wfc-plan-skel-title" />
        <div className="wfc-plan-skel-meta" />
      </div>
      <div className="wfc-plan-skel-ribbon">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="wfc-plan-skel-card" style={{ animationDelay: `${i * 120}ms` }}>
            <div className="wfc-plan-skel-card-tag" />
            <div className="wfc-plan-skel-card-title" />
          </div>
        ))}
      </div>
      <div className="wfc-plan-skel-preview">
        <div className="wfc-plan-skel-preview-head" />
        <div className="wfc-plan-skel-preview-body" />
      </div>
    </div>
  )
}

/**
 * Compact build control that sits above the chat composer during build.
 * Slim card with status, progress, and pause/take-over.
 */
function BuildMiniControl({ state }: { state: BuildState }) {
  const isPaused = state.phase === "paused"
  const cardName = state.totalCards > 0
    ? JOURNEY.cards[state.buildingIndex]?.title ?? ""
    : ""
  const progressPct = state.totalCards > 0
    ? ((state.buildingIndex + (isPaused ? 0 : 0.5)) / state.totalCards) * 100
    : 0

  return (
    <div className="wfc-build-mini wfc-fade-up">
      <div className="wfc-build-mini-progress" aria-hidden="true">
        <div className="wfc-build-mini-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="wfc-build-mini-row">
        <div className="wfc-build-mini-left">
          <span className={`wfc-build-mini-spark ${!isPaused ? "is-active" : ""}`} aria-hidden="true">
            {isPaused
              ? <Sparkles size={11} strokeWidth={2} />
              : <Loader2 size={11} strokeWidth={2.2} className="wfc-spin" />}
          </span>
          <div className="wfc-build-mini-text">
            <div className="wfc-build-mini-status">
              {isPaused ? "Paused" : "Building"} · {state.buildingIndex + 1} of {state.totalCards}
            </div>
            {cardName && (
              <div className="wfc-build-mini-subtitle">{cardName}</div>
            )}
          </div>
        </div>
        <div className="wfc-build-mini-actions">
          {isPaused ? (
            <button
              type="button"
              className="wfc-build-mini-btn wfc-build-mini-btn-primary"
              onClick={() => requestBuild("resume")}
            >
              <Play size={11} strokeWidth={2} />
              Resume
            </button>
          ) : (
            <button
              type="button"
              className="wfc-build-mini-btn"
              onClick={() => requestBuild("pause")}
            >
              <Pause size={11} strokeWidth={2} />
              Pause
            </button>
          )}
          <button
            type="button"
            className="wfc-build-mini-btn"
            onClick={() => requestBuild("stop")}
            title="Take over and stop building"
          >
            <Hand size={11} strokeWidth={2} />
            Take over
          </button>
        </div>
      </div>
    </div>
  )
}
