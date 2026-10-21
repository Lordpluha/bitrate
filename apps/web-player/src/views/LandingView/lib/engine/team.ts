import { gsap } from 'gsap'
import { type TeamMember, teamMembers } from '../../model/team'
import { lc } from '../styles/lc'
import { type EngineContext, must } from './context'
import { collideBalls, type PhysicsBall } from './physics'

type Bubble = PhysicsBall & { d: TeamMember; el: HTMLDivElement }

/** Deterministic 0–1 per bubble so the drop looks the same on every visit. */
const rndf = (i: number) => {
  const x = Math.sin(i * 91.7 + 13.1) * 43758.5453
  return x - Math.floor(x)
}
const GRAVITY = 2600
const CARD_WIDTH = 290
const HIDE_DELAY_MS = 140

/** Team pit: people and stack bubbles fall under gravity; hover shows a card, drag throws a bubble. */
export const mountTeam = (ctx: EngineContext) => {
  const { root, state, signal } = ctx
  const pit = must({ root, selector: '#pit', type: HTMLElement })
  const hc = must({ root, selector: '#hc', type: HTMLElement })
  const bubbles: Bubble[] = teamMembers(ctx).map((d) => {
    const el = document.createElement('div')
    el.className = lc(`ball ${d.kind}`)
    el.style.width = `${d.r * 2}px`
    el.style.height = `${d.r * 2}px`
    el.style.background = d.bg
    el.textContent = d.label
    el.setAttribute('aria-label', d.name)
    pit.appendChild(el)
    return {
      d,
      el,
      r: d.r,
      p: { x: 0, y: 0, z: 0 },
      v: { x: 0, y: 0, z: 0 },
    }
  })
  ctx.onDispose(() => {
    for (const b of bubbles) b.el.remove()
  })
  const TP: {
    w: number
    h: number
    grab: Bubble | null
    gx: number
    gy: number
    hover: Bubble | null
    /** Height of the open card, measured once per hover instead of per frame. */
    cardH: number
    hideT: number
    run: boolean
  } = {
    w: 880,
    h: 780,
    grab: null,
    gx: 0,
    gy: 0,
    hover: null,
    cardH: 0,
    hideT: 0,
    run: false,
  }
  const pitLocal = (e: PointerEvent): [number, number] => {
    const r = pit.getBoundingClientRect()
    const k = pit.offsetWidth / (r.width || 1)
    return [(e.clientX - r.left) * k, (e.clientY - r.top) * k]
  }
  const reset = () => {
    TP.w = pit.offsetWidth
    TP.h = pit.offsetHeight
    bubbles.forEach((b, i) => {
      b.p.x = b.r + rndf(i) * (TP.w - b.r * 2)
      b.p.y = -b.r - rndf(i + 9) * 600 - (b.d.kind === 'person' ? 700 : 0)
      b.v.x = (rndf(i + 3) - 0.5) * 200
      b.v.y = 0
    })
    TP.run = true
  }
  const renderCard = (d: TeamMember) => {
    const row = document.createElement('div')
    row.className = lc('row')
    const av = document.createElement('span')
    av.className = lc('av')
    av.style.background = d.bg
    av.textContent = d.kind === 'person' ? d.label : d.label.slice(0, 2)
    const who = document.createElement('div')
    const name = document.createElement('p')
    name.className = lc('t-title')
    name.textContent = d.name
    const meta = document.createElement('p')
    meta.className = lc('t-meta')
    meta.textContent = d.meta
    who.append(name, meta)
    row.append(av, who)
    const bio = document.createElement('p')
    bio.className = lc('t-meta hc-bio')
    bio.textContent = d.bio
    const links = document.createElement('div')
    links.className = lc('links')
    for (const { text, href } of d.links) {
      const a = document.createElement('a')
      a.className = lc('btn btn-ghost btn-xs')
      a.href = href
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.textContent = `${text} ↗`
      links.append(a)
    }
    hc.replaceChildren(row, bio, links)
  }
  const showCard = (b: Bubble) => {
    window.clearTimeout(TP.hideT)
    TP.hover = b
    for (const o of bubbles) o.el.classList.toggle('hot', o === b)
    renderCard(b.d)
    hc.classList.add('open')
    TP.cardH = hc.offsetHeight
  }
  const hideCard = () => {
    TP.hideT = window.setTimeout(() => {
      TP.hover = null
      hc.classList.remove('open')
      for (const o of bubbles) o.el.classList.remove('hot')
    }, HIDE_DELAY_MS)
  }
  ctx.onDispose(() => window.clearTimeout(TP.hideT))
  for (const b of bubbles) {
    b.el.addEventListener(
      'pointerenter',
      () => {
        if (!TP.grab) showCard(b)
      },
      { signal },
    )
    b.el.addEventListener('pointerleave', hideCard, { signal })
    b.el.addEventListener(
      'pointerdown',
      (e) => {
        TP.grab = b
        state.dragging = true
        pit.setPointerCapture(e.pointerId)
        const [x, y] = pitLocal(e)
        TP.gx = x
        TP.gy = y
        hc.classList.remove('open')
      },
      { signal },
    )
  }
  hc.addEventListener('pointerenter', () => window.clearTimeout(TP.hideT), {
    signal,
  })
  hc.addEventListener('pointerleave', hideCard, { signal })
  pit.addEventListener(
    'pointermove',
    (e) => {
      if (!TP.grab) return
      const [x, y] = pitLocal(e)
      TP.gx = x
      TP.gy = y
    },
    { signal },
  )
  const drop = () => {
    TP.grab = null
    state.dragging = false
  }
  pit.addEventListener('pointerup', drop, { signal })
  pit.addEventListener('pointercancel', drop, { signal })
  const step = (dt: number) => {
    for (const b of bubbles) {
      if (TP.grab === b) {
        b.v.x = (TP.gx - b.p.x) * 16
        b.v.y = (TP.gy - b.p.y) * 16
      } else b.v.y += GRAVITY * dt
      b.v.x *= 0.996
      b.p.x += b.v.x * dt
      b.p.y += b.v.y * dt
      if (b.p.x < b.r) {
        b.p.x = b.r
        b.v.x = Math.abs(b.v.x) * 0.4
      }
      if (b.p.x > TP.w - b.r) {
        b.p.x = TP.w - b.r
        b.v.x = -Math.abs(b.v.x) * 0.4
      }
      if (b.p.y > TP.h - b.r) {
        b.p.y = TP.h - b.r
        b.v.y = -Math.abs(b.v.y) * 0.32
        b.v.x *= 0.94
      }
    }
    for (let it = 0; it < 3; it++)
      collideBalls({
        balls: bubbles,
        dims: 2,
        bounce: 1.3,
        /* the held bubble does not give way */
        inverseMass: (o) => (TP.grab === o ? 0 : 1 / o.r),
      })
  }
  /** Writes the simulated positions to the DOM: once per frame, after all sub-steps. */
  const render = () => {
    for (const b of bubbles)
      b.el.style.transform = `translate(${b.p.x - b.r}px, ${b.p.y - b.r}px)`
    if (TP.hover) {
      const b = TP.hover
      const above = b.p.y - b.r - 14 > TP.cardH
      hc.style.transform = `translate(${Math.max(8, Math.min(TP.w - CARD_WIDTH - 8, b.p.x - CARD_WIDTH / 2))}px, ${above ? b.p.y - b.r - 12 - TP.cardH : b.p.y + b.r + 12}px)`
    }
  }
  const tick = () => {
    if (!TP.run || ctx.scenes[state.index]?.id !== 'team') return
    const dt = Math.min(0.033, gsap.ticker.deltaRatio() / 60)
    step(dt * 0.5)
    step(dt * 0.5)
    render()
  }
  if (ctx.reduce) {
    /* static page: let the bubbles settle once instead of animating the fall */
    reset()
    for (let i = 0; i < 360; i++) step(1 / 60)
    render()
    return reset
  }
  gsap.ticker.add(tick)
  ctx.onDispose(() => gsap.ticker.remove(tick))
  return reset
}
