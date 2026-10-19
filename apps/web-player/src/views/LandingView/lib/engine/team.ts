import { gsap } from 'gsap'
import type { LandingKey } from '../../model/messages/en'
import { lc } from '../styles/lc'
import { type EngineContext, must } from './context'

const REPO = 'https://github.com/Lordpluha/bitrate'

type Member = {
  kind: 'person' | 'tech'
  label: string
  name: string
  meta: string
  bio: string
  links: { text: string; href: string }[]
  /** CSS background (palette token references only). */
  bg: string
  r: number
}

type TechRow = { label: string; role: LandingKey; path: string; bg: string }

const TECH: readonly TechRow[] = [
  {
    label: 'Next.js',
    role: 'team.tech_web_player',
    path: 'apps/web-player',
    bg: 'neutral-900',
  },
  {
    label: 'TanStack Start',
    role: 'team.tech_artist_portal',
    path: 'apps/web-artists',
    bg: 'magenta-500',
  },
  { label: 'NestJS', role: 'team.tech_api', path: 'apps/api', bg: 'red-600' },
  {
    label: 'Prisma',
    role: 'team.tech_data_layer',
    path: 'apps/api',
    bg: 'neutral-700',
  },
  {
    label: 'PostgreSQL',
    role: 'team.tech_database',
    path: 'apps/api',
    bg: 'blue-700',
  },
  { label: 'Redis', role: 'team.tech_cache', path: 'apps/api', bg: 'red-700' },
  {
    label: 'Svelte 5',
    role: 'team.tech_player_engine',
    path: 'packages/player',
    bg: 'amber-600',
  },
  {
    label: 'Angular',
    role: 'team.tech_admin',
    path: 'apps/admin',
    bg: 'red-800',
  },
  {
    label: 'Tauri 2',
    role: 'team.tech_desktop',
    path: 'apps/desktop',
    bg: 'blue-600',
  },
  {
    label: 'Expo',
    role: 'team.tech_mobile',
    path: 'apps/mobile',
    bg: 'neutral-800',
  },
  {
    label: 'Tailwind v4',
    role: 'team.tech_tokens',
    path: 'packages/ui-react',
    bg: 'blue-500',
  },
  {
    label: 'Turborepo',
    role: 'team.tech_monorepo',
    path: 'turbo.json',
    bg: 'purple-500',
  },
]

const members = ({ copy }: EngineContext): Member[] => [
  {
    kind: 'person',
    label: 'VT',
    name: 'Vladyslav Tesliuk',
    meta: `@Lordpluha · ${copy('team.role_author')}`,
    bio: copy('team.bio_author'),
    links: [
      { text: copy('team.github'), href: 'https://github.com/Lordpluha' },
      { text: copy('team.repository'), href: REPO },
    ],
    bg: 'linear-gradient(135deg, var(--color-purple-500), var(--color-magenta-500))',
    r: 92,
  },
  {
    kind: 'person',
    label: 'AK',
    name: 'Andrey Kalashnikov',
    meta: `@andreo-kalashnello · ${copy('team.role_contributor')}`,
    bio: copy('team.bio_contributor'),
    links: [
      {
        text: copy('team.github'),
        href: 'https://github.com/andreo-kalashnello',
      },
      { text: copy('team.repository'), href: REPO },
    ],
    bg: 'linear-gradient(135deg, var(--color-blue-500), var(--color-purple-500))',
    r: 92,
  },
  ...TECH.map(
    ({ label, role, path, bg }, i): Member => ({
      kind: 'tech',
      label,
      name: label,
      meta: copy(role),
      bio: copy('team.lives_in', { path }),
      links: [
        {
          text: copy('team.open_in_repo'),
          href: `${REPO}/tree/develop/${path}`,
        },
      ],
      bg: `var(--color-${bg})`,
      r: 40 + (i % 4) * 5,
    }),
  ),
]

