"use client"

import { useMemo } from "react"

/**
 * Procedural confetti burst — no library, no canvas. Each particle's trajectory
 * is computed once in JS (angle + distance from center, rotation, color, shape)
 * and animated via per-particle CSS custom properties. One shot; unmount the
 * component to clean up.
 *
 * Looks credible at a glance because randomness is real (not pure CSS) and
 * particles fall under gravity after the initial outward burst.
 */

const COLORS = [
  "#0975D7", // Whatfix blue
  "#1E6FE0", // brand blue mid
  "#4FA3F5", // brand blue light
  "#E45913", // Whatfix orange
  "#FF7A3D", // brand orange light
  "#16A34A", // success green
  "#FBBF24", // warm amber
]

const PARTICLE_COUNT = 64

interface Particle {
  id: number
  /** Initial angle from burst origin (radians) */
  angle: number
  /** How far it travels horizontally (px) */
  distance: number
  /** Starting rotation (deg) */
  rotateStart: number
  /** Total rotation (deg) */
  rotateEnd: number
  color: string
  /** "rect" = small rectangle, "circle" = small circle */
  shape: "rect" | "circle"
  /** Particle scale (0.5–1) */
  scale: number
  /** Delay before this particle starts (ms) */
  delay: number
  /** Duration to live (ms) */
  duration: number
}

function makeParticles(): Particle[] {
  const out: Particle[] = []
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Bias the angle toward up + outward (think real party-popper cone),
    // not a perfect 360 — feels more directional.
    const baseAngle = -Math.PI / 2 // straight up
    const spread = Math.PI * 0.9    // ~162° cone
    const angle = baseAngle + (Math.random() - 0.5) * spread
    out.push({
      id: i,
      angle,
      distance: 120 + Math.random() * 180,
      rotateStart: Math.random() * 360,
      rotateEnd: Math.random() * 720 - 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() > 0.5 ? "rect" : "circle",
      scale: 0.5 + Math.random() * 0.5,
      delay: Math.random() * 80,
      duration: 1600 + Math.random() * 800,
    })
  }
  return out
}

export function ConfettiBurst() {
  // useMemo so re-renders don't re-randomize while the burst is playing.
  const particles = useMemo(makeParticles, [])

  return (
    <div className="wfc-confetti-burst" aria-hidden="true">
      {particles.map((p) => {
        // Translate target — x is angle*distance, y is angle*distance + gravity
        // pull (so particles arc and fall).
        const tx = Math.cos(p.angle) * p.distance
        const ty = Math.sin(p.angle) * p.distance
        const fallY = 240 + Math.random() * 80 // gravity pulls them down past end
        return (
          <span
            key={p.id}
            className={`wfc-confetti-particle is-${p.shape}`}
            style={{
              ["--c" as string]: p.color,
              ["--tx" as string]: `${tx}px`,
              ["--ty" as string]: `${ty}px`,
              ["--fy" as string]: `${fallY}px`,
              ["--r0" as string]: `${p.rotateStart}deg`,
              ["--r1" as string]: `${p.rotateEnd}deg`,
              ["--s" as string]: p.scale,
              ["--delay" as string]: `${p.delay}ms`,
              ["--dur" as string]: `${p.duration}ms`,
            }}
          />
        )
      })}
    </div>
  )
}
