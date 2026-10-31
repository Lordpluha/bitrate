import { Button, cn } from '@bitrate/ui-react'
import {
  type AnalyticsPeriod,
  type ArtistAnalytics,
  analyticsPeriods,
  changeLabel,
  useArtistAnalytics,
} from '@entities/analytics'
import { destinationLabels } from '@shared/constants/destinations'
import { useI18n } from '@shared/i18n'
import { formatDateTimeUtc } from '@shared/lib/date'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Minus,
  PlugZap,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { PlaysChart } from './PlaysChart'

/** Numbers and short UTC days in the workspace language. */
function useFormats() {
  const { locale } = useI18n()
  const number = new Intl.NumberFormat(locale)
  const ratio = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })
  const day = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  return {
    number: (value: number) => number.format(value),
    ratio: (value: number) => ratio.format(value),
    day: (date: string) => day.format(new Date(date)),
  }
}

interface AnalyticsViewProps {
  artistId: string
  days: AnalyticsPeriod
}

/** Bitrate-owned listening signals only; external services never show invented zeroes. */
export function AnalyticsView({ artistId, days }: AnalyticsViewProps) {
  const { t, tMessage, tp } = useI18n()
  const analytics = useArtistAnalytics(artistId, days)
  return (
    <section
      aria-busy={analytics.isFetching}
      className="artist-music space-y-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.625rem] font-normal lg:text-[2rem]">
            {t('shell.nav.analytics')}
          </h1>
          <p className="mt-2 text-[0.9375rem] text-text-secondary">
            {t('analytics.subtitle')}
          </p>
        </div>
        <nav
          aria-label={t('analytics.period')}
          className="flex gap-0.5 rounded-lg border border-border bg-secondary p-0.5"
        >
          {analyticsPeriods.map((period) => (
            <Link
              aria-current={period === days ? 'page' : undefined}
              className={cn(
                'flex min-h-9 items-center rounded-md border border-transparent px-3.5 text-xs transition-colors',
                period === days
                  ? 'border-primary bg-card text-foreground'
                  : 'text-text-secondary hover:text-foreground',
              )}
              key={period}
              search={{ days: period }}
              to={ROUTES.dashboard.analytics}
            >
              {tp({ count: period, key: 'analytics.days' })}
            </Link>
          ))}
        </nav>
      </div>
      {analytics.isPending ? (
        <div className="artist-analytics-grid" role="status">
          <span className="sr-only">{t('analytics.loading')}</span>
          <div className="artist-release-workspace-panel h-80 animate-pulse" />
          <div className="artist-release-workspace-panel h-80 animate-pulse" />
        </div>
      ) : analytics.isError ? (
        <div className="space-y-3">
          <p role="alert">{tMessage(analytics.error.message)}</p>
          <Button
            onClick={() => {
              void analytics.refetch()
            }}
            variant="outline"
          >
            {t('common.tryAgain')}
          </Button>
        </div>
      ) : (
        <AnalyticsBody data={analytics.data} />
      )}
    </section>
  )
}

function AnalyticsBody({ data }: { data: ArtistAnalytics }) {
  const { t, tp, locale } = useI18n()
  const format = useFormats()
  if (data.state !== 'READY' || !data.totals || !data.previous)
    return (
      <div className="artist-analytics-grid">
        <div className="artist-release-workspace-panel artist-analytics-empty">
          <span className="artist-analytics-empty-icon">
            <BarChart3 aria-hidden="true" />
          </span>
          <p>
            {data.state === 'NO_TRACKS'
              ? t('analytics.noTracks')
              : t('analytics.noPlays')}
          </p>
        </div>
        <ExternalSources data={data} />
      </div>
    )
  const { totals, previous } = data
  const peak = data.daily.reduce(
    (best, day) => (day.plays > best.plays ? day : best),
    data.daily[0] ?? { date: data.period.to, plays: 0 },
  )
  return (
    <>
      <div className="artist-analytics-grid">
        <section
          aria-labelledby="analytics-daily-heading"
          className="artist-release-workspace-panel"
        >
          <h2 className="artist-analytics-label" id="analytics-daily-heading">
            {t('analytics.plays')}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="artist-analytics-hero-value">
              {format.number(totals.plays)}
            </p>
            <Change current={totals.plays} previous={previous.plays} />
          </div>
          <PlaysChart
            daily={data.daily}
            formatDay={format.day}
            formatNumber={format.number}
          />
          <DailyTable data={data} />
        </section>
        <div className="artist-analytics-side">
          <StatTile label={t('analytics.listeners')}>
            <p className="artist-analytics-value">
              {format.number(totals.listeners)}
            </p>
            <Change current={totals.listeners} previous={previous.listeners} />
          </StatTile>
          <StatTile label={t('analytics.perListener')}>
            <p className="artist-analytics-value">
              {totals.listeners === 0
                ? '—'
                : format.ratio(totals.plays / totals.listeners)}
            </p>
            <p className="artist-analytics-hint">
              {t('analytics.perListenerHint')}
            </p>
          </StatTile>
          <StatTile label={t('analytics.bestDay')}>
            <p className="artist-analytics-value">
              {peak.plays > 0 ? format.day(peak.date) : '—'}
            </p>
            {peak.plays > 0 && (
              <p className="artist-analytics-hint">
                {tp({
                  count: peak.plays,
                  key: 'analytics.bestDayPlays',
                  values: { plays: format.number(peak.plays) },
                })}
              </p>
            )}
          </StatTile>
        </div>
        <TopTracks data={data} />
        <ExternalSources data={data} />
      </div>
      <p className="text-xs text-text-secondary">
        {t('analytics.source', {
          date: formatDateTimeUtc(data.freshness, locale),
        })}
      </p>
    </>
  )
}

