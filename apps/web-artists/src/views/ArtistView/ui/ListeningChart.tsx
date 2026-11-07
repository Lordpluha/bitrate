import { useI18n } from '@shared/i18n'
import {
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  useId,
  useState,
} from 'react'
import {
  type ListeningPreview,
  listeningPath,
  SOUND_CURVE,
} from '../lib/listeningPreview'
import { useListeningCurve } from '../model/useListeningCurve'

const INITIAL_PATH = listeningPath(SOUND_CURVE)

export function ListeningChart({
  preview,
  entered,
  triggerRef,
}: {
  preview: ListeningPreview
  entered: boolean
  triggerRef: RefObject<HTMLDivElement | null>
}) {
  const { t, locale } = useI18n()
  const [selection, setSelection] = useState<{
    period: number
    index: number
  } | null>(null)
  const active = selection?.period === preview.period ? selection.index : null
  const index = active ?? preview.daily.length - 1
  const day = preview.daily[index]
  const x = (index / (preview.daily.length - 1)) * 100
  const y = (1 - day.plays / preview.ceiling) * 100
  const { lineRef, areaRef } = useListeningCurve(preview.curve, entered)
  const gradient = useId()
  const number = new Intl.NumberFormat(locale)
  const date = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(value))
  const pick = (event: PointerEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const progress = Math.min(
      1,
      Math.max(0, (event.clientX - box.left) / box.width),
    )
    setSelection({
      period: preview.period,
      index: Math.round(progress * (preview.daily.length - 1)),
    })
  }
  const step = (event: KeyboardEvent<HTMLButtonElement>) => {
    let next: number
    if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = preview.daily.length - 1
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp')
      next = Math.min(index + 1, preview.daily.length - 1)
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown')
      next = Math.max(index - 1, 0)
    else return
    event.preventDefault()
    setSelection({ period: preview.period, index: next })
  }
  return (
    <div className="artist-response-chart">
      <div className="artist-response-chart-readout">
        <span>{t('analytics.daily')}</span>
        <span>
          {active === null
            ? t('landing.response.explore')
            : `${date(day.date)} · ${number.format(day.plays)}`}
        </span>
      </div>
      <div className="artist-response-plot" ref={triggerRef}>
        {[0, 0.5, 1].map((fraction) => (
          <div
            aria-hidden="true"
            className="artist-response-gridline"
            key={fraction}
            style={{ top: `${fraction * 100}%` }}
          >
            <span>{number.format(preview.ceiling * (1 - fraction))}</span>
          </div>
        ))}
        <svg
          aria-hidden="true"
          className="artist-response-chart-svg"
          preserveAspectRatio="none"
          viewBox="0 0 600 220"
        >
          <defs>
            <linearGradient id={`${gradient}-line`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="var(--color-purple-500)" />
              <stop offset="60%" stopColor="var(--color-blue-400)" />
              <stop offset="100%" stopColor="var(--color-emerald-300)" />
            </linearGradient>
            <linearGradient id={`${gradient}-fill`} x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-purple-500)"
                stopOpacity="0.24"
              />
              <stop
                offset="100%"
                stopColor="var(--color-purple-500)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          <path
            className="artist-response-chart-area"
            d={`${INITIAL_PATH} L600,220 L0,220 Z`}
            fill={`url(#${gradient}-fill)`}
            ref={areaRef}
          />
          <path
            d={INITIAL_PATH}
            fill="none"
            id={`${gradient}-curve`}
            pathLength={1000}
            ref={lineRef}
            stroke={`url(#${gradient}-line)`}
            strokeLinecap="round"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
          <use
            className="artist-response-curve-light"
            fill="none"
            href={`#${gradient}-curve`}
            stroke="var(--color-emerald-200)"
            strokeLinecap="round"
            strokeWidth={3}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div
          aria-hidden="true"
          className="artist-response-cursor"
          data-active={entered && active !== null}
          data-edge={x < 10 ? 'start' : x > 90 ? 'end' : undefined}
          style={{ left: `${x}%`, top: `${y}%` }}
        >
          <span />
          <b>{number.format(day.plays)}</b>
        </div>
        <button
          aria-label={t('analytics.chartLabel')}
          aria-valuemax={preview.daily.length - 1}
          aria-valuemin={0}
          aria-valuenow={index}
          aria-valuetext={`${date(day.date)}: ${number.format(day.plays)} ${t('analytics.plays')}`}
          className="artist-response-chart-hit"
          onBlur={() => setSelection(null)}
          onKeyDown={step}
          onPointerDown={pick}
          onPointerLeave={(event) => {
            if (document.activeElement !== event.currentTarget)
              setSelection(null)
          }}
          onPointerMove={pick}
          role="slider"
          type="button"
        />
      </div>
      <div aria-hidden="true" className="artist-response-axis">
        <span>{date(preview.daily[0].date)}</span>
        <span>
          {date(preview.daily[Math.floor(preview.daily.length / 2)].date)}
        </span>
        <span>{date(preview.daily.at(-1)?.date ?? '')}</span>
      </div>
    </div>
  )
}
