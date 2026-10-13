'use client'

import { useEffect, useRef } from 'react'
import { rgbOf, token, tokenAlpha } from '../lib/engine/palette'

export type OrbState = 'breathing' | 'searching' | 'composing'

type AssistantOrbProps = {
  size: number
  state: OrbState
  /** Animate only while the panel is open. */
  running: boolean
}

const SPEED: Record<OrbState, number> = {
  breathing: 0.7,
  searching: 1.6,
  composing: 2.4,
}

/** Orb colours resolved from palette tokens once per run (getComputedStyle is too slow per frame). */
const readInks = () => {
  const [pr, pg, pb] = rgbOf(token('purple-400'))
  return {
    core: [
      token('purple-300'),
      token('purple-500'),
      token('purple-900'),
    ] as const,
    blobs: [
      tokenAlpha({ name: 'magenta-500', alpha: 0.75 }),
      tokenAlpha({ name: 'blue-500', alpha: 0.65 }),
      tokenAlpha({ name: 'white', alpha: 0.45 }),
    ],
    clear: tokenAlpha({ name: 'white', alpha: 0 }),
    ring: tokenAlpha({ name: 'white', alpha: 0.85 }),
    pulse: (a: number) => `rgba(${pr},${pg},${pb},${a})`,
  }
}
type Inks = ReturnType<typeof readInks>

const drawOrb = ({
  c,
  t,
  state,
  inks,
}: {
  c: HTMLCanvasElement
  t: number
  state: OrbState
  inks: Inks
}) => {
  const ctx = c.getContext('2d')
  if (!ctx) return
  const w = c.width
  const r = w / 2
  const sp = SPEED[state]
  ctx.clearRect(0, 0, w, w)
  ctx.save()
  ctx.beginPath()
  ctx.arc(
    r,
    r,
    r * (state === 'breathing' ? 0.86 + 0.06 * Math.sin(t * 2) : 0.9),
    0,
    Math.PI * 2,
  )
  ctx.clip()
  const bg = ctx.createRadialGradient(r * 0.7, r * 0.6, 0, r, r, r)
  bg.addColorStop(0, inks.core[0])
  bg.addColorStop(0.55, inks.core[1])
  bg.addColorStop(1, inks.core[2])
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, w)
  ctx.globalCompositeOperation = 'lighter'
  inks.blobs.forEach((ink, k) => {
    const a = t * sp * (1 + k * 0.3) + k * 2.1
    const x = r + Math.cos(a) * r * 0.38
    const y = r + Math.sin(a * 1.3) * r * 0.32
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 0.7)
    g.addColorStop(0, ink)
    g.addColorStop(1, inks.clear)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, w)
  })
  ctx.restore()
  if (state === 'searching') {
    ctx.strokeStyle = inks.ring
    ctx.lineWidth = Math.max(1.5, w / 40)
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(r, r, r * 0.95, t * 4, t * 4 + 1.1)
    ctx.stroke()
  }
  if (state === 'composing') {
    const p = (t * 1.5) % 1
    ctx.strokeStyle = inks.pulse(0.6 - p * 0.6)
    ctx.lineWidth = Math.max(1, w / 60)
    ctx.beginPath()
    ctx.arc(r, r, r * (0.6 + p * 0.38), 0, Math.PI * 2)
    ctx.stroke()
  }
}

/** The assistant's thinking orb: breathing at rest, searching and composing while it answers. */
export const AssistantOrb = ({ size, state, running }: AssistantOrbProps) => {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const inks = readInks()
    const still =
      !running || matchMedia('(prefers-reduced-motion: reduce)').matches
    if (still) {
      drawOrb({ c, t: 0, state, inks })
      return
    }
    let frame = 0
    const t0 = performance.now()
    const loop = (now: number) => {
      drawOrb({ c, t: (now - t0) / 1000, state, inks })
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [running, state])
  return (
    <canvas
      className="orb"
      height={size * 2}
      ref={ref}
      style={{ width: `${size}px`, height: `${size}px` }}
      width={size * 2}
    />
  )
}