/** The change against the previous period: arrow and words, never colour alone. */
function Change({ current, previous }: { current: number; previous: number }) {
  const { t } = useI18n()
  const trend = current > previous ? 'up' : current < previous ? 'down' : 'flat'
  const Icon =
    trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus
  return (
    <span className="artist-analytics-change" data-trend={trend}>
      <Icon aria-hidden="true" />
      {changeLabel(current, previous, t)}
    </span>
  )
}

function StatTile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="artist-release-workspace-panel artist-analytics-stat">
      <p className="artist-analytics-label">{label}</p>
      {children}
    </div>
  )
}

function DailyTable({ data }: { data: ArtistAnalytics }) {
  const { t } = useI18n()
  const format = useFormats()
  return (
    <details className="artist-analytics-table">
      <summary>{t('analytics.showTable')}</summary>
      <table className="mt-3 w-full text-sm">
        <caption className="sr-only">{t('analytics.tableCaption')}</caption>
        <thead>
          <tr className="text-left text-text-secondary">
            <th className="py-1 font-normal" scope="col">
              {t('analytics.dayUtc')}
            </th>
            <th className="py-1 text-right font-normal" scope="col">
              {t('analytics.plays')}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.daily.map((day) => (
            <tr className="border-t border-border" key={day.date}>
              <td className="py-1">{format.day(day.date)}</td>
              <td className="py-1 text-right tabular-nums">
                {format.number(day.plays)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}

/** Ranked tracks, each with a bar for its plays relative to the top one. */
function TopTracks({ data }: { data: ArtistAnalytics }) {
  const { t } = useI18n()
  const format = useFormats()
  const most = Math.max(1, ...data.topTracks.map((track) => track.plays))
  return (
    <section
      aria-labelledby="analytics-top-heading"
      className="artist-release-workspace-panel"
    >
      <h2 id="analytics-top-heading">{t('analytics.top')}</h2>
      {data.topTracks.length === 0 ? (
        <p className="mt-3 text-sm text-text-secondary">
          {t('analytics.noPlaysPeriod')}
        </p>
      ) : (
        <table className="artist-analytics-top">
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">#</span>
              </th>
              <th scope="col">{t('music.table.track')}</th>
              <th scope="col">{t('analytics.plays')}</th>
              <th scope="col">{t('analytics.listeners')}</th>
            </tr>
          </thead>
          <tbody>
            {data.topTracks.map((track, index) => (
              <tr key={track.trackId}>
                <td className="artist-analytics-rank">{index + 1}</td>
                <td className="min-w-0">
                  <span className="block truncate">{track.title}</span>
                  <span aria-hidden="true" className="artist-analytics-bar">
                    <span style={{ width: `${(track.plays / most) * 100}%` }} />
                  </span>
                </td>
                <td className="tabular-nums">{format.number(track.plays)}</td>
                <td className="tabular-nums text-text-secondary">
                  {format.number(track.listeners)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

function ExternalSources({ data }: { data: ArtistAnalytics }) {
  const { t } = useI18n()
  return (
    <section
      aria-labelledby="analytics-external-heading"
      className="artist-release-workspace-panel"
    >
      <h2 id="analytics-external-heading">{t('analytics.other')}</h2>
      <ul className="mt-3 divide-y divide-border">
        {data.external.map((item) => (
          <li
            className="flex items-center justify-between gap-3 py-2.5 text-sm"
            key={item.source}
          >
            <span>{destinationLabels[item.source]}</span>
            <span className="artist-release-chip">
              <PlugZap aria-hidden="true" />
              {t('delivery.availability.notConnected')}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3">{t('analytics.noFigures')}</p>
    </section>
  )
}
