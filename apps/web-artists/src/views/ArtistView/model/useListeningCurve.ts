import { useEffect, useRef } from 'react'
import { isMotionReduced } from '../lib/landingInteractions'
import { listeningPath, SOUND_CURVE } from '../lib/listeningPreview'

export function useListeningCurve(target: readonly number[], entered: boolean) {
  const lineRef = useRef<SVGPathElement>(null)
  const areaRef = useRef<SVGPathElement>(null)
  const current = useRef<readonly number[]>(SOUND_CURVE)
  useEffect(() => {
    if (!entered) return
    const line = lineRef.current
    const area = areaRef.current
    if (!line || !area) return
    const source = current.current
    let frame = 0
    const start = performance.now()
    const draw = (curve: readonly number[]) => {
      current.current = curve
      const path = listeningPath(curve)
      line.setAttribute('d', path)
      area.setAttribute('d', `${path} L600,220 L0,220 Z`)
    }
    if (isMotionReduced()) {
      draw(target)
      return
    }
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 1100)
      const eased = 1 - (1 - progress) ** 3
      draw(
        target.map(
          (value, index) => source[index] + (value - source[index]) * eased,
        ),
      )
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [entered, target])
  return { lineRef, areaRef }
}
