import { useI18n } from '@shared/i18n'
import { type KeyboardEvent, type PointerEvent, useId, useState } from 'react'

interface DailyPlays {
  date: string
  plays: number
}

interface PlaysChartProps {
  daily: readonly DailyPlays[]
  formatDay: (date: string) => string
  formatNumber: (value: number) => string
}

/** Plot units: the SVG stretches to its box, so these only set proportions. */
const WIDTH = 100
const HEIGHT = 40

/** Roughly how many gridline intervals the plot shows. */
const TICKS = 3

/**
 * A round gridline step (1, 2, 2.5 or 5 × 10ⁿ) giving about {@link TICKS} intervals, and the top
 * of the scale it reaches, so the line fills the plot instead of half of it.
 */
function niceScale(max: number) {
  const rough = Math.max(max, 1) / TICKS
  const power = 10 ** Math.floor(Math.log10(rough))
  const factor = [1, 2, 2.5, 5, 10].find((item) => item * power >= rough) ?? 10
  const step = Math.max(factor * power, 1)
  return { step, top: Math.ceil(Math.max(max, 1) / step) * step }
}

/**
 * A smooth path through the points that never overshoots them (monotone cubic, as d3's
 * curveMonotoneX): peaks stay where the data puts them.
 */
function monotonePath(points: readonly { x: number; y: number }[]) {
  if (points.length < 2) return points.map((p) => `M${p.x},${p.y}`).join('')
  const slopes = points
    .slice(1)
    .map((p, i) => (p.y - points[i].y) / (p.x - points[i].x))
  const tangents = points.map((_, i) => {
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
  let path = `M${points[0].x},${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i]
    const to = points[i + 1]
    const third = (to.x - from.x) / 3
    path += ` C${from.x + third},${from.y + tangents[i] * third} ${to.x - third},${to.y - tangents[i + 1] * third} ${to.x},${to.y}`
  }
  return path
}

/**
 * Plays per UTC day as one line over a light wash. A crosshair snaps to the nearest day on
 * hover or with the arrow keys; the same values are in the table below the chart.
 */
export function PlaysChart({
  daily,
  formatDay,
  formatNumber,
}: PlaysChartProps) {
  const { t, tp } = useI18n()
  const gradientId = useId()
  const [active, setActive] = useState<number | null>(null)
  const { step: gridStep, top } = niceScale(
    Math.max(...daily.map((day) => day.plays), 0),
  )
  const last = Math.max(daily.length - 1, 1)
  const points = daily.map((day, index) => ({
    x: (index / last) * WIDTH,
    y: HEIGHT - (day.plays / top) * HEIGHT,
  }))
  const line = monotonePath(points)
  const area = `${line} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`
  const gridlines = Array.from(
    { length: Math.round(top / gridStep) + 1 },
    (_, index) => index * gridStep,
  )
  const current = active === null ? null : daily[active]
  const left = active === null ? 0 : (active / last) * 100

  const pick = (event: PointerEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const fraction = Math.min(
      Math.max((event.clientX - box.left) / box.width, 0),
      1,
    )
    setActive(Math.round(fraction * last))
  }

  const step = (event: KeyboardEvent<HTMLButtonElement>) => {
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      Home: -daily.length,
      End: daily.length,
    }
    const move = moves[event.key]
    if (move === undefined) return
    event.preventDefault()
    setActive((index) =>
      Math.min(
        Math.max((index ?? (move > 0 ? -1 : daily.length)) + move, 0),
        daily.length - 1,
      ),
    )
  }

  return (
    <div className="artist-analytics-chart">
      <div className="artist-analytics-plot">
        {gridlines.map((value) => (
          <div
            aria-hidden="true"
            className="artist-analytics-gridline"
            key={value}
            style={{ top: `${(1 - value / top) * 100}%` }}
          >
            <span>{formatNumber(value)}</span>
          </div>
        ))}
        <svg
          aria-hidden="true"
          className="artist-analytics-svg"
          preserveAspectRatio="none"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradientId})`} />
          <path
            className="artist-analytics-line"
            d={line}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {current && active !== null && (
          <>
            <div
              aria-hidden="true"
              className="artist-analytics-crosshair"
              style={{ left: `${left}%` }}
            />
            <div
              aria-hidden="true"
              className="artist-analytics-dot"
              style={{
                left: `${left}%`,
                top: `${(1 - current.plays / top) * 100}%`,
              }}
            />
            <div
              className="artist-analytics-tooltip"
              data-below={current.plays / top > 0.75 || undefined}
              data-edge={left < 15 ? 'start' : left > 85 ? 'end' : undefined}
              style={{
                left: `${left}%`,
                top: `${(1 - current.plays / top) * 100}%`,
              }}
            >
              <strong>{formatNumber(current.plays)}</strong>
              <span>{formatDay(current.date)}</span>
            </div>
          </>
        )}
        <button
          aria-label={t('analytics.chartLabel')}
          className="artist-analytics-hit"
          onBlur={() => setActive(null)}
          onKeyDown={step}
          onPointerLeave={() => setActive(null)}
          onPointerMove={pick}
          type="button"
        />
      </div>
      <div aria-hidden="true" className="artist-analytics-axis">
        <span>{formatDay(daily[0]?.date ?? '')}</span>
        {daily.length > 2 && (
          <span>{formatDay(daily[Math.floor(last / 2)].date)}</span>
        )}
        <span>{formatDay(daily.at(-1)?.date ?? '')}</span>
      </div>
      <p aria-live="polite" className="sr-only">
        {current
          ? tp({
              count: current.plays,
              key: 'analytics.dayPlays',
              values: { date: formatDay(current.date) },
            })
          : ''}
      </p>
    </div>
  )
}
