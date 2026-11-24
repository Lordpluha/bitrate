const VAR_REF = /^var\(--([\w-]+)\)$/
const COLOR_MIX = /^color-mix\(in srgb, (.+) (\d+(?:\.\d+)?)%, transparent\)$/
const HEX = /^#([0-9a-f]{6})$/i
const MAX_DEPTH = 16

/** Turns `#rrggbb` plus an alpha into `rgba(r, g, b, a)`. */
function hexToRgba(hex: string, alpha: number): string {
  const match = HEX.exec(hex)
  if (!match) throw new Error(`color-mix expects a #rrggbb colour, got "${hex}"`)
  const value = Number.parseInt(match[1], 16)
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255]
  return `rgba(${channels.join(', ')}, ${alpha})`
}

/**
 * Resolves a token value to something React Native understands: follows `var()` chains through
 * `vars` and flattens the `color-mix(in srgb, <hex> N%, transparent)` form the themes use for
 * shadows and scrims. Throws on anything it cannot resolve, so a new CSS construct fails the
 * generator instead of shipping an unusable colour.
 */
export function resolveTokenValue(value: string, vars: Record<string, string>, depth = 0): string {
  if (depth > MAX_DEPTH) throw new Error(`Token reference cycle near "${value}"`)

  const ref = VAR_REF.exec(value)
  if (ref) {
    const target = vars[ref[1]]
    if (target === undefined) throw new Error(`Unknown token --${ref[1]}`)
    return resolveTokenValue(target, vars, depth + 1)
  }

  const mix = COLOR_MIX.exec(value)
  if (mix) {
    const base = resolveTokenValue(mix[1], vars, depth + 1)
    return hexToRgba(base, Number(mix[2]) / 100)
  }

  return value
}
