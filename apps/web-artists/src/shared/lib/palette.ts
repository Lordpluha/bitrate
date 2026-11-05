/** Hue buckets used to group an image's colours. */
const HUES = 12
/** Pixels darker, lighter or greyer than this carry no colour worth glowing. */
const MIN_SATURATION = 0.22
const MIN_VALUE = 0.18
const MAX_VALUE = 0.97

interface Bucket {
  weight: number
  r: number
  g: number
  b: number
}

/**
 * Up to `count` dominant colours of RGBA pixel data, most prominent first, as `rgb()` strings.
 * Each hue bucket is weighted by how vivid its pixels are; near-grey, near-black and
 * near-white pixels are ignored, so a monochrome image yields nothing.
 */
export function pickPalette(pixels: ArrayLike<number>, count = 3): string[] {
  const buckets: Bucket[] = Array.from({ length: HUES }, () => ({
    weight: 0,
    r: 0,
    g: 0,
    b: 0,
  }))
  for (let at = 0; at + 3 < pixels.length; at += 4) {
    const r = pixels[at] ?? 0
    const g = pixels[at + 1] ?? 0
    const b = pixels[at + 2] ?? 0
    const alpha = pixels[at + 3] ?? 0
    if (alpha < 128) continue
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const value = max / 255
    const saturation = max === 0 ? 0 : (max - min) / max
    if (saturation < MIN_SATURATION || value < MIN_VALUE || value > MAX_VALUE)
      continue
    const hue = hueOf(r, g, b, max, min)
    const bucket = buckets[Math.floor((hue / 360) * HUES) % HUES]
    if (!bucket) continue
    const weight = saturation * value
    bucket.weight += weight
    bucket.r += r * weight
    bucket.g += g * weight
    bucket.b += b * weight
  }
  return buckets
    .filter((bucket) => bucket.weight > 0)
    .sort((left, right) => right.weight - left.weight)
    .slice(0, count)
    .map(
      (bucket) =>
        `rgb(${Math.round(bucket.r / bucket.weight)} ${Math.round(bucket.g / bucket.weight)} ${Math.round(bucket.b / bucket.weight)})`,
    )
}

function hueOf(r: number, g: number, b: number, max: number, min: number) {
  const delta = max - min
  if (delta === 0) return 0
  const hue =
    max === r
      ? ((g - b) / delta) % 6
      : max === g
        ? (b - r) / delta + 2
        : (r - g) / delta + 4
  return (hue * 60 + 360) % 360
}
