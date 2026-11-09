import { useEffect, useRef, useState } from 'react'
import { isMotionReduced } from '../lib/landingInteractions'

type SignalPoint = { x: number; y: number; spread: number }
type SignalLayout = {
  width: number
  height: number
  strands: { id: string; d: string }[]
  spine: string
  surface: string
}

const STRANDS = 13
const coordinate = (value: number) => value.toFixed(2)

function trace(points: SignalPoint[], offset: number) {
  const shifted = points.map((point, index) => {
    const before = points[Math.max(0, index - 1)]
    const after = points[Math.min(points.length - 1, index + 1)]
    const dx = after.x - before.x
    const dy = after.y - before.y
    const length = Math.hypot(dx, dy) || 1
    return {
      x: point.x + (offset * point.spread * dy) / length,
      y: point.y - (offset * point.spread * dx) / length,
    }
  })
  const slopes = shifted
    .slice(1)
    .map(
      (point, index) =>
        (point.x - shifted[index].x) / (point.y - shifted[index].y),
    )
  // Shared tangents give every join the same direction; the ribbon never makes
  // a right-angle turn or pinches all of its strands together between sections.
  const tangents = shifted.map((_, index) => {
    if (!index) return slopes[0]
    if (index === shifted.length - 1) return slopes[index - 1]
    const before = slopes[index - 1]
    const after = slopes[index]
    return before * after <= 0 ? 0 : (2 * before * after) / (before + after)
  })
  return shifted
    .map((point, index) => {
      if (!index) return `M${coordinate(point.x)},${coordinate(point.y)}`
      const previous = shifted[index - 1]
      const third = (point.y - previous.y) / 3
      return `C${coordinate(previous.x + tangents[index - 1] * third)},${coordinate(previous.y + third)} ${coordinate(point.x - tangents[index] * third)},${coordinate(point.y - third)} ${coordinate(point.x)},${coordinate(point.y)}`
    })
    .join(' ')
}

/** A page-sized ribbon follows section geometry; only its light moves on scroll. */
export function useLandingSignal() {
  const containerRef = useRef<HTMLDivElement>(null)
  const spineRef = useRef<SVGPathElement>(null)
  const headRef = useRef<SVGGElement>(null)
  const [layout, setLayout] = useState<SignalLayout | null>(null)

  useEffect(() => {
    const root = containerRef.current?.closest('.artist-landing')
    if (!root || typeof ResizeObserver === 'undefined') return
    const hero = root.querySelector('#landing-hero')
    const journey = root.querySelector('#landing-signal-flow')
    const response = root.querySelector('#landing-features')
    const cover = root.querySelector('.artist-finale-cover-stage')
    if (!hero || !journey || !response || !cover) return
    let frame = 0
    let signature = ''
    const measure = () => {
      frame = 0
      const bounds = root.getBoundingClientRect()
      if (!bounds.width || !bounds.height) return
      const h = hero.getBoundingClientRect()
      const j = journey.getBoundingClientRect()
      const r = response.getBoundingClientRect()
      const c = cover.getBoundingClientRect()
      const width = bounds.width
      const spread = Math.min(150, width * 0.12)
      const points: SignalPoint[] = [
        { x: width * 1.05, y: h.top - bounds.top + 60, spread: 0 },
        { x: width * 0.82, y: h.top - bounds.top + h.height * 0.48, spread },
        { x: width * 0.3, y: h.bottom - bounds.top + 150, spread },
        { x: width * 0.7, y: j.top - bounds.top + j.height * 0.5, spread },
        { x: width * 0.72, y: j.bottom - bounds.top - 60, spread },
        { x: width * 0.5, y: r.top - bounds.top + r.height * 0.4, spread },
        { x: width * 0.22, y: r.bottom - bounds.top + 60, spread },
        {
          x: c.left - bounds.left + c.width / 2,
          y: c.top - bounds.top + c.height / 2,
          spread: 0,
        },
      ]
      const nextSignature = JSON.stringify([width, bounds.height, points])
      if (signature === nextSignature) return
      signature = nextSignature
      const strands = Array.from({ length: STRANDS }, (_, index) => ({
        id: `signal-strand-${index}`,
        d: trace(points, (index / (STRANDS - 1)) * 2 - 1),
      }))
      // Reversing the path reverses its normal, tracing the opposite edge.
      const edgeBack = trace([...points].reverse(), 1).replace(/^M/, 'L')
      setLayout({
        width,
        height: bounds.height,
        strands,
        spine: trace(points, 0),
        surface: `${strands[STRANDS - 1].d} ${edgeBack} Z`,
      })
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    const observer = new ResizeObserver(schedule)
    for (const element of [root, hero, journey, response, cover]) {
      observer.observe(element)
    }
    measure()
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const spine = spineRef.current
    const head = headRef.current
    if (!layout || !container || !spine || !head) return
    const length = spine.getTotalLength()
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const update = () => {
      frame = 0
      if (isMotionReduced()) return
      // Locate the light by vertical position, so it stays beside the current viewport
      // even when the pinned release journey makes the page much taller.
      const target =
        window.innerHeight * 0.58 - container.getBoundingClientRect().top
      let low = 0
      let high = length
      for (let i = 0; i < 12; i++) {
        const middle = (low + high) / 2
        if (spine.getPointAtLength(middle).y < target) low = middle
        else high = middle
      }
      const position = (low + high) / 2
      const point = spine.getPointAtLength(position)
      container.style.setProperty(
        '--signal-position',
        String(position / length),
      )
      head.setAttribute(
        'transform',
        `translate(${coordinate(point.x)} ${coordinate(point.y)})`,
      )
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const settings = new MutationObserver(schedule)
    settings.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-motion'],
    })
    update()
    preference.addEventListener('change', schedule)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      settings.disconnect()
      cancelAnimationFrame(frame)
      preference.removeEventListener('change', schedule)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [layout])

  return { containerRef, spineRef, headRef, layout }
}
