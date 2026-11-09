import { useLayoutEffect, useRef } from 'react'
import { isMotionReduced } from '../lib/landingInteractions'
import type { ListeningPeriod } from '../lib/listeningPreview'

/** Preserve reading order while animating keyed rows between their old and new positions. */
export function useListeningReorder(period: ListeningPeriod) {
  const listRef = useRef<HTMLOListElement>(null)
  const first = useRef(new Map<string, number>())
  const previousPeriod = useRef(period)
  const capture = () => {
    first.current.clear()
    for (const row of listRef.current?.querySelectorAll<HTMLElement>(
      '[data-response-track]',
    ) ?? []) {
      first.current.set(
        row.dataset.responseTrack ?? '',
        row.getBoundingClientRect().top,
      )
    }
  }
  useLayoutEffect(() => {
    if (previousPeriod.current === period) return
    previousPeriod.current = period
    const previous = first.current
    first.current = new Map()
    const rows = [
      ...(listRef.current?.querySelectorAll<HTMLElement>(
        '[data-response-track]',
      ) ?? []),
    ]
    for (const row of rows)
      row.getAnimations?.().forEach((animation) => {
        animation.cancel()
      })
    if (isMotionReduced() || previous.size === 0) return
    const positions = rows.map((row) => ({
      row,
      top: row.getBoundingClientRect().top,
    }))
    const animations = positions.flatMap(({ row, top }) => {
      const from = previous.get(row.dataset.responseTrack ?? '')
      if (
        from === undefined ||
        Math.abs(from - top) < 1 ||
        typeof row.animate !== 'function'
      )
        return []
      return [
        row.animate(
          [
            { transform: `translateY(${from - top}px)` },
            { transform: 'translateY(0)' },
          ],
          { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        ),
      ]
    })
    return () => {
      for (const animation of animations) animation.cancel()
    }
  }, [period])
  return { listRef, capture }
}
