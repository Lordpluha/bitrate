/** A swipe shorter than this (px) is a tap or a small adjustment, never a scene change. */
const MIN_SWIPE = 56
/** Slack for subpixel scroll positions at a list's edge. */
const EDGE = 2

/**
 * On a phone, a scene's main block scrolls on its own; a swipe that continues past its edge moves
 * to the next or previous scene. `dy` is the finger's travel up (positive) or down (negative).
 * The list must already have been at that edge when the finger went down, so the swipe that
 * scrolls a list to its end does not also throw the visitor into the next scene.
 * Returns 1 (next scene), -1 (previous) or 0 (stay).
 */
export const edgeSwipe = ({
  dy,
  scrollTop,
  startTop,
  scrollHeight,
  clientHeight,
}: {
  dy: number
  scrollTop: number
  startTop: number
  scrollHeight: number
  clientHeight: number
}): -1 | 0 | 1 => {
  if (Math.abs(dy) < MIN_SWIPE) return 0
  const end = Math.max(0, scrollHeight - clientHeight)
  const atEnd = (top: number) => top >= end - EDGE
  const atTop = (top: number) => top <= EDGE
  if (dy > 0 && atEnd(scrollTop) && atEnd(startTop)) return 1
  if (dy < 0 && atTop(scrollTop) && atTop(startTop)) return -1
  return 0
}
