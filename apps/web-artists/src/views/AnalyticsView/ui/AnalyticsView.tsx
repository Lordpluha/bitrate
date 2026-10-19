import { Button, cn } from '@bitrate/ui-react'
import {
  type AnalyticsPeriod,
  type ArtistAnalytics,
  analyticsPeriods,
  changeLabel,
  useArtistAnalytics,
} from '@entities/analytics'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { BarChart3, PlugZap } from 'lucide-react'

const numberFormat = new Intl.NumberFormat('en-US')
const dayFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})
const freshnessFormat = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

const sourceLabels: Record<string, string> = {
  SPOTIFY: 'Spotify',
  APPLE_MUSIC: 'Apple Music',
  YOUTUBE_MUSIC: 'YouTube Music',
}

interface AnalyticsViewProps {
  artistId: string
  days: AnalyticsPeriod
}

/** Bitrate-owned listening signals only; external services never show invented zeroes. */
export function AnalyticsView({ artistId, days }: AnalyticsViewProps) {
  const analytics = useArtistAnalytics(artistId, days)
  return (
    <section
      aria-busy={analytics.isFetching}
      className="artist-music space-y-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.625rem] font-normal lg:text-[2rem]">
            Analytics
          </h1>
          <p className="mt-2 text-[0.9375rem] text-text-secondary">
            Plays and listeners on Bitrate, by UTC day.
          </p>
        </div>
        <nav aria-label="Period" className="flex gap-2">
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
              {period} days
            </Link>
          ))}
        </nav>
      </div>
      {analytics.isPending ? (
        <p role="status">Loading analytics…</p>
      ) : analytics.isError ? (
        <div className="space-y-3">
          <p role="alert">{analytics.error.message}</p>
          <Button
            onClick={() => {
              void analytics.refetch()
            }}
            variant="outline"
          >
            Try again
          </Button>
        </div>
      ) : (
        <AnalyticsBody data={analytics.data} />
      )}
    </section>
  )
}

function AnalyticsBody({ data }: { data: ArtistAnalytics }) {
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
              ? 'No data yet. Analytics start once a track of yours is published on Bitrate.'
              : 'No data yet. Nobody has played your published tracks on Bitrate so far.'}
          </p>
        </div>
        <ExternalSources data={data} />
      </div>
    )
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          label="Plays"
          previous={data.previous.plays}
          value={data.totals.plays}
        />
        <StatTile
          label="Listeners"
          previous={data.previous.listeners}
          value={data.totals.listeners}
        />
      </div>
      <DailyPlays data={data} />
      <TopTracks data={data} />
      <ExternalSources data={data} />
      <p className="text-xs text-text-secondary">
        Source: Bitrate playback by signed-in listeners. Read{' '}
        {freshnessFormat.format(new Date(data.freshness))} UTC.
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
  return (
    <div className="artist-release-workspace-panel">
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="mt-1 text-3xl">{numberFormat.format(value)}</p>
      <p className="mt-1 text-xs text-text-secondary">
        {changeLabel(value, previous)} · previous{' '}
        {numberFormat.format(previous)}
      </p>
    </div>
  )
}

/** One series of magnitudes: single-hue thin bars on a baseline, hover values, table view. */
function DailyPlays({ data }: { data: ArtistAnalytics }) {
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
        <h2 id="analytics-daily-heading">Plays per day</h2>
        {peak.plays > 0 && (
          <p className="text-xs text-text-secondary">
            Peak {numberFormat.format(peak.plays)} on{' '}
            {dayFormat.format(new Date(peak.date))}
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
            title={`${dayFormat.format(new Date(day.date))}: ${numberFormat.format(day.plays)} plays`}
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
        <span>
          {dayFormat.format(new Date(data.daily[0]?.date ?? data.period.from))}
        </span>
        <span>
          {dayFormat.format(
            new Date(data.daily.at(-1)?.date ?? data.period.to),
          )}
        </span>
      </div>
      <details>
        <summary className="cursor-pointer text-sm underline">
          Show as table
        </summary>
        <table className="mt-3 w-full text-sm">
          <caption className="sr-only">Plays per UTC day</caption>
          <thead>
            <tr className="text-left text-text-secondary">
              <th className="py-1 font-normal" scope="col">
                Day (UTC)
              </th>
              <th className="py-1 text-right font-normal" scope="col">
                Plays
              </th>
            </tr>
          </thead>
          <tbody>
            {data.daily.map((day) => (
              <tr className="border-t border-border" key={day.date}>
                <td className="py-1">{dayFormat.format(new Date(day.date))}</td>
                <td className="py-1 text-right tabular-nums">
                  {numberFormat.format(day.plays)}
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
  return (
    <section
      aria-labelledby="analytics-top-heading"
      className="artist-release-workspace-panel space-y-3"
    >
      <h2 id="analytics-top-heading">Top tracks</h2>
      {data.topTracks.length === 0 ? (
        <p className="text-sm text-text-secondary">No plays in this period.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-secondary">
              <th className="py-1 font-normal" scope="col">
                Track
              </th>
              <th className="py-1 text-right font-normal" scope="col">
                Plays
              </th>
              <th className="py-1 text-right font-normal" scope="col">
                Listeners
              </th>
            </tr>
          </thead>
          <tbody>
            {data.topTracks.map((track) => (
              <tr className="border-t border-border" key={track.trackId}>
                <td className="max-w-0 truncate py-2 pr-3">{track.title}</td>
                <td className="py-2 text-right tabular-nums">
                  {numberFormat.format(track.plays)}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {numberFormat.format(track.listeners)}
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
  return (
    <section
      aria-labelledby="analytics-external-heading"
      className="artist-release-workspace-panel space-y-3"
    >
      <h2 id="analytics-external-heading">Other services</h2>
      <ul className="grid gap-2 sm:grid-cols-3">
        {data.external.map((item) => (
          <li
            className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
            key={item.source}
          >
            <span>{sourceLabels[item.source] ?? item.source}</span>
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <PlugZap aria-hidden="true" className="size-3.5" />
              Not connected
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-text-secondary">
        No figures are shown for services that are not connected.
      </p>
    </section>
  )
}
