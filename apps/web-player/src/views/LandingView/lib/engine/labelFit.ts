/** Average glyph width of the bubble font (semibold Inter), as a share of the font size. */
const GLYPH = 0.62
/** Share of the diameter a line may use: the circle narrows away from its middle. */
const LINE_SPAN = 0.78
/** Share of the diameter the stacked lines may use. */
const STACK_SPAN = 0.7
const LINE_HEIGHT = 1.1
/** Smallest size still readable on the landing. */
const MIN_FONT = 7

/**
 * The font size that keeps a bubble's label inside the bubble: words wrap at spaces, the longest
 * word must fit across and the lines must fit top to bottom; never larger than `base`.
 */
export const fitLabel = ({
  label,
  r,
  base,
}: {
  label: string
  r: number
  base: number
}) => {
  const words = label.split(' ')
  const longest = Math.max(...words.map((w) => w.length), 1)
  const across = (2 * r * LINE_SPAN) / (longest * GLYPH)
  const down = (2 * r * STACK_SPAN) / (words.length * LINE_HEIGHT)
  return Math.max(MIN_FONT, Math.min(base, across, down))
}
