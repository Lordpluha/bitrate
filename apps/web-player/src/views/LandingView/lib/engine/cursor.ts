import { gsap } from 'gsap'
import type { EngineContext } from './context'

type Mode =
  | 'default'
  | 'disabled'
  | 'scrub'
  | 'text'
  | 'drag'
  | 'hide'
  | 'play'
  | 'hover'
  | string

/** Large hover targets do not pull the ring towards their centre. */
const MAGNET_MAX = { width: 260, height: 120 }
const MAGNET_PULL = 0.25
const LISTEN_THRESHOLD = 0.02

const modeOf = (el: EventTarget | null): [Mode, Element | null] => {
  if (!(el instanceof Element)) return ['default', null]
  const tagged = el.closest<HTMLElement>('[data-cursor]')
  if (tagged) return [tagged.dataset.cursor ?? 'default', tagged]
  if (el.closest('[disabled], [aria-disabled="true"]'))
    return ['disabled', null]
  if (el.closest('input[type="range"], .prog')) return ['scrub', null]
  if (el.closest('input, textarea, [contenteditable="true"]'))
    return ['text', null]
  if (el.closest('.drag-zone, .ball')) return ['drag', null]
  if (el.closest('.thumb')) return ['hide', null]
  const play = el.closest('.art, .cv, .playbtn, .cover')
  if (play) return ['play', play]
  const hit = el.closest(
    'a, button, [role="button"], [role="tab"], [role="option"], summary, label, .magnetic, .node',
  )
  if (hit) return ['hover', hit]
  return ['default', null]
}

/** The Signal cursor: a ring that changes with what it is over (fine pointers only; touch keeps the system cursor). */
export const mountCursor = (ctx: EngineContext & { level: () => number }) => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return
  const { root, signal } = ctx
  const slow = ctx.reduce ? 0 : 1
  const html = document.documentElement
  html.classList.add('has-cursor')
  const cur = document.createElement('div')
  cur.className = 'cur m-default is-out'
  cur.setAttribute('aria-hidden', 'true')
  const make = (cls: string, html = '') => {
    const d = document.createElement('div')
    d.className = cls
    d.innerHTML = html
    return d
  }
  const ringEl = make(
    'cur-ring',
    '<span class="cur-eq"><i></i><i></i><i></i><i></i><i></i></span><span class="cur-arrows">‹›</span><span class="cur-ban"></span>',
  )
  const pill = make('cur-pill', '<i></i><span></span>')
  const beam = make('cur-beam')
  const scrub = make('cur-scrub', '<b></b><i></i>')
  const dot = make('cur-dot')
  cur.append(ringEl, pill, beam, scrub, dot)
  const label = pill.querySelector('span')
  const playLabel = ctx.copy('chrome.cursor_play')
  if (label) label.textContent = playLabel
  const seek = scrub.querySelector('b')
  if (seek) seek.textContent = ctx.copy('chrome.cursor_seek')
  root.appendChild(cur)
  ctx.onDispose(() => {
    cur.remove()
    html.classList.remove('has-cursor')
  })
  const follow = (el: Element, d: number) =>
    [
      gsap.quickTo(el, 'x', { duration: d * slow, ease: 'power3' }),
      gsap.quickTo(el, 'y', { duration: d * slow, ease: 'power3' }),
    ] as const
  const ring = follow(ringEl, 0.38)
  const exact = [
    follow(pill, 0.22),
    follow(beam, 0.06),
    follow(scrub, 0.08),
    follow(dot, 0.05),
  ]
  const bars = [...ringEl.querySelectorAll<HTMLElement>('.cur-eq i')]
  let mode: Mode = 'default'
  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return
      cur.classList.remove('is-out')
      const [m, el] = modeOf(e.target)
      if (m !== mode) {
        cur.classList.replace(`m-${mode}`, `m-${m}`)
        mode = m
      }
      let x = e.clientX
      let y = e.clientY
      if (m === 'hover' && el) {
        const r = el.getBoundingClientRect()
        if (r.width < MAGNET_MAX.width && r.height < MAGNET_MAX.height) {
          x += (r.left + r.width / 2 - x) * MAGNET_PULL
          y += (r.top + r.height / 2 - y) * MAGNET_PULL
        }
      }
      if (m === 'play' && label)
        label.textContent =
          (el instanceof HTMLElement ? el.dataset.cursorLabel : undefined) ??
          playLabel
      ring[0](x)
      ring[1](y)
      for (const [fx, fy] of exact) {
        fx(e.clientX)
        fy(e.clientY)
      }
    },
    { passive: true, signal },
  )
  window.addEventListener('pointerdown', () => cur.classList.add('is-press'), {
    signal,
  })
  window.addEventListener('pointerup', () => cur.classList.remove('is-press'), {
    signal,
  })
  document.addEventListener('pointerleave', () => cur.classList.add('is-out'), {
    signal,
  })
  window.addEventListener('blur', () => cur.classList.add('is-out'), { signal })
  /* listening: bars pulse with the sound toggle's level */
  const tick = (t: number) => {
    const lv = ctx.level()
    const on = lv > LISTEN_THRESHOLD
    cur.classList.toggle('is-listen', on)
    if (!on) return
    bars.forEach((b, i) => {
      b.style.transform = `scaleY(${Math.min(1, 0.25 + lv * 1.6 * (0.6 + 0.4 * Math.sin(t * 9 + i * 1.3)))})`
    })
  }
  gsap.ticker.add(tick)
  ctx.onDispose(() => gsap.ticker.remove(tick))
}
