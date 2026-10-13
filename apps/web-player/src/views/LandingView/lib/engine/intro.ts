import { gsap } from 'gsap'
import { lc } from '../styles/lc'
import type { EngineContext } from './context'

/* The pen's route through the Bitrate mark, in the mark's own coordinates (viewBox 371 117 795 775). */
const SPINE_A =
  'M 405 152 C 430 200 470 211 560 211 L 900 211 C 1010 211 1050 280 1050 350 C 1050 430 990 493 900 493 L 720 493 C 560 493 470 600 425 780'
const SPINE_B =
  'M 860 493 C 1000 493 1050 560 1050 650 C 1050 750 990 805 900 805 L 640 805 C 580 805 540 830 512 868'
/** The flourish between the two ribbons runs through the open counter of the lower bowl. */
const CONNECT = 'M 425 780 C 470 660 640 610 760 560 C 820 535 845 505 860 493'
/** The route skips the bars' pointed tips: the ribbons themselves cover them. */
const A_REST =
  'L 900 211 C 1010 211 1050 280 1050 350 C 1050 430 990 493 900 493 L 720 493 C 560 493 470 600 425 780'
const B_HEAD =
  'M 860 493 C 1000 493 1050 560 1050 650 C 1050 750 990 805 900 805 L 640 805'
/** Brand-mark gradient stops (brand asset, same as the logo symbol in LandingIcons). */
const STOPS: readonly (readonly [string, string])[] = [
  ['0', '#490AE5'],
  ['.22', '#5515EF'],
  ['.45', '#6824F8'],
  ['.65', '#8037FB'],
  ['.82', '#9E4EFB'],
  ['1', '#C060FA'],
]
const CX = 768.5
const CY = 504.5
const RIBBON = 118
/** The mark's share of the viewport's short side. */
const SIZE = 0.3
const SVG_NS = 'http://www.w3.org/2000/svg'
/** Session flag: the intro plays once per tab session. */
const SEEN_KEY = 'bitrate-landing-intro'

const svgEl = <K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string>,
) => {
  const el = document.createElementNS(SVG_NS, tag)
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  return el
}
const gradient = ({
  id,
  stops,
  attrs = {},
}: {
  id: string
  stops: readonly (readonly [string, string])[]
  attrs?: Record<string, string>
}) => {
  const g = svgEl('linearGradient', {
    id,
    gradientUnits: 'userSpaceOnUse',
    ...attrs,
  })
  for (const [offset, color] of stops)
    g.appendChild(svgEl('stop', { offset, 'stop-color': color }))
  return g
}
const clamp = (v: number) => Math.min(1, Math.max(0, v))

/**
 * Draws the logo in one gesture inside `el`: a ribbon in the brand gradient flies in past the edge,
 * reveals the mark exactly where it passes and leaves past the opposite edge.
 */
