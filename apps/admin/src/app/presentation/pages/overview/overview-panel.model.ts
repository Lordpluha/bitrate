import type { ArtistStats } from '@application/artists'
import type { ReleaseQueueStats } from '@application/release-review'
import type { ResourceCounts } from '@application/shared'
import type { AuditEntry } from '@domain/audit'
import type { Overview, OverviewReportsByType, OverviewSeries } from '@domain/overview'
import { type ChartSeriesValues, formatChartValue } from '@presentation/components'
import {
  dayLabels,
  ENTITY_TYPE_COLOR,
  listensSeries,
  peakDay,
  reportsByTypeSeries,
  reportsFiledSeries,
  signupsSeries,
  sum,
  type Translate,
  uploadsSeries,
} from './overview-charts'
import type { OverviewPanel } from './overview.query'

type PanelStat = { label: string; value: string }

type PanelChart = {
  kind: 'line' | 'bar'
  title: string
  description: string
  categories: string[]
  series: ChartSeriesValues[]
  stacked?: boolean
}

type PanelMeter = { label: string; value: string; width: number; color: string }

/** Everything one analysis panel shows; the view only lays it out. */
export type PanelModel = {
  key: OverviewPanel
  icon: string
  title: string
  subtitle: string
  stats: PanelStat[]
  charts: PanelChart[]
  meters: { title: string; rows: PanelMeter[] } | null
  activity: AuditEntry[] | null
  link: { path: string; queryParams?: Record<string, string>; label: string } | null
}

export type PanelContext = {
  t: Translate
  locale: string
  overview: Overview | null
  series: OverviewSeries | null
  reportsByType: OverviewReportsByType | null
  users: ResourceCounts | null
  artists: ArtistStats | null
  releases: ReleaseQueueStats | null
  can: Record<'reports' | 'releases' | 'tracks' | 'users' | 'artists' | 'audit', boolean>
}

const ICON: Record<OverviewPanel, string> = {
  action: 'lucideInbox',
  listeners: 'lucideUsers',
  artists: 'lucideMic',
  listens: 'lucideAudioLines',
  pipeline: 'lucideDisc3',
  reports: 'lucideFlag',
  accounts: 'lucideUserPlus',
  audit: 'lucideScrollText',
}

const n = formatChartValue

