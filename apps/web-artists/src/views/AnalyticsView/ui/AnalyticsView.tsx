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
import { BarChart3, PlugZap } from 'lucide-react'

/** Numbers and short UTC days in the workspace language. */
function useFormats() {
  const { locale } = useI18n()
  const number = new Intl.NumberFormat(locale)
  const day = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
  return {
    number: (value: number) => number.format(value),
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
        <nav aria-label={t('analytics.period')} className="flex gap-2">
          {analyticsPeriods.map((period) => (
            <Link
              aria-current={period === days ? 'page' : undefined}
              className={cn(
                'rounded-full border border-border px-4 py-2 text-sm',
                period === days
                  ? 'bg-secondary font-medium'
                  : 'text-text-secondary',
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
        <p role="status">{t('analytics.loading')}</p>
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
  const { t, locale } = useI18n()
  if (data.state !== 'READY' || !data.totals || !data.previous)
    return (
      <div className="space-y-4">
        <div className="artist-release-workspace-panel flex items-start gap-3">
          <BarChart3
            aria-hidden="true"
            className="size-5 shrink-0 text-accent"
          />
          <p className="text-sm">
            {data.state === 'NO_TRACKS'
              ? t('analytics.noTracks')
              : t('analytics.noPlays')}
          </p>
        </div>
        <ExternalSources data={data} />
      </div>
    )
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          label={t('analytics.plays')}
          previous={data.previous.plays}
          value={data.totals.plays}
        />
        <StatTile
          label={t('analytics.listeners')}
          previous={data.previous.listeners}
          value={data.totals.listeners}
        />
      </div>
      <DailyPlays data={data} />
      <TopTracks data={data} />
      <ExternalSources data={data} />
      <p className="text-xs text-text-secondary">
        {t('analytics.source', {
          date: formatDateTimeUtc(data.freshness, locale),
        })}
      </p>
    </div>
  )
}

function StatTile({
  label,
  value,
  previous,
}: {
  label: string
  value: number
  previous: number
}) {
  const { t } = useI18n()
  const format = useFormats()
  return (
    <div className="artist-release-workspace-panel">
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="mt-1 text-3xl">{format.number(value)}</p>
      <p className="mt-1 text-xs text-text-secondary">
        {t('analytics.previous', {
          change: changeLabel(value, previous, t),
          value: format.number(previous),
        })}
      </p>
    </div>
  )
}

/** One series of magnitudes: single-hue thin bars on a baseline, hover values, table view. */
function DailyPlays({ data }: { data: ArtistAnalytics }) {
  const { t, tp } = useI18n()
  const format = useFormats()
  const max = Math.max(1, ...data.daily.map((day) => day.plays))
  const peak = data.daily.reduce(
    (best, day) => (day.plays > best.plays ? day : best),
    data.daily[0] ?? { date: '', plays: 0 },
  )
  return (
    <section
      aria-labelledby="analytics-daily-heading"
      className="artist-release-workspace-panel space-y-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="analytics-daily-heading">{t('analytics.daily')}</h2>
        {peak.plays > 0 && (
          <p className="text-xs text-text-secondary">
            {t('analytics.peak', {
              plays: format.number(peak.plays),
              date: format.day(peak.date),
            })}
          </p>
        )}
      </div>
      <div
        aria-hidden="true"
        className="flex h-40 items-end gap-[2px] border-b border-border"
      >
        {data.daily.map((day) => (
          <div
            className="group relative flex h-full min-w-0 flex-1 items-end"
            key={day.date}
            title={tp({
              count: day.plays,
              key: 'analytics.dayPlays',
              values: { date: format.day(day.date) },
            })}
          >
            <div
              className="w-full rounded-t bg-accent opacity-80 group-hover:opacity-100"
              style={{
                height: day.plays === 0 ? '1px' : `${(day.plays / max) * 100}%`,
              }}
            />
          </div>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="flex justify-between text-xs text-text-secondary"
      >
        <span>{format.day(data.daily[0]?.date ?? data.period.from)}</span>
        <span>{format.day(data.daily.at(-1)?.date ?? data.period.to)}</span>
      </div>
      <details>
        <summary className="cursor-pointer text-sm underline">
          {t('analytics.showTable')}
        </summary>
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
    </section>
  )
}

function TopTracks({ data }: { data: ArtistAnalytics }) {
  const { t } = useI18n()
  const format = useFormats()
  return (
    <section
      aria-labelledby="analytics-top-heading"
      className="artist-release-workspace-panel space-y-3"
    >
      <h2 id="analytics-top-heading">{t('analytics.top')}</h2>
      {data.topTracks.length === 0 ? (
        <p className="text-sm text-text-secondary">
          {t('analytics.noPlaysPeriod')}
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-secondary">
              <th className="py-1 font-normal" scope="col">
                {t('music.table.track')}
              </th>
              <th className="py-1 text-right font-normal" scope="col">
                {t('analytics.plays')}
              </th>
              <th className="py-1 text-right font-normal" scope="col">
                {t('analytics.listeners')}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.topTracks.map((track) => (
              <tr className="border-t border-border" key={track.trackId}>
                <td className="max-w-0 truncate py-2 pr-3">{track.title}</td>
                <td className="py-2 text-right tabular-nums">
                  {format.number(track.plays)}
                </td>
                <td className="py-2 text-right tabular-nums">
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
      className="artist-release-workspace-panel space-y-3"
    >
      <h2 id="analytics-external-heading">{t('analytics.other')}</h2>
      <ul className="grid gap-2 sm:grid-cols-3">
        {data.external.map((item) => (
          <li
            className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
            key={item.source}
          >
            <span>{destinationLabels[item.source]}</span>
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <PlugZap aria-hidden="true" className="size-3.5" />
              {t('delivery.availability.notConnected')}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-text-secondary">{t('analytics.noFigures')}</p>
    </section>
  )
}
