import { useI18n } from '@shared/i18n'
import { monotonePath } from '@shared/lib/chartPath'
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
  const lineGradientId = useId()
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
  const peakIndex = daily.reduce(
    (best, day, index) => (day.plays > daily[best].plays ? index : best),
    0,
  )
  const peak = daily[peakIndex]

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
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.38" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
            {/* In plot units: a flat line has no height for a bounding-box gradient to span. */}
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id={lineGradientId}
              x1="0"
              x2={WIDTH}
              y1="0"
              y2="0"
            >
              <stop offset="0%" style={{ stopColor: 'var(--color-chart-1)' }} />
              <stop
                offset="100%"
                style={{ stopColor: 'var(--color-chart-2)' }}
              />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradientId})`} />
          <path
            className="artist-analytics-line"
            d={line}
            fill="none"
            stroke={`url(#${lineGradientId})`}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {active === null && peak && peak.plays > 0 && (
          <div
            aria-hidden="true"
            className="artist-analytics-peak"
            style={{
              left: `${(peakIndex / last) * 100}%`,
              top: `${(1 - peak.plays / top) * 100}%`,
            }}
          >
            <b>{formatNumber(peak.plays)}</b>
          </div>
        )}
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
