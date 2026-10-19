/**
 * Canvas and WebGL cannot read CSS variables, so the engine resolves palette tokens to their
 * computed colours at runtime. Only palette names are written here; the values live in the tokens.
 */
export type PaletteToken =
  | 'purple-50'
  | 'purple-300'
  | 'purple-400'
  | 'purple-500'
  | 'purple-800'
  | 'purple-900'
  | 'purple-950'
  | 'magenta-500'
  | 'blue-400'
  | 'blue-500'
  | 'blue-600'
  | 'blue-700'
  | 'green-500'
  | 'green-950'
  | 'amber-500'
  | 'amber-950'
  | 'red-50'
  | 'red-600'
  | 'red-700'
  | 'neutral-400'
  | 'neutral-500'
  | 'neutral-700'
  | 'neutral-800'
  | 'neutral-900'
  | 'white'

/** Fallback when a token is missing (unstyled test DOM): the brand violet. */
const FALLBACK = 'rgb(124, 58, 237)'

/** The computed colour of a palette token, e.g. `#7c3aed`. */
export const token = (name: PaletteToken) => {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${name}`)
    .trim()
  return v || FALLBACK
}

/** `rgba()` of a token with an alpha, for 2D canvas fills. */
export const tokenAlpha = ({
  name,
  alpha,
}: {
  name: PaletteToken
  alpha: number
}) => {
  const [r, g, b] = rgbOf(token(name))
  return `rgba(${r},${g},${b},${alpha})`
}

/** Parses `#rgb`, `#rrggbb` or `rgb()/rgba()` into 0–255 channels. */
export const rgbOf = (color: string): [number, number, number] => {
  const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1]
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex
    const ch = (i: number) => Number.parseInt(full.slice(i, i + 2), 16)
    return [ch(0), ch(2), ch(4)]
  }
  const nums = color.match(/[\d.]+/g)?.map(Number) ?? []
  return [nums[0] ?? 124, nums[1] ?? 58, nums[2] ?? 237]
}

/** Linear blend between two colours, as `rgb()`. */
export const mixRgb = ({ a, b, t }: { a: string; b: string; t: number }) => {
  const pa = rgbOf(a)
  const pb = rgbOf(b)
  return `rgb(${pa.map((v, i) => Math.round(v + ((pb[i] ?? v) - v) * t)).join(',')})`
}

/** The landing reads the app theme from the class ThemeScript puts on `<html>`. */
export const isLightTheme = () =>
  document.documentElement.classList.contains('light')
