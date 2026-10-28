'use client'

import { type MouseEvent, type PointerEvent, useRef, useState } from 'react'

/** `next` is a swipe to the left, `prev` a swipe to the right. */
export type IslandSkipDirection = 'next' | 'prev'

/** Past this sideways distance a swipe commits to the neighbour; short of it the cover springs back. */
export const ISLAND_SKIP_DISTANCE = 46
/** How far the cover slides out of the ring: the ring's 40px artwork. */
export const ISLAND_PEEK_DISTANCE = 40
/** Movement below this is still a tap, so it reaches the tab under the finger. */
const DRAG_SLOP = 8
/** The cover follows the finger a little slower than the finger moves. */
const PEEK_RATIO = 0.85

type Drag = {
  axis: 'x' | 'y' | null
  dx: number
  x: number
  y: number
}

type UseIslandSkipGestureInput = {
  /** Whether there is a track on that side to skip to. */
  canSkip: (direction: IslandSkipDirection) => boolean
  onSkip: (direction: IslandSkipDirection) => void
}

const directionOf = (dx: number): IslandSkipDirection =>
  dx < 0 ? 'next' : 'prev'

/**
 * The island's sideways swipe (the design's Mobile/Island Skipping): it may start anywhere on
 * the island, tabs included. The pointer is captured only once it moves sideways, so a plain tap
 * still reaches the tab, and the click that ends a swipe is swallowed. While dragging, `offset`
 * slides the cover and `direction` names the neighbour coming in.
 */
export const useIslandSkipGesture = ({
  canSkip,
  onSkip,
}: UseIslandSkipGestureInput) => {
  const drag = useRef<Drag | null>(null)
  const swallowClick = useRef(false)
  const [dx, setDx] = useState(0)

  const end = (commit: boolean) => {
    const current = drag.current
    drag.current = null
    setDx(0)
    if (current?.axis !== 'x') return
    swallowClick.current = commit
    const direction = directionOf(current.dx)
    if (
      commit &&
      Math.abs(current.dx) > ISLAND_SKIP_DISTANCE &&
      canSkip(direction)
    ) {
      onSkip(direction)
    }
  }

  const handlers = {
    onClickCapture: (event: MouseEvent<HTMLElement>) => {
      if (!swallowClick.current) return
      swallowClick.current = false
      event.preventDefault()
      event.stopPropagation()
    },
    onPointerCancel: () => end(false),
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      swallowClick.current = false
      drag.current = { axis: null, dx: 0, x: event.clientX, y: event.clientY }
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      const current = drag.current
      if (!current) return
      const moveX = event.clientX - current.x
      const moveY = event.clientY - current.y
      if (!current.axis) {
        if (Math.hypot(moveX, moveY) < DRAG_SLOP) return
        current.axis = Math.abs(moveX) > Math.abs(moveY) ? 'x' : 'y'
        if (current.axis === 'x') {
          event.currentTarget.setPointerCapture?.(event.pointerId)
        }
      }
      if (current.axis !== 'x') return
      current.dx = moveX
      setDx(moveX)
    },
    onPointerUp: () => end(true),
  }

  return {
    direction: dx === 0 ? null : directionOf(dx),
    handlers,
    offset: Math.max(
      -ISLAND_PEEK_DISTANCE,
      Math.min(ISLAND_PEEK_DISTANCE, dx * PEEK_RATIO),
    ),
    /** 0 at rest, 1 once the swipe would commit: the cue's opacity. */
    progress: Math.min(1, Math.abs(dx) / ISLAND_SKIP_DISTANCE),
  }
}
