import { gsap } from 'gsap'
import { lc } from '../styles/lc'
import { type EngineContext, must } from './context'
import { PARTNER_MARKS } from './marks'
import { type PaletteToken, tokenSolid } from './palette'
import { collideBalls, type PhysicsBall } from './physics'

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
  const size = () => {
    const d = Math.min(window.devicePixelRatio || 1, 1.5)
    canvas.width = window.innerWidth * d
    canvas.height = window.innerHeight * d
    c2.setTransform(d, 0, 0, d, 0, 0)
  }
  size()
  /* on the GSAP ticker, which already stops in background tabs */
  const draw = (t: number) => {
    const w = window.innerWidth
    const h = window.innerHeight
    c2.clearRect(0, 0, w, h)
    const R = Math.hypot(w, h) * 0.62
    /* one resolved colour per ink; each dot only varies the alpha */
    const fills = new Map(DOT_INKS.map((name) => [name, tokenSolid(name)]))
    let ink = ''
    for (const d of dots) {
      const a = d.a + t * 0.02 * d.z
      const rr = d.r * R * (0.92 + 0.08 * Math.sin(t * 0.6 + d.a))
      const x = w * 0.62 + Math.cos(a) * rr + ctx.pointer.nx * 40 * d.z
      const y = h * 0.5 + Math.sin(a) * rr * 0.62 + ctx.pointer.ny * 30 * d.z
      const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.7 + d.a * 3))
      const fill = fills.get(d.ink) ?? ''
      if (fill !== ink) {
        c2.fillStyle = fill
        ink = fill
      }
      c2.globalAlpha = (0.25 + 0.55 * d.z) * tw
      c2.beginPath()
      c2.arc(x, y, 0.8 + d.z * 1.6, 0, Math.PI * 2)
      c2.fill()
    }
    c2.globalAlpha = 1
  }
  if (ctx.reduce) {
    draw(0)
    /* resizing clears the canvas and nothing else redraws a still field */
    window.addEventListener(
      'resize',
      () => {
        size()
        draw(0)
      },
      { signal: ctx.signal },
    )
    return
  }
  window.addEventListener('resize', size, { signal: ctx.signal })
  gsap.ticker.add(draw)
  ctx.onDispose(() => gsap.ticker.remove(draw))
}

type Bubble = PhysicsBall & { el: HTMLDivElement }

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
    balls.push({
      el,
      r,
      p: { x: 0, y: 0, z: 0 },
      v: { x: 0, y: 0, z: 0 },
    })
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
      PF.grab =
        balls.find((b) => Math.hypot(b.p.x - x, b.p.y - y) < b.r) ?? null
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
      b.p.x = W / 2 + Math.cos(a) * W * 0.75
      b.p.y = H / 2 + Math.sin(a) * H * 0.75
      b.v.x = -Math.cos(a) * 320
      b.v.y = -Math.sin(a) * 320
    })
  }
  reset()
  const step = (dt: number) => {
    const W = zone.offsetWidth
    const H = zone.offsetHeight
    for (const b of balls) {
      if (PF.grab === b && PF.ptr) {
        b.v.x = (PF.ptr[0] - b.p.x) * 14
        b.v.y = (PF.ptr[1] - b.p.y) * 14
      } else {
        b.v.x += (W / 2 - b.p.x) * 3.2 * dt
        b.v.y += (H / 2 - b.p.y) * 3.2 * dt
        if (PF.ptr) {
          const dx = b.p.x - PF.ptr[0]
          const dy = b.p.y - PF.ptr[1]
          const d = Math.hypot(dx, dy) || 1e-3
          const min = b.r + 60
          if (d < min) {
            b.v.x += (dx / d) * (min - d) * 14
            b.v.y += (dy / d) * (min - d) * 14
          }
        }
      }
      const damp = Math.exp(-2.2 * dt)
      b.v.x *= damp
      b.v.y *= damp
    }
    collideBalls({ balls, dims: 2, bounce: 1.5 })
    for (const b of balls) {
      b.p.x += b.v.x * dt
      b.p.y += b.v.y * dt
    }
  }
  /** Writes the simulated bubbles to the DOM: once per frame, after all sub-steps. */
  const render = () => {
    for (const b of balls) {
      const sq = 1 + Math.min(0.12, Math.hypot(b.v.x, b.v.y) * 0.0004)
      b.el.style.transform = `translate(${b.p.x - b.r}px, ${b.p.y - b.r}px) scale(${sq}, ${1 / sq})`
    }
  }
  const tick = () => {
    if (ctx.scenes[state.index]?.id !== 'partners') return
    const dt = Math.min(0.033, gsap.ticker.deltaRatio() / 60)
    step(dt / 2)
    step(dt / 2)
    render()
  }
  if (ctx.reduce) {
    for (let i = 0; i < 90; i++) step(1 / 60)
    render()
    return reset
  }
  gsap.ticker.add(tick)
  ctx.onDispose(() => gsap.ticker.remove(tick))
  return reset
}
