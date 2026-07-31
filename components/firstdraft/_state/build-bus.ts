// Build bus — lets the studio home (page.tsx) know when First Draft is
// actively building flows, without coupling it to CreateFlow's internals.
// Same tiny pub/sub pattern as edit-bus.

export interface BuildInfo {
  active: boolean
  title: string
  paused?: boolean
}

type BuildSub = (info: BuildInfo) => void

let current: BuildInfo = { active: false, title: '' }
const subs = new Set<BuildSub>()

export function publishBuild(info: BuildInfo) {
  current = info
  subs.forEach((fn) => fn(info))
}

export function onBuild(fn: BuildSub) {
  fn(current)
  subs.add(fn)
  return () => { subs.delete(fn) }
}

// Home can ask the agent to stop (the guard modal's "Stop the build").
const stopSubs = new Set<() => void>()

export function requestBuildStop() {
  stopSubs.forEach((fn) => fn())
}

export function onBuildStop(fn: () => void) {
  stopSubs.add(fn)
  return () => { stopSubs.delete(fn) }
}
