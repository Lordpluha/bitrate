import type { PointerEvent } from 'react'
import { motionReduced } from './motion'

/** Degrees the element leans at its edges. */
const MAX_TILT = 14

/**
 * Pointer handlers that lean an `.artist-tilt` element toward a mouse pointer and move its
 * shine. They write CSS properties directly, so the pointer never re-renders React.
 */
export const tiltHandlers = {
  onPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse' || motionReduced()) return
    const element = event.currentTarget
    const box = element.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width
    const y = (event.clientY - box.top) / box.height
    element.style.setProperty(
      '--tilt-x',
      `${((0.5 - y) * MAX_TILT).toFixed(2)}deg`,
    )
    element.style.setProperty(
      '--tilt-y',
      `${((x - 0.5) * MAX_TILT).toFixed(2)}deg`,
    )
    element.style.setProperty('--shine-x', `${(x * 100).toFixed(1)}%`)
    element.style.setProperty('--shine-y', `${(y * 100).toFixed(1)}%`)
  },
  onPointerLeave(event: PointerEvent<HTMLElement>) {
    for (const property of ['--tilt-x', '--tilt-y', '--shine-x', '--shine-y'])
      event.currentTarget.style.removeProperty(property)
  },
}