type Bubble = {
  d: Member
  el: HTMLDivElement
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

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
  const bubbles: Bubble[] = members(ctx).map((d) => {
    const el = document.createElement('div')
    el.className = lc(`ball ${d.kind}`)
    el.style.width = `${d.r * 2}px`
    el.style.height = `${d.r * 2}px`
    el.style.background = d.bg
    el.textContent = d.label
    el.setAttribute('aria-label', d.name)
    pit.appendChild(el)
    return { d, el, x: 0, y: 0, vx: 0, vy: 0, r: d.r }
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
    hideT: number
    run: boolean
  } = {
    w: 880,
    h: 780,
    grab: null,
    gx: 0,
    gy: 0,
    hover: null,
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
      b.x = b.r + rndf(i) * (TP.w - b.r * 2)
      b.y = -b.r - rndf(i + 9) * 600 - (b.d.kind === 'person' ? 700 : 0)
      b.vx = (rndf(i + 3) - 0.5) * 200
      b.vy = 0
    })
    TP.run = true
  }
  const renderCard = (d: Member) => {
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
        b.vx = (TP.gx - b.x) * 16
        b.vy = (TP.gy - b.y) * 16
      } else b.vy += GRAVITY * dt
      b.vx *= 0.996
      b.x += b.vx * dt
      b.y += b.vy * dt
      if (b.x < b.r) {
        b.x = b.r
        b.vx = Math.abs(b.vx) * 0.4
      }
      if (b.x > TP.w - b.r) {
        b.x = TP.w - b.r
        b.vx = -Math.abs(b.vx) * 0.4
      }
      if (b.y > TP.h - b.r) {
        b.y = TP.h - b.r
        b.vy = -Math.abs(b.vy) * 0.32
        b.vx *= 0.94
      }
    }
    for (let it = 0; it < 3; it++) {
      for (let i = 0; i < bubbles.length; i++) {
        const a = bubbles[i]
        if (!a) continue
        for (let j = i + 1; j < bubbles.length; j++) {
          const c = bubbles[j]
          if (!c) continue
          const dx = c.x - a.x
          const dy = c.y - a.y
          const d = Math.hypot(dx, dy) || 1e-3
          const min = a.r + c.r
          if (d >= min) continue
          const nx = dx / d
          const ny = dy / d
          const ma = TP.grab === a ? 0 : 1 / a.r
          const mc = TP.grab === c ? 0 : 1 / c.r
          const sum = ma + mc || 1
          const corr = min - d
          a.x -= nx * corr * (ma / sum)
          a.y -= ny * corr * (ma / sum)
          c.x += nx * corr * (mc / sum)
          c.y += ny * corr * (mc / sum)
          const rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny
          if (rv < 0) {
            const imp = (-rv * 1.3) / sum
            a.vx -= nx * imp * ma
            a.vy -= ny * imp * ma
            c.vx += nx * imp * mc
            c.vy += ny * imp * mc
          }
        }
      }
    }
    for (const b of bubbles)
      b.el.style.transform = `translate(${b.x - b.r}px, ${b.y - b.r}px)`
    if (TP.hover) {
      const b = TP.hover
      const above = b.y - b.r - 14 > hc.offsetHeight
      hc.style.transform = `translate(${Math.max(8, Math.min(TP.w - CARD_WIDTH - 8, b.x - CARD_WIDTH / 2))}px, ${above ? b.y - b.r - 12 - hc.offsetHeight : b.y + b.r + 12}px)`
    }
  }
  const tick = () => {
    if (!TP.run || ctx.scenes[state.index]?.id !== 'team') return
    const dt = Math.min(0.033, gsap.ticker.deltaRatio() / 60)
    step(dt * 0.5)
    step(dt * 0.5)
  }
  if (ctx.reduce) {
    /* static page: let the bubbles settle once instead of animating the fall */
    reset()
    for (let i = 0; i < 360; i++) step(1 / 60)
    return reset
  }
  gsap.ticker.add(tick)
  ctx.onDispose(() => gsap.ticker.remove(tick))
  return reset
}
