import { Button, cn } from '@bitrate/ui-react'
import {
  type AnalyticsPeriod,
  type ArtistAnalytics,
  analyticsPeriods,
  useArtistAnalytics,
} from '@entities/analytics'
import {
  type CustomizableLayout,
  CustomizeControls,
  LayoutGrid,
  type TileDefinition,
  useCustomizableLayout,
} from '@features/workspace-layout'
import { useI18n } from '@shared/i18n'
import { formatDateTimeUtc } from '@shared/lib/date'
import { ROUTES } from '@shared/routes/routes'
import { CountUp, PageSkeleton, PanelIcon } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import { BarChart3, Flame, Headphones, Repeat, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { useFormats } from '../lib/useFormats'
import { Change, StatTile } from './AnalyticsParts'
import { DailyTable } from './DailyTable'
import { ExternalSources } from './ExternalSources'
import { PlaysChart } from './PlaysChart'
import { TopTracks } from './TopTracks'

/** Analytics tiles in their default order: the chart and its highlights, then detail. */
const analyticsTiles: readonly TileDefinition[] = [
  { id: 'plays', label: 'analytics.plays', sizes: ['M', 'L'], size: 'M' },
  {
    id: 'highlights',
    label: 'analytics.highlights',
    sizes: ['S', 'M', 'L'],
    size: 'S',
  },
  { id: 'top-tracks', label: 'analytics.top', sizes: ['M', 'L'], size: 'M' },
  {
    id: 'sources',
    label: 'analytics.other',
    sizes: ['S', 'M', 'L'],
    size: 'S',
  },
]

interface AnalyticsViewProps {
  artistId: string
  days: AnalyticsPeriod
}

/** Bitrate-owned listening signals only; external services never show invented zeroes. */
export function AnalyticsView({ artistId, days }: AnalyticsViewProps) {
  const { t, tMessage, tp } = useI18n()
  const analytics = useArtistAnalytics(artistId, days)
  const layout = useCustomizableLayout(artistId, 'analytics', analyticsTiles)
  const ready = analytics.data?.state === 'READY'
  return (
    <section
      aria-busy={analytics.isFetching}
      className="artist-music space-y-6"
    >
      <div className="artist-release-workspace-panel artist-analytics-hero">
        <img
          alt=""
          aria-hidden="true"
          className="artist-dash-art"
          src="/artwork/analytics/analytics-spectrum.webp"
        />
        <div>
          <h1 className="text-[1.625rem] font-normal lg:text-[2rem]">
            {t('shell.nav.analytics')}
          </h1>
          <p className="artist-analytics-hero-subtitle">
            {t('analytics.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {ready && <CustomizeControls layout={layout} />}
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
      </div>
      {analytics.isPending || analytics.isPlaceholderData ? (
        <PageSkeleton label={t('analytics.loading')} />
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
        <AnalyticsBody
          artistId={artistId}
          data={analytics.data}
          layout={layout}
        />
      )}
    </section>
  )
}

function AnalyticsBody({
  artistId,
  data,
  layout,
}: {
  artistId: string
  data: ArtistAnalytics
  layout: CustomizableLayout
}) {
  const { t, tp, locale } = useI18n()
  const format = useFormats()
  if (data.state !== 'READY' || !data.totals || !data.previous)
    return (
      <div className="artist-analytics-grid">
        <div className="artist-release-workspace-panel artist-analytics-empty">
          <img
            alt=""
            aria-hidden="true"
            className="artist-dash-art"
            src="/artwork/analytics/analytics-data-states.webp"
          />
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
  const tiles: Record<string, ReactNode> = {
    plays: (
      <section
        aria-labelledby="analytics-daily-heading"
        className="artist-release-workspace-panel"
      >
        <h2 className="artist-analytics-label" id="analytics-daily-heading">
          <PanelIcon icon={Headphones} />
          {t('analytics.plays')}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="artist-analytics-hero-value">
            <CountUp value={totals.plays} />
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
    ),
    highlights: (
      <div className="artist-analytics-side">
        <StatTile hue="blue" icon={Users} label={t('analytics.listeners')}>
          <p className="artist-analytics-value">
            <CountUp value={totals.listeners} />
          </p>
          <Change current={totals.listeners} previous={previous.listeners} />
        </StatTile>
        <StatTile hue="purple" icon={Repeat} label={t('analytics.perListener')}>
          <p className="artist-analytics-value">
            {totals.listeners === 0
              ? '—'
              : format.ratio(totals.plays / totals.listeners)}
          </p>
          <p className="artist-analytics-hint">
            {t('analytics.perListenerHint')}
          </p>
        </StatTile>
        <StatTile hue="amber" icon={Flame} label={t('analytics.bestDay')}>
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
    ),
    'top-tracks': (
      <TopTracks
        artistId={artistId}
        data={data}
        key={`${artistId}:${data.period.days}`}
      />
    ),
    sources: <ExternalSources data={data} />,
  }
  return (
    <>
      <LayoutGrid
        layout={layout}
        renderTile={(id) => tiles[id] ?? null}
        variant="thirds"
      />
      <p className="text-xs text-text-secondary">
        {t('analytics.source', {
          date: formatDateTimeUtc(data.freshness, locale),
        })}
      </p>
    </>
  )
}
