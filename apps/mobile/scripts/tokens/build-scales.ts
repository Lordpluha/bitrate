import type { CssBlock } from './read-css-blocks'

export type Scales = {
  spacing: Record<string, number>
  radius: Record<string, number>
  fontSize: Record<string, number>
  fontWeight: Record<string, string>
}

const REM_PX = 16

/** Converts `0`, `1px` or `0.25rem` into density-independent points; null for anything else. */
function toPoints(value: string): number | null {
  if (value === '0') return 0
  const match = /^(-?\d*\.?\d+)(px|rem)$/.exec(value)
  if (!match) return null
  const amount = Number(match[1])
  return match[2] === 'rem' ? amount * REM_PX : amount
}

/** Picks every `--<prefix>-<step>` with a point value, keyed by its step. */
function pickPoints(vars: Record<string, string>, prefix: string): Record<string, number> {
  const scale: Record<string, number> = {}
  for (const [name, value] of Object.entries(vars)) {
    if (!name.startsWith(`${prefix}-`)) continue
    const points = toPoints(value)
    if (points !== null) scale[name.slice(prefix.length + 1)] = points
  }
  return scale
}

/** The theme-independent spacing, radius and type scales from the `@theme` blocks. */
export function buildScales(blocks: CssBlock[]): Scales {
  const vars = Object.assign({}, ...blocks.filter((b) => b.selector === '@theme').map((b) => b.vars))
  const fontWeight: Record<string, string> = {}
  for (const [name, value] of Object.entries(vars as Record<string, string>)) {
    if (name.startsWith('font-weight-')) fontWeight[name.slice('font-weight-'.length)] = value
  }

  return {
    spacing: pickPoints(vars, 'spacing'),
    radius: pickPoints(vars, 'radius'),
    fontSize: pickPoints(vars, 'text'),
    fontWeight,
  }
}
