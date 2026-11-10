import { BOARD, MOBILE_MAX_WIDTH } from './context'

/**
 * How the landing lays out in a window:
 * - `scenes`: one scene per screen, the board fitted to the window;
 * - `tall`: the window is too short for the board, so scenes are fitted to the width and the
 *   page scrolls through them (short laptops would otherwise draw everything small);
 * - `phone`: the column layout for small screens.
 */
export type LandingMode = 'scenes' | 'tall' | 'phone'

/** A height-fitted board smaller than this reads small (its demo text drops under ~12px)… */
const SMALL_BOARD = 0.9
/** …and is worth scrolling for when fitting the width would make it this much larger. */
const WIDTH_GAIN = 1.04

/** The landing's layout mode and its board scale for a window. */
export const fitLanding = ({
  width,
  height,
}: {
  width: number
  height: number
}): { mode: LandingMode; scale: number } => {
  const byWidth = width / BOARD.width
  const byHeight = height / BOARD.height
  if (width <= MOBILE_MAX_WIDTH)
    return { mode: 'phone', scale: Math.min(byWidth, byHeight) }
  if (byHeight < SMALL_BOARD && byWidth >= byHeight * WIDTH_GAIN)
    return { mode: 'tall', scale: byWidth }
  return { mode: 'scenes', scale: Math.min(byWidth, byHeight) }
}