const drawLogo = ({ el, onDone }: { el: HTMLElement; onDone: () => void }) => {
  const logo = document.getElementById('bitrate-logo')
  if (!(logo instanceof SVGGeometryElement)) {
    onDone()
    return () => {}
  }
  const svg = svgEl('svg', {
    class: lc('ll-draw'),
    width: '100%',
    height: '100%',
    'aria-hidden': 'true',
  })
  const defs = svgEl('defs', {})
  defs.append(
    gradient({
      id: 'lg-intro',
      stops: STOPS,
      attrs: { x1: '371', y1: '0', x2: '1166', y2: '0' },
    }),
    gradient({
      id: 'gi-intro',
      stops: [...STOPS]
        .reverse()
        .map(([o, c]) => [String(1 - Number(o)), c] as const),
    }),
    gradient({ id: 'go-intro', stops: STOPS }),
  )
  const mask = svgEl('mask', {
    id: 'lm-intro',
    maskUnits: 'userSpaceOnUse',
    x: '-100000',
    y: '-100000',
    width: '200000',
    height: '200000',
  })
  const spine = (d: string) =>
    svgEl('path', {
      d,
      fill: 'none',
      stroke: 'white',
      'stroke-width': '150',
      'stroke-linecap': 'round',
    })
  const sa = spine(SPINE_A)
  const sb = spine(SPINE_B)
  mask.append(sa, sb)
  defs.append(mask)
  const mark = svgEl('g', { class: lc('mark') })
  const trace = svgEl('use', {
    href: '#bitrate-logo',
    fill: 'none',
    stroke: 'white',
    'stroke-width': '6',
    opacity: '0',
  })
  mark.append(
    svgEl('use', {
      href: '#bitrate-logo',
      fill: 'url(#lg-intro)',
      opacity: '.07',
    }),
    svgEl('use', {
      href: '#bitrate-logo',
      fill: 'url(#lg-intro)',
      mask: 'url(#lm-intro)',
    }),
    trace,
  )
  const lead = svgEl('path', {
    fill: 'none',
    stroke: 'url(#gi-intro)',
    'stroke-width': String(RIBBON),
  })
  const out = svgEl('path', {
    fill: 'none',
    stroke: 'url(#go-intro)',
    'stroke-width': String(RIBBON),
  })
  const route = svgEl('path', { fill: 'none', stroke: 'none' })
  const head = svgEl('circle', {
    class: lc('head'),
    r: '46',
    fill: 'var(--color-purple-200)',
    opacity: '0',
  })
  svg.append(defs, mark, lead, out, route, head)
  el.replaceChildren(svg)

  const measure = (d: string) => {
    const p = svgEl('path', { d })
    svg.appendChild(p)
    const l = p.getTotalLength()
    p.remove()
    return l
  }
  const LOGO = logo.getTotalLength()
  const la = measure(SPINE_A)
  const lb = measure(SPINE_B)
  const lConnect = measure(CONNECT)
  const aTip = measure('M 405 152 C 430 200 470 211 560 211')
  const laRest = measure(`M 560 211 ${A_REST}`)
  const lbHead = measure(B_HEAD)
  sa.setAttribute('stroke-dasharray', `${la} ${la}`)
  sb.setAttribute('stroke-dasharray', `${lb} ${lb}`)
  trace.setAttribute('stroke-dasharray', `${LOGO * 0.12} ${LOGO}`)
  /** P: where the pen is along the whole route; T: where the ribbon's tail is. */
  const g = { lin: 0, lout: 0, total: 0, P: 0, T: 0 }
  const paint = () => {
    const { lin, lout, total, P, T } = g
    const bStart = lin + laRest + lConnect
    const oStart = bStart + lbHead
    const drawn = (x: number, start: number, len: number) =>
      clamp((x - start) / len)
    lead.style.strokeDashoffset = String(
      lin * (1 - drawn(P, 0, lin)) - lin * drawn(T, 0, lin),
    )
    out.style.strokeDashoffset = String(
      lout * (1 - drawn(P, oStart, lout)) - lout * drawn(T, oStart, lout),
    )
    /* the tip of bar A appears with the ribbon's arrival; bar B's tail tip completes when the ribbon leaves */
    const a = P < lin ? 0 : (aTip + (la - aTip) * drawn(P, lin, laRest)) / la
    const b =
      P < bStart
        ? 0
        : P >= oStart
          ? 1
          : (lbHead / lb) * drawn(P, bStart, lbHead)
    sa.style.strokeDashoffset = String(la * (1 - a))
    sb.style.strokeDashoffset = String(lb * (1 - b))
    const pt = route.getPointAtLength(Math.min(total, Math.max(0, P)))
    head.setAttribute('cx', String(pt.x))
    head.setAttribute('cy', String(pt.y))
  }
  /* the viewBox keeps the mark centred; both ribbons start and end beyond the edges */
  const layout = () => {
    const w = el.clientWidth || 1
    const h = el.clientHeight || 1
    const s = (Math.min(w, h) * SIZE) / 775
    const vw = w / s
    const vh = h / s
    const vx = CX - vw / 2
    const vy = CY - vh / 2
    svg.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`)
    const pad = RIBBON * 2
    const ld = `M ${vx - pad} ${vy - pad} C ${vx + vw * 0.16} ${vy + vh * 0.02} 430 211 560 211`
    const od = `M 640 805 C 520 805 ${vx + vw * 0.1} ${vy + vh * 0.92} ${vx - pad * 1.4} ${vy + vh + pad}`
    const gi = svg.querySelector('#gi-intro')
    const go = svg.querySelector('#go-intro')
    const set4 = (n: Element | null, v: readonly number[]) => {
      for (const [i, k] of ['x1', 'y1', 'x2', 'y2'].entries())
        n?.setAttribute(k, String(v[i]))
    }
    set4(gi, [vx - pad, vy - pad, 560, 211])
    set4(go, [640, 805, vx - pad * 1.4, vy + vh + pad])
    lead.setAttribute('d', ld)
    out.setAttribute('d', od)
    g.lin = lead.getTotalLength()
    g.lout = out.getTotalLength()
    lead.setAttribute('stroke-dasharray', `${g.lin} ${g.lin}`)
    out.setAttribute('stroke-dasharray', `${g.lout} ${g.lout}`)
    route.setAttribute(
      'd',
      `${ld} ${A_REST} ${CONNECT.replace(/^M 425 780/, '')} L 860 493 ${B_HEAD.replace(/^M 860 493/, '')} ${od.replace(/^M 640 805/, '')}`,
    )
    g.total = route.getTotalLength()
    paint()
  }
  layout()
  const ro = new ResizeObserver(layout)
  ro.observe(el)
  const tl = gsap.timeline({ onComplete: onDone })
  tl.set(mark, { opacity: 1 }, 0)
  tl.set(g, { P: 0, T: 0, onComplete: paint }, 0)
  tl.to(head, { attr: { opacity: 0.8 }, duration: 0.2 }, 0)
  tl.to(
    g,
    { P: () => g.total, duration: 2.4, ease: 'power1.inOut', onUpdate: paint },
    0,
  )
  tl.to(head, { attr: { opacity: 0 }, duration: 0.25 }, 2.2)
  tl.to(
    g,
    { T: () => g.total, duration: 1.3, ease: 'power2.in', onUpdate: paint },
    1.6,
  )
  /* the white outline runs only once the mark is fully painted */
  tl.set(trace, { attr: { opacity: 0 } }, 0)
  tl.fromTo(
    trace,
    { attr: { opacity: 1 }, strokeDashoffset: 0 },
    {
      strokeDashoffset: -LOGO * 1.12,
      duration: 0.9,
      ease: 'power1.inOut',
      immediateRender: false,
    },
    2.45,
  )
  tl.to(trace, { attr: { opacity: 0 }, duration: 0.2 }, 3.25)
  return () => {
    tl.kill()
    ro.disconnect()
  }
}

const seenThisSession = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}
const markSeen = () => {
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    /* storage blocked: the intro simply plays again next time */
  }
}

/** The logo intro: one write-on pass per session, then the scenes start. Resolves when scenes may enter. */
export const playIntro = (ctx: EngineContext) =>
  new Promise<void>((resolve) => {
    const intro = ctx.root.querySelector<HTMLElement>('.intro')
    const canvas = intro?.querySelector<HTMLElement>('.intro-ll')
    if (!intro || !canvas || ctx.reduce || seenThisSession()) {
      if (intro) intro.hidden = true
      resolve()
      return
    }
    markSeen()
    const stop = drawLogo({ el: canvas, onDone: () => {} })
    ctx.onDispose(stop)
    gsap.from(intro.querySelectorAll('b, .mono'), {
      opacity: 0,
      y: 10,
      duration: 0.5,
      delay: 1.2,
      stagger: 0.1,
    })
    gsap.to(intro, {
      opacity: 0,
      duration: 0.6,
      delay: 3.5,
      ease: 'power2.inOut',
      onStart: resolve,
      onComplete: () => {
        stop()
        intro.hidden = true
      },
    })
  })
