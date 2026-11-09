import { gsap } from 'gsap'
import { type TeamMember, teamMembers } from '../../model/team'
import { lc } from '../styles/lc'
import { type EngineContext, must } from './context'
import {
  containInJar,
  containLoose,
  hasLeftJar,
  type JarBox,
  jarBox,
} from './jar'
import { collideBalls, type PhysicsBall } from './physics'

/**
 * Where a bubble is: in the jar (pit pixels), loose over the landing (viewport pixels), or gone —
 * fallen below the screen on its way down to the footer, where the final scene catches it.
 */
type Place = 'jar' | 'loose' | 'gone'

type Bubble = PhysicsBall & {
  d: TeamMember
  el: HTMLDivElement
  place: Place
  /** Radius in the jar (pit pixels); `r` is the radius in the current place. */
  rJar: number
}

/** Deterministic 0–1 per bubble so the drop looks the same on every visit. */
const rndf = (i: number) => {
  const x = Math.sin(i * 91.7 + 13.1) * 43758.5453
  return x - Math.floor(x)
}
const GRAVITY = 2600
const CARD_WIDTH = 290
const HIDE_DELAY_MS = 140
/** How hard the held bubble follows the pointer; the release keeps that speed, so it is a throw. */
const GRAB_PULL = 16
/** A bubble leaving the rim this fast upwards flies out instead of dropping back in. */
const ESCAPE_SPEED = 200
const SHAKE = { up: [1500, 2300], side: 900 } as const
const AIR_DRAG = 0.996

/**
 * Team jar: people and stack bubbles in a jar with a lid. Hover a bubble for its card, drag to
 * throw; with the lid off a bubble can be thrown or shaken out. Out of the jar it falls through
 * the landing (the screen's sides are walls) and lands on the footer in the final scene.
 */
