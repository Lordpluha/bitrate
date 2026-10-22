import type { gsap } from 'gsap'

/** Types `text` into `el` on the timeline, touching the DOM only when another character appears. */
export const typeInto = ({
  tl,
  el,
  text,
  duration,
  at,
}: {
  tl: gsap.core.Timeline
  el: Element | null
  text: string
  duration: number
  at: number
}) => {
  if (!el) return
  el.textContent = ''
  const o = { n: 0 }
  let shown = 0
  tl.to(
    o,
    {
      n: text.length,
      duration,
      ease: 'none',
      onUpdate: () => {
        const n = Math.round(o.n)
        if (n === shown) return
        shown = n
        el.textContent = text.slice(0, n)
      },
    },
    at,
  )
}
