import { gsap } from 'gsap'
import { lc } from '../styles/lc'
import { type EngineContext, must } from './context'
import { PARTNER_MARKS } from './marks'
import { type PaletteToken, tokenAlpha } from './palette'

const DOT_COUNT = 520
const DOT_INKS: readonly PaletteToken[] = [
  'magenta-500',
  'blue-500',
  'purple-400',
]

/** Without WebGL: drifting palette dots on the same stage canvas. */
export const mountParticles2d = ({
  ctx,
  canvas,
}: {
  ctx: EngineContext
  canvas: HTMLCanvasElement
}) => {
  const c2 = canvas.getContext('2d')
  if (!c2) return
  const dots = Array.from({ length: DOT_COUNT }, (_, i) => {
    const ink =
      i % 5 === 0 ? DOT_INKS[0] : i % 3 === 0 ? DOT_INKS[1] : DOT_INKS[2]
    return {
      a: i * 2.39996,
      r: Math.sqrt(i / DOT_COUNT),
      z: 0.35 + ((i * 53) % 100) / 100,
      ink: ink ?? 'purple-400',
    }
  })
  const fills = new Map(
    DOT_INKS.map((name) => [
      name,
      (a: number) => tokenAlpha({ name, alpha: a }),
    ]),
  )
  let mx = 0
  let my = 0
  window.addEventListener(
    'pointermove',
    (e) => {
      mx = e.clientX / window.innerWidth - 0.5
      my = e.clientY / window.innerHeight - 0.5
    },
    { passive: true, signal: ctx.signal },
  )
  const size = () => {
    const d = Math.min(window.devicePixelRatio || 1, 1.5)
    canvas.width = window.innerWidth * d
    canvas.height = window.innerHeight * d
    c2.setTransform(d, 0, 0, d, 0, 0)
  }
  size()
  window.addEventListener('resize', size, { signal: ctx.signal })
  const draw = (t: number) => {
    if (document.hidden) return
    const w = window.innerWidth
    const h = window.innerHeight
    c2.clearRect(0, 0, w, h)
    const R = Math.hypot(w, h) * 0.62
    for (const d of dots) {
      const a = d.a + t * 0.02 * d.z
      const rr = d.r * R * (0.92 + 0.08 * Math.sin(t * 0.6 + d.a))
      const x = w * 0.62 + Math.cos(a) * rr + mx * 40 * d.z
      const y = h * 0.5 + Math.sin(a) * rr * 0.62 + my * 30 * d.z
      const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.7 + d.a * 3))
      c2.fillStyle = fills.get(d.ink)?.((0.25 + 0.55 * d.z) * tw) ?? ''
      c2.beginPath()
      c2.arc(x, y, 0.8 + d.z * 1.6, 0, Math.PI * 2)
      c2.fill()
    }
  }
  if (ctx.reduce) {
    draw(0)
    return
  }
  gsap.ticker.add(draw)
  ctx.onDispose(() => gsap.ticker.remove(draw))
}

type Bubble = {
  el: HTMLDivElement
  r: number
  x: number
  y: number
  vx: number
  vy: number
}