/** Builds one panel from whatever has loaded; a figure whose source is missing is left out. */
export function buildPanel(key: OverviewPanel, ctx: PanelContext): PanelModel {
  const { t, series } = ctx
  const days = series?.days ?? 0
  const categories = series
    ? dayLabels(
        series.listens.map((point) => point.date),
        ctx.locale,
      )
    : []
  const base: PanelModel = {
    key,
    icon: ICON[key],
    title: t(`overview.tile.${key}`),
    subtitle: days > 0 ? t('overview.panel.range', { days }) : '',
    stats: [],
    charts: [],
    meters: null,
    activity: null,
    link: null,
  }
  const stat = (labelKey: string, value: number | string | null | undefined): PanelStat[] =>
    value === null || value === undefined
      ? []
      : [{ label: t(labelKey), value: typeof value === 'number' ? n(value) : value }]
  const describe = (descKey: string): string => t(descKey, { days })

  switch (key) {
    case 'action': {
      const o = ctx.overview
      base.stats = [
        ...stat('overview.stat.openReports', ctx.can.reports ? o?.reports.open : null),
        ...stat('overview.stat.inReview', ctx.can.reports ? o?.reports.reviewing : null),
        ...stat('overview.stat.releasesAwaiting', ctx.releases?.awaiting),
        ...stat('overview.stat.failedTracks', ctx.can.tracks ? o?.tracks.failed : null),
        ...stat('overview.stat.stuckTracks', ctx.can.tracks ? o?.tracks.stuck : null),
      ]
      if (series && ctx.can.reports) {
        base.charts = [
          {
            kind: 'bar',
            title: t('overview.chart.reportsFiled'),
            description: describe('overview.chart.reportsFiledDesc'),
            categories,
            series: reportsFiledSeries(series, t),
          },
        ]
        const { open, reviewing, resolved, rejected } = series.reportsByStatus
        base.meters = meters(t('overview.chart.reportsByStatus'), [
          [t('overview.status.open'), open, 'var(--color-warning)'],
          [t('overview.status.reviewing'), reviewing, 'var(--color-info)'],
          [t('overview.status.resolved'), resolved, 'var(--color-success)'],
          [t('overview.status.rejected'), rejected, 'var(--color-muted-foreground)'],
        ])
      }
      if (ctx.can.reports) base.link = { path: '/moderation', label: t('overview.link.moderation') }
      return base
    }
    case 'listeners': {
      const fresh = series ? sum(series.signups.map((point) => point.listeners)) : null
      base.stats = [
        ...stat('overview.stat.listeners', ctx.users?.live),
        ...stat('overview.stat.newInRange', fresh),
        ...stat('overview.stat.deactivated', ctx.users?.takenDown),
      ]
      if (series) {
        base.charts = [
          {
            kind: 'line',
            title: t('overview.chart.newListeners'),
            description: describe('overview.chart.newAccountsDesc'),
            categories,
            series: signupsSeries(series, t, 'listeners'),
          },
        ]
      }
      if (ctx.can.users) base.link = { path: '/users', label: t('overview.link.listeners') }
      return base
    }
    case 'artists': {
      const fresh = series ? sum(series.signups.map((point) => point.artists)) : null
      const a = ctx.artists
      base.stats = [
        ...stat('overview.stat.artists', a?.live),
        ...stat('overview.stat.verified', a?.verified),
        ...stat('overview.stat.waiting', a?.unverified),
        ...stat('overview.stat.newInRange', fresh),
      ]
      if (series) {
        base.charts = [
          {
            kind: 'line',
            title: t('overview.chart.newArtists'),
            description: describe('overview.chart.newAccountsDesc'),
            categories,
            series: signupsSeries(series, t, 'artists'),
          },
        ]
      }
      if (a) {
        base.meters = meters(t('overview.chart.verification'), [
          [t('overview.stat.verified'), a.verified, 'var(--color-success)'],
          [t('overview.stat.waiting'), a.unverified, 'var(--color-warning)'],
        ])
      }
      if (ctx.can.artists) base.link = { path: '/artists', label: t('overview.link.artists') }
      return base
    }
    case 'listens': {
      if (series) {
        const total = sum(series.listens.map((point) => point.count))
        const peak = peakDay(series)
        base.stats = [
          ...stat('overview.stat.totalListens', total),
          ...stat('overview.stat.dailyAverage', series.days > 0 ? total / series.days : null),
          ...stat(
            'overview.stat.peakDay',
            peak ? `${n(peak.count)} · ${dayLabels([peak.date], ctx.locale)[0]}` : null,
          ),
        ]
        base.charts = [
          {
            kind: 'line',
            title: t('overview.tile.listens'),
            description: describe('overview.chart.listensDesc'),
            categories,
            series: listensSeries(series, t),
          },
        ]
      }
      return base
    }
    case 'pipeline': {
      const o = ctx.overview
      if (series) {
        const uploads = series.uploads
        base.stats = [
          ...stat('overview.stat.uploaded', sum(uploads.map((point) => point.uploaded))),
          ...stat('overview.stat.ready', sum(uploads.map((point) => point.ready))),
          ...stat('overview.stat.failed', sum(uploads.map((point) => point.failed))),
          ...stat('overview.stat.processingNow', o?.tracks.processing),
        ]
        base.charts = [
          {
            kind: 'bar',
            title: t('overview.chart.outcomes'),
            description: describe('overview.chart.outcomesDesc'),
            categories,
            series: uploadsSeries(series, t),
            stacked: true,
          },
        ]
      }
      if (ctx.can.tracks) base.link = { path: '/catalog', label: t('overview.link.catalog') }
      return base
    }
    case 'reports': {
      const data = ctx.reportsByType
      if (data) {
        const ranked = [...data.series].sort((a, b) => b.total - a.total)
        base.stats = [
          ...stat('overview.stat.filed', data.total),
          ...stat(
            'overview.stat.topType',
            ranked[0] && ranked[0].total > 0 ? t(`overview.entity.${ranked[0].entityType}`) : null,
          ),
        ]
        base.charts = [
          {
            kind: 'bar',
            title: t('overview.tile.reports'),
            description: describe('overview.chart.reportsByTypeDesc'),
            categories: dayLabels(data.dates, ctx.locale),
            series: reportsByTypeSeries(data, t),
            stacked: true,
          },
        ]
        base.meters = meters(
          t('overview.chart.share'),
          ranked
            .filter((entry) => entry.total > 0)
            .map((entry) => [
              t(`overview.entity.${entry.entityType}`),
              entry.total,
              `var(${ENTITY_TYPE_COLOR[entry.entityType]})`,
            ]),
        )
      }
      if (ctx.can.reports) base.link = { path: '/moderation', label: t('overview.link.moderation') }
      return base
    }
    case 'accounts': {
      const o = ctx.overview
      if (series) {
        base.stats = [
          ...stat('overview.stat.newListeners', sum(series.signups.map((p) => p.listeners))),
          ...stat('overview.stat.newArtists', sum(series.signups.map((p) => p.artists))),
          ...stat('overview.stat.uploaded', sum(series.uploads.map((p) => p.uploaded))),
        ]
        base.charts = [
          {
            kind: 'line',
            title: t('overview.chart.newAccounts'),
            description: describe('overview.chart.newAccountsDesc'),
            categories,
            series: signupsSeries(series, t),
          },
        ]
      }
      if (o) {
        base.stats = [
          ...base.stats,
          ...stat('overview.stat.deactivatedAccounts', o.deactivated.users + o.deactivated.artists),
        ]
      }
      return base
    }
    case 'audit': {
      base.subtitle = t('overview.audit.meta')
      base.activity = ctx.overview?.recentActivity ?? []
      if (ctx.can.audit) base.link = { path: '/audit', label: t('overview.link.audit') }
      return base
    }
  }
}

function meters(title: string, rows: [string, number, string][]): PanelModel['meters'] {
  const max = Math.max(0, ...rows.map(([, value]) => value))
  return {
    title,
    rows: rows.map(([label, value, color]) => ({
      label,
      value: n(value),
      width: max === 0 ? 0 : (value / max) * 100,
      color,
    })),
  }
}
