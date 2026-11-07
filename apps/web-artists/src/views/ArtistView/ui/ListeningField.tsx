import { type RefObject, useEffect, useRef } from 'react'
import { isMotionReduced } from '../lib/landingInteractions'

const LINES = Array.from({ length: 112 }, (_, index) => ({
  id: `field-${index}`,
  x: (index % 14) * 46 + 12,
  y: Math.floor(index / 14) * 44 + 20,
}))

export function ListeningField({
  containerRef,
}: {
  containerRef: RefObject<HTMLElement | null>
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  useEffect(() => {
    const svg = svgRef.current
    const container = containerRef.current
    if (!svg || !container) return
    const lines = [...svg.querySelectorAll('line')]
    let frame = 0
    const reset = () => {
      cancelAnimationFrame(frame)
      frame = 0
      for (const line of lines) {
        line.removeAttribute('transform')
        line.setAttribute('opacity', '0.08')
      }
    }
    const move = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== 'mouse' || isMotionReduced() || frame) return
      const { clientX, clientY } = event
      frame = requestAnimationFrame(() => {
        frame = 0
        const box = svg.getBoundingClientRect()
        const x = ((clientX - box.left) / box.width) * 640
        const y = ((clientY - box.top) / box.height) * 360
        lines.forEach((line, index) => {
          const point = LINES[index]
          const distance = Math.hypot(x - point.x, y - point.y)
          const strength = Math.max(0, 1 - distance / 180)
          const angle = (Math.atan2(y - point.y, x - point.x) * 180) / Math.PI
          line.setAttribute(
            'transform',
            `rotate(${(angle * strength).toFixed(2)} ${point.x} ${point.y})`,
          )
          line.setAttribute('opacity', String(0.08 + strength * 0.2))
        })
      })
    }
    container.addEventListener('pointermove', move, { passive: true })
    container.addEventListener('pointerleave', reset)
    return () => {
      reset()
      container.removeEventListener('pointermove', move)
      container.removeEventListener('pointerleave', reset)
    }
  }, [containerRef])
  return (
    <svg
      aria-hidden="true"
      className="artist-response-field"
      preserveAspectRatio="none"
      ref={svgRef}
      viewBox="0 0 640 360"
    >
      {LINES.map((point) => (
        <line
          key={point.id}
          opacity="0.08"
          x1={point.x - 5}
          x2={point.x + 5}
          y1={point.y}
          y2={point.y}
        />
      ))}
    </svg>
  )
}