/** Without WebGL: the partner marks as DOM bubbles with 2D physics. Returns a reset for scene entry. */
export const mountPartners2d = (ctx: EngineContext) => {
  const { root, state, signal } = ctx
  const zone = must({ root, selector: '#partnerZone', type: HTMLElement })
  const balls: Bubble[] = []
  for (let i = 0; i < 22; i++) {
    const mark = PARTNER_MARKS[i % PARTNER_MARKS.length]
    if (!mark) continue
    const r = 44 + ((i * 37) % 5) * 9
    const el = document.createElement('div')
    el.className = lc('ball tech')
    el.style.width = `${r * 2}px`
    el.style.height = `${r * 2}px`
    el.style.background = `radial-gradient(circle at 32% 28%, color-mix(in srgb, var(--color-white) 55%, transparent), transparent 34%), var(--color-${mark.bg})`
    el.style.color = `var(--color-${mark.fg})`
    el.style.font = `700 ${r > 70 ? 16 : 12}px/1 var(--font-display)`
    el.textContent = mark.label
    zone.appendChild(el)
    balls.push({ el, r, x: 0, y: 0, vx: 0, vy: 0 })
  }
  ctx.onDispose(() => {
    for (const b of balls) b.el.remove()
  })
  const PF: { ptr: [number, number] | null; grab: Bubble | null } = {
    ptr: null,
    grab: null,
  }
  const local = (e: PointerEvent): [number, number] => {
    const rc = zone.getBoundingClientRect()
    const k = zone.offsetWidth / (rc.width || 1)
    return [(e.clientX - rc.left) * k, (e.clientY - rc.top) * k]
  }
  zone.addEventListener(
    'pointermove',
    (e) => {
      PF.ptr = local(e)
    },
    { signal },
  )
  zone.addEventListener(
    'pointerleave',
    () => {
      if (!PF.grab) PF.ptr = null
    },
    { signal },
  )
  zone.addEventListener(
    'pointerdown',
    (e) => {
      const [x, y] = local(e)
      PF.ptr = [x, y]
      PF.grab = balls.find((b) => Math.hypot(b.x - x, b.y - y) < b.r) ?? null
      if (PF.grab) {
        zone.setPointerCapture(e.pointerId)
        state.dragging = true
      }
    },
    { signal },
  )
  const letGo = () => {
    PF.grab = null
    state.dragging = false
  }
  zone.addEventListener('pointerup', letGo, { signal })
  zone.addEventListener('pointercancel', letGo, { signal })
  const reset = () => {
    const W = zone.offsetWidth
    const H = zone.offsetHeight
    balls.forEach((b, i) => {
      const a = i * 2.4
      b.x = W / 2 + Math.cos(a) * W * 0.75
      b.y = H / 2 + Math.sin(a) * H * 0.75
      b.vx = -Math.cos(a) * 320
      b.vy = -Math.sin(a) * 320
    })
  }
  reset()
  const step = (dt: number) => {
    const W = zone.offsetWidth
    const H = zone.offsetHeight
    for (const b of balls) {
      if (PF.grab === b && PF.ptr) {
        b.vx = (PF.ptr[0] - b.x) * 14
        b.vy = (PF.ptr[1] - b.y) * 14
      } else {
        b.vx += (W / 2 - b.x) * 3.2 * dt
        b.vy += (H / 2 - b.y) * 3.2 * dt
        if (PF.ptr) {
          const dx = b.x - PF.ptr[0]
          const dy = b.y - PF.ptr[1]
          const d = Math.hypot(dx, dy) || 1e-3
          const min = b.r + 60
          if (d < min) {
            b.vx += (dx / d) * (min - d) * 14
            b.vy += (dy / d) * (min - d) * 14
          }
        }
      }
      const damp = Math.exp(-2.2 * dt)
      b.vx *= damp
      b.vy *= damp
    }
    for (let i = 0; i < balls.length; i++) {
      const a = balls[i]
      if (!a) continue
      for (let j = i + 1; j < balls.length; j++) {
        const c = balls[j]
        if (!c) continue
        const dx = c.x - a.x
        const dy = c.y - a.y
        const d = Math.hypot(dx, dy) || 1e-3
        const min = a.r + c.r
        if (d >= min) continue
        const nx = dx / d
        const ny = dy / d
        const corr = (min - d) / 2
        a.x -= nx * corr
        a.y -= ny * corr
        c.x += nx * corr
        c.y += ny * corr
        const rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny
        if (rv < 0) {
          const imp = -rv * 0.75
          a.vx -= nx * imp
          a.vy -= ny * imp
          c.vx += nx * imp
          c.vy += ny * imp
        }
      }
    }
    for (const b of balls) {
      b.x += b.vx * dt
      b.y += b.vy * dt
      const sq = 1 + Math.min(0.12, Math.hypot(b.vx, b.vy) * 0.0004)
      b.el.style.transform = `translate(${b.x - b.r}px, ${b.y - b.r}px) scale(${sq}, ${1 / sq})`
    }
  }
  const tick = () => {
    if (ctx.scenes[state.index]?.id !== 'partners') return
    const dt = Math.min(0.033, gsap.ticker.deltaRatio() / 60)
    step(dt / 2)
    step(dt / 2)
  }
  if (ctx.reduce) {
    for (let i = 0; i < 90; i++) step(1 / 60)
    return reset
  }
  gsap.ticker.add(tick)
  ctx.onDispose(() => gsap.ticker.remove(tick))
  return reset
}
