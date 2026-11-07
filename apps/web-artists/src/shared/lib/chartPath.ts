/**
 * A smooth path through the points that never overshoots them (monotone cubic, as d3's
 * curveMonotoneX): peaks stay where the data puts them.
 */
export function monotonePath(points: readonly { x: number; y: number }[]) {
  if (points.length < 2) return points.map((p) => `M${p.x},${p.y}`).join('')
  const tangents = monotoneTangents(points)
  let path = `M${points[0].x},${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i]
    const to = points[i + 1]
    const third = (to.x - from.x) / 3
    path += ` C${from.x + third},${from.y + tangents[i] * third} ${to.x - third},${to.y - tangents[i + 1] * third} ${to.x},${to.y}`
  }
  return path
}

function monotoneTangents(points: readonly { x: number; y: number }[]) {
  const slopes = points
    .slice(1)
    .map((p, i) => (p.y - points[i].y) / (p.x - points[i].x))
  return points.map((_, i) => {
    if (i === 0) return slopes[0]
    if (i === points.length - 1) return slopes[i - 1]
    const before = slopes[i - 1]
    const after = slopes[i]
    if (before * after <= 0) return 0
    // Equal spacing reduces d3's slope3 to this; it bounds the tangent so no segment overshoots.
    return (
      2 *
      Math.sign(before) *
      Math.min(Math.abs(before), Math.abs(after), Math.abs(before + after) / 4)
    )
  })
}

/** Sample the same cubic curve at equal intervals for SVG shape interpolation. */
export function sampleMonotone(values: readonly number[], count: number) {
  if (count <= 0) return []
  if (values.length < 2 || count === 1)
    return Array.from({ length: count }, () => values[0] ?? 0)
  const tangents = monotoneTangents(values.map((y, x) => ({ x, y })))
  return Array.from({ length: count }, (_, index) => {
    const position = (index / (count - 1)) * (values.length - 1)
    const left = Math.min(Math.floor(position), values.length - 2)
    const t = position - left
    return (
      (2 * t ** 3 - 3 * t ** 2 + 1) * values[left] +
      (t ** 3 - 2 * t ** 2 + t) * tangents[left] +
      (-2 * t ** 3 + 3 * t ** 2) * values[left + 1] +
      (t ** 3 - t ** 2) * tangents[left + 1]
    )
  })
}
