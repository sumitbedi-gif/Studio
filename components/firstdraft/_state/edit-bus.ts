/**
 * Edit bus — a tiny global event mechanism that lets any preview component
 * inject a reference chip into the chat composer when the user clicks Edit
 * on it. Keeps the wiring decoupled (no prop-drilling through 5 layers).
 *
 * Components dispatch `requestChatRefine(...)` → chat-stage listens and
 * focuses the composer with a reference chip prepended.
 *
 * Also used for the trash → undo toast flow.
 */

export type RefineRequest = {
  cardId: string
  cardType: "popup" | "flow" | "smarttip" | "article"
  label: string           // human-readable, e.g. "Pop-up · Meet Approval Bot"
  subLabel?: string       // optional step label, e.g. "Step 4 of 16"
}

export type DeleteRequest = {
  cardId: string
  cardType: "popup" | "flow" | "smarttip" | "article"
  label: string
}

const REFINE_EVT  = "wfc:refine"
const DELETE_EVT  = "wfc:delete"
const UNDO_EVT    = "wfc:undo-delete"
const RESTORE_EVT = "wfc:restore-version"
const BUILD_REQ_EVT    = "wfc:build-request"
const BUILD_STATE_EVT  = "wfc:build-state"
const BUILD_OPEN_STUDIO = "wfc:open-studio"

export function requestChatRefine(req: RefineRequest) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(REFINE_EVT, { detail: req }))
}

export function onChatRefine(handler: (req: RefineRequest) => void): () => void {
  if (typeof window === "undefined") return () => {}
  const listener = (e: Event) => handler((e as CustomEvent<RefineRequest>).detail)
  window.addEventListener(REFINE_EVT, listener)
  return () => window.removeEventListener(REFINE_EVT, listener)
}

export function requestCardDelete(req: DeleteRequest) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(DELETE_EVT, { detail: req }))
}

export function onCardDelete(handler: (req: DeleteRequest) => void): () => void {
  if (typeof window === "undefined") return () => {}
  const listener = (e: Event) => handler((e as CustomEvent<DeleteRequest>).detail)
  window.addEventListener(DELETE_EVT, listener)
  return () => window.removeEventListener(DELETE_EVT, listener)
}

export function requestUndoDelete(cardId: string) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(UNDO_EVT, { detail: { cardId } }))
}

export function onUndoDelete(handler: (cardId: string) => void): () => void {
  if (typeof window === "undefined") return () => {}
  const listener = (e: Event) => handler((e as CustomEvent<{ cardId: string }>).detail.cardId)
  window.addEventListener(UNDO_EVT, listener)
  return () => window.removeEventListener(UNDO_EVT, listener)
}

/**
 * Restore plan to a target version. PlanCanvas listens and rebuilds its
 * removed-cards set; ChatStage listens to update its visible message log.
 */
export type RestoreRequest = { version: number }

export function requestRestoreVersion(version: number) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(RESTORE_EVT, { detail: { version } }))
}

export function onRestoreVersion(handler: (req: RestoreRequest) => void): () => void {
  if (typeof window === "undefined") return () => {}
  const listener = (e: Event) => handler((e as CustomEvent<RestoreRequest>).detail)
  window.addEventListener(RESTORE_EVT, listener)
  return () => window.removeEventListener(RESTORE_EVT, listener)
}

/**
 * Build flow — ChatStage orchestrates the sequence (so the mini-control sits
 * naturally in the chat rail). PlanCanvas dispatches start requests and
 * subscribes to status to render per-card states + morph its header button.
 */
export type BuildAction = "start" | "pause" | "resume" | "stop" | "open-studio"

export function requestBuild(action: BuildAction) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(BUILD_REQ_EVT, { detail: { action } }))
}

export function onBuildRequest(handler: (action: BuildAction) => void): () => void {
  if (typeof window === "undefined") return () => {}
  const listener = (e: Event) => handler((e as CustomEvent<{ action: BuildAction }>).detail.action)
  window.addEventListener(BUILD_REQ_EVT, listener)
  return () => window.removeEventListener(BUILD_REQ_EVT, listener)
}

export type BuildState = {
  phase: "idle" | "building" | "paused" | "done"
  buildingIndex: number   // index of card currently being built (or last built)
  totalCards: number
  elapsedMs: number
}

export function emitBuildState(state: BuildState) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(BUILD_STATE_EVT, { detail: state }))
}

export function onBuildState(handler: (state: BuildState) => void): () => void {
  if (typeof window === "undefined") return () => {}
  const listener = (e: Event) => handler((e as CustomEvent<BuildState>).detail)
  window.addEventListener(BUILD_STATE_EVT, listener)
  return () => window.removeEventListener(BUILD_STATE_EVT, listener)
}

/** "Open in Studio" click — for now a no-op handler in the page can stub it. */
export function requestOpenStudio() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(BUILD_OPEN_STUDIO))
}

export function onOpenStudio(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  window.addEventListener(BUILD_OPEN_STUDIO, handler)
  return () => window.removeEventListener(BUILD_OPEN_STUDIO, handler)
}