export const mountTeam = (ctx: EngineContext) => {
  const { root, state, signal } = ctx
  const pit = must({ root, selector: '#pit', type: HTMLElement })
  const hc = must({ root, selector: '#hc', type: HTMLElement })
  const jarEl = must({ root, selector: '#jar', type: HTMLElement })
  const lid = must({ root, selector: '#jarLid', type: HTMLButtonElement })
  const toggles = root.querySelectorAll<HTMLButtonElement>(
    'button[data-jar="toggle"]',
  )
  const shakeBtn = root.querySelector<HTMLButtonElement>('[data-jar="shake"]')
  const collectBtn = root.querySelector<HTMLButtonElement>(
    '[data-jar="collect"]',
  )
  const footerLink = root.querySelector<HTMLAnchorElement>(
    '[data-jar="footer"]',
  )

  /* bubbles out of the jar live above every scene, in one fixed layer */
  const loose = document.createElement('div')
  loose.className = lc('loose')
  loose.setAttribute('aria-hidden', 'true')
  root.appendChild(loose)
  ctx.onDispose(() => loose.remove())

  const bubbles: Bubble[] = teamMembers(ctx).map((d) => {
    const el = document.createElement('div')
    el.className = lc(`ball ${d.kind}`)
    el.style.background = d.bg
    el.textContent = d.label
    el.setAttribute('aria-label', d.name)
    el.title = d.name
    pit.appendChild(el)
    return {
      d,
      el,
      r: d.r,
      rJar: d.r,
      place: 'jar',
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
    jar: JarBox
    open: boolean
    grab: Bubble | null
    /** Pointer target of the held bubble, in its place's coordinates. */
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
    jar: jarBox({ w: 880, h: 780 }),
    open: false,
    grab: null,
    gx: 0,
    gy: 0,
    hover: null,
    cardH: 0,
    hideT: 0,
    run: false,
  }

  const sceneId = () => ctx.scenes[state.index]?.id
  /** Pit pixels per viewport pixel (the board is scaled to the window). */
  const pitScale = () => {
    const r = pit.getBoundingClientRect()
    return { rect: r, k: (r.width || 1) / (pit.offsetWidth || 1) }
  }
  const footerTop = () => {
    const footer = root.querySelector('#cta .footer')
    const top = footer?.getBoundingClientRect().top ?? 0
    return top > 0 ? top : window.innerHeight
  }

  const sizeBubble = (b: Bubble) => {
    b.el.style.width = `${b.r * 2}px`
    b.el.style.height = `${b.r * 2}px`
    b.el.style.fontSize = b.d.kind === 'tech' ? `${12 * (b.r / b.d.r)}px` : ''
  }

  const layoutJar = () => {
    TP.w = pit.offsetWidth
    TP.h = pit.offsetHeight
    TP.jar = jarBox({ w: TP.w, h: TP.h })
    const { left, top, right, bottom, scale } = TP.jar
    Object.assign(jarEl.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${right - left}px`,
      height: `${bottom - top}px`,
    })
    Object.assign(lid.style, {
      left: `${left - 12 * scale}px`,
      top: `${top - 30 * scale}px`,
      width: `${right - left + 24 * scale}px`,
      height: `${34 * scale}px`,
    })
    for (const b of bubbles) {
      b.rJar = b.d.r * scale
      if (b.place === 'jar') {
        b.r = b.rJar
        sizeBubble(b)
      }
    }
  }

  /** Moves a bubble out of the jar into the landing layer, keeping its place on screen. */
  const toLoose = (b: Bubble) => {
    const { rect, k } = pitScale()
    b.p.x = rect.left + b.p.x * k
    b.p.y = rect.top + b.p.y * k
    b.v.x *= k
    b.v.y *= k
    b.r = b.rJar * k
    b.place = 'loose'
    if (TP.grab === b) {
      TP.gx = rect.left + TP.gx * k
      TP.gy = rect.top + TP.gy * k
    }
    if (TP.hover === b) hideCard()
    b.el.classList.add('loose-ball')
    loose.appendChild(b.el)
    sizeBubble(b)
    syncControls()
  }

  /** Drops a loose bubble back into the jar when it falls through the open rim. */
  const toJar = (b: Bubble) => {
    const { rect, k } = pitScale()
    b.p.x = (b.p.x - rect.left) / k
    b.p.y = (b.p.y - rect.top) / k
    b.v.x /= k
    b.v.y /= k
    b.r = b.rJar
    b.place = 'jar'
    b.el.classList.remove('loose-ball')
    b.el.style.visibility = ''
    pit.insertBefore(b.el, hc)
    sizeBubble(b)
    syncControls()
  }

  const setLid = (open: boolean) => {
    TP.open = open
    lid.setAttribute('aria-pressed', String(open))
    for (const t of toggles)
      if (t !== lid)
        t.textContent = ctx.copy(open ? 'team.jar_close' : 'team.jar_open')
    /* off, the lid leans against the jar's right wall, pivoting on its right end */
    const { scale } = TP.jar
    gsap.to(lid, {
      transformOrigin: '100% 50%',
      x: open ? 18 * scale : 0,
      y: open ? 70 * scale : 0,
      rotate: open ? -90 : 0,
      duration: ctx.reduce ? 0 : 0.7,
      ease: open ? 'back.out(1.4)' : 'power3.inOut',
      overwrite: 'auto',
    })
  }

  const syncControls = () => {
    const out = bubbles.filter((b) => b.place !== 'jar').length
    if (collectBtn) collectBtn.hidden = out === 0
    if (footerLink) {
      footerLink.hidden = out === 0
      footerLink.textContent = `${ctx.copy('team.jar_in_footer', { count: out })} ↓`
    }
  }

  /** Re-drops the bubbles still in the jar from above it (on every visit to the scene). */
  const reset = () => {
    layoutJar()
    const { left, right, top } = TP.jar
    bubbles.forEach((b, i) => {
      if (b.place !== 'jar') return
      b.p.x = left + b.r + rndf(i) * Math.max(0, right - left - b.r * 2)
      b.p.y = top - b.r - rndf(i + 9) * 420 - (b.d.kind === 'person' ? 360 : 0)
      b.v.x = (rndf(i + 3) - 0.5) * 200
      b.v.y = 0
    })
    TP.run = true
  }

  /** Every bubble back in the jar, lid on. */
  const collect = () => {
    for (const b of bubbles) if (b.place !== 'jar') toJar(b)
    setLid(false)
    reset()
  }

  const shake = () => {
    const { scale } = TP.jar
    for (const [i, b] of bubbles.entries()) {
      if (b.place !== 'jar') continue
      const lift = TP.open ? 1 : 0.35
      b.v.y =
        -(SHAKE.up[0] + rndf(i + 31) * (SHAKE.up[1] - SHAKE.up[0])) *
        lift *
        Math.sqrt(scale)
      b.v.x = (rndf(i + 17) - 0.5) * SHAKE.side * (TP.open ? 2 : 0.6)
    }
    if (!ctx.reduce)
      gsap.fromTo(
        jarEl,
        { rotate: -4 },
        { rotate: 0, duration: 0.5, ease: 'elastic.out(1.2, .3)' },
      )
  }

  /* cards */
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
  function hideCard() {
    TP.hideT = window.setTimeout(() => {
      TP.hover = null
      hc.classList.remove('open')
      for (const o of bubbles) o.el.classList.remove('hot')
    }, HIDE_DELAY_MS)
  }
  ctx.onDispose(() => window.clearTimeout(TP.hideT))

  /* pointer: the drag follows the window, so a bubble can be carried out of the pit */
  const target = (b: Bubble, e: PointerEvent): [number, number] => {
    if (b.place !== 'jar') return [e.clientX, e.clientY]
    const { rect, k } = pitScale()
    return [(e.clientX - rect.left) / k, (e.clientY - rect.top) / k]
  }
  for (const b of bubbles) {
    b.el.addEventListener(
      'pointerenter',
      () => {
        if (!TP.grab && b.place === 'jar') showCard(b)
      },
      { signal },
    )
    b.el.addEventListener('pointerleave', hideCard, { signal })
    b.el.addEventListener(
      'pointerdown',
      (e) => {
        e.preventDefault()
        TP.grab = b
        state.dragging = true
        ;[TP.gx, TP.gy] = target(b, e)
        hc.classList.remove('open')
      },
      { signal },
    )
  }
  hc.addEventListener('pointerenter', () => window.clearTimeout(TP.hideT), {
    signal,
  })
  hc.addEventListener('pointerleave', hideCard, { signal })
  window.addEventListener(
    'pointermove',
    (e) => {
      if (TP.grab) [TP.gx, TP.gy] = target(TP.grab, e)
    },
    { signal },
  )
  const drop = () => {
    TP.grab = null
    state.dragging = false
  }
  window.addEventListener('pointerup', drop, { signal })
  window.addEventListener('pointercancel', drop, { signal })

  for (const t of toggles)
    t.addEventListener('click', () => setLid(!TP.open), { signal })
  shakeBtn?.addEventListener('click', shake, { signal })
  collectBtn?.addEventListener('click', collect, { signal })

  /* physics */
  const follow = (b: Bubble, dt: number) => {
    if (TP.grab === b) {
      b.v.x = (TP.gx - b.p.x) * GRAB_PULL
      b.v.y = (TP.gy - b.p.y) * GRAB_PULL
    } else b.v.y += GRAVITY * (b.r / b.rJar) * dt
    b.v.x *= AIR_DRAG
    b.p.x += b.v.x * dt
    b.p.y += b.v.y * dt
  }
  const stepJar = (dt: number) => {
    const inJar = bubbles.filter((b) => b.place === 'jar')
    for (const b of inJar) {
      follow(b, dt)
      containInJar({ ball: b, jar: TP.jar, open: TP.open })
    }
    for (let it = 0; it < 3; it++)
      collideBalls({
        balls: inJar,
        dims: 2,
        bounce: 1.3,
        /* the held bubble does not give way */
        inverseMass: (o) => (TP.grab === o ? 0 : 1 / o.r),
      })
    /* collisions may shove a bubble into the glass: put it back inside */
    for (const b of inJar) containInJar({ ball: b, jar: TP.jar, open: TP.open })
    if (!TP.open) return
    const { left, right } = TP.jar
    for (const b of inJar)
      if (
        hasLeftJar({ ball: b, jar: TP.jar }) &&
        (TP.grab === b ||
          b.v.y < -ESCAPE_SPEED ||
          b.p.x < left ||
          b.p.x > right)
      )
        toLoose(b)
  }
  const stepLoose = (dt: number) => {
    const out = bubbles.filter((b) => b.place === 'loose')
    if (!out.length) return
    const floor = sceneId() === 'cta' ? footerTop() : null
    const onTeam = sceneId() === 'team'
    const { rect, k } = pitScale()
    for (const b of out) {
      follow(b, dt)
      if (
        containLoose({
          ball: b,
          width: window.innerWidth,
          height: window.innerHeight,
          floor,
        }) &&
        TP.grab !== b
      ) {
        b.place = 'gone'
        b.el.style.visibility = 'hidden'
        continue
      }
      /* falling back through the open rim puts it back in the jar */
      if (onTeam && TP.open && b.v.y > 0 && TP.grab !== b) {
        const x = (b.p.x - rect.left) / k
        const y = (b.p.y - rect.top) / k
        const { left, right, top } = TP.jar
        if (
          x > left + b.rJar &&
          x < right - b.rJar &&
          y > top &&
          y < top + b.rJar
        )
          toJar(b)
      }
    }
    collideBalls({
      balls: out.filter((b) => b.place === 'loose'),
      dims: 2,
      bounce: 1.3,
      inverseMass: (o) => (TP.grab === o ? 0 : 1 / o.r),
    })
  }

  /** The footer scene catches what fell: everything gone drops in from above the screen. */
  const catchInFooter = () => {
    let n = 0
    for (const b of bubbles) {
      if (b.place !== 'gone') continue
      b.place = 'loose'
      b.p.x = b.r + rndf(n + 41) * (window.innerWidth - b.r * 2)
      b.p.y = -b.r - n * 70
      b.v.x = (rndf(n + 7) - 0.5) * 160
      b.v.y = 0
      b.el.style.visibility = ''
      n++
    }
  }

  /** Writes the simulated positions to the DOM: once per frame, after all sub-steps. */
  const render = () => {
    for (const b of bubbles)
      if (b.place !== 'gone')
        b.el.style.transform = `translate(${b.p.x - b.r}px, ${b.p.y - b.r}px)`
    if (TP.hover) {
      const b = TP.hover
      const above = b.p.y - b.r - 14 > TP.cardH
      hc.style.transform = `translate(${Math.max(8, Math.min(TP.w - CARD_WIDTH - 8, b.p.x - CARD_WIDTH / 2))}px, ${above ? b.p.y - b.r - 12 - TP.cardH : b.p.y + b.r + 12}px)`
    }
  }
  const tick = () => {
    const id = sceneId()
    const looseLive = bubbles.some((b) => b.place === 'loose')
    if (!TP.run || (id !== 'team' && !looseLive)) return
    const dt = Math.min(0.033, gsap.ticker.deltaRatio() / 60)
    for (const h of [0.5, 0.5]) {
      if (id === 'team') stepJar(dt * h)
      stepLoose(dt * h)
    }
    render()
  }
  window.addEventListener('resize', layoutJar, { signal })

  if (ctx.reduce) {
    /* static page: the bubbles settle once in the closed jar; the toy controls stay hidden */
    reset()
    for (let i = 0; i < 360; i++) stepJar(1 / 60)
    render()
    return { team: reset, cta: () => {} }
  }
  syncControls()
  gsap.ticker.add(tick)
  ctx.onDispose(() => gsap.ticker.remove(tick))
  return { team: reset, cta: catchInFooter }
}
