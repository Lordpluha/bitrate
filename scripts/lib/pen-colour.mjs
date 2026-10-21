/**
 * Colour helpers and paths shared by the Pencil colour scripts (`sync-pen-tokens.mjs`,
 * `bind-pen-colors.mjs`).
 */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..')
export const LIBRARY = join(ROOT, 'pencil/web-player-design/design-system/bitrate.lib.pen')

/** A Pencil hex colour: #rgb, #rgba, #rrggbb or #rrggbbaa. */
export const HEX = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

/** Fully transparent stops (`#rrggbb00`) carry no colour, only the fade — they need no token. */
export const isTransparent = (hex) => hex.length === 9 && hex.endsWith('00')

/** Parses a hex colour into sRGB channels in [0, 1]. */
export function parseHex(hex) {
  let h = hex.slice(1)
  if (h.length <= 4) h = [...h].map((c) => c + c).join('')
  const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) : 1 }
}

/** sRGB transfer function: gamma-encoded channel → linear light. */
export const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

/** sRGB → OKLab as `[L, a, b]`. */
export function rgbToOklab({ r, g, b }) {
  const [lr, lg, lb] = [r, g, b].map(toLinear)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}
