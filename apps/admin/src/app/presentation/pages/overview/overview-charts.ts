import type { ModerationEntityType } from '@domain/moderation'
import type { OverviewReportsByType, OverviewSeries } from '@domain/overview'
import type { ChartSeriesValues } from '@presentation/components'

/** Words for the charts, from the page's dictionary — so a language switch redraws them. */
export type Translate = (key: string, params?: Record<string, string | number>) => string

/**
 * One design token per entity type. The chart palette only defines five categorical roles, so
 * `episode` and `user` fall back to neutral theme tokens; each series is also named in the
 * legend, tooltip and accessible table, so colour never carries the meaning alone.
 */
export const ENTITY_TYPE_COLOR: Record<ModerationEntityType, string> = {
  track: '--color-chart-1',
  album: '--color-chart-2',
  playlist: '--color-chart-3',
  artist: '--color-chart-4',
  podcast: '--color-chart-5',
  episode: '--color-muted-foreground',
  user: '--color-foreground',
}

/** Short day labels for the charts' axes and sr-only tables, e.g. "18 Sep" / "18 вер.". */
export function dayLabels(dates: Date[], locale: string): string[] {
  return dates.map((date) =>
    date.toLocaleDateString(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' }),
  )
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

export function listensSeries(series: OverviewSeries, t: Translate): ChartSeriesValues[] {
  return [
    {
      id: 'listens',
      label: t('overview.series.listens'),
      colorVar: '--color-chart-1',
      values: series.listens.map((point) => point.count),
    },
  ]
}

/** New accounts per day; `only` narrows it to one audience for the Listeners/Artists panels. */
export function signupsSeries(
  series: OverviewSeries,
  t: Translate,
  only?: 'listeners' | 'artists',
): ChartSeriesValues[] {
  const all: ChartSeriesValues[] = [
    {
      id: 'listeners',
      label: t('overview.series.listeners'),
      colorVar: '--color-chart-1',
      values: series.signups.map((point) => point.listeners),
    },
    {
      id: 'artists',
      label: t('overview.series.artists'),
      colorVar: '--color-chart-2',
      values: series.signups.map((point) => point.artists),
    },
  ]
  return only ? all.filter((entry) => entry.id === only) : all
}

export function uploadsSeries(series: OverviewSeries, t: Translate): ChartSeriesValues[] {
  return [
    {
      id: 'ready',
      label: t('overview.series.ready'),
      colorVar: '--color-chart-3',
      values: series.uploads.map((point) => point.ready),
    },
    {
      id: 'failed',
      label: t('overview.series.failed'),
      colorVar: '--color-chart-5',
      values: series.uploads.map((point) => point.failed),
    },
    {
      id: 'stuck',
      label: t('overview.series.stuck'),
      colorVar: '--color-chart-4',
      values: series.uploads.map((point) => point.stuck),
    },
  ]
}

export function reportsFiledSeries(series: OverviewSeries, t: Translate): ChartSeriesValues[] {
  return [
    {
      id: 'reports',
      label: t('overview.series.filed'),
      colorVar: '--color-chart-5',
      values: series.reports.map((point) => point.count),
    },
  ]
}

/** One series per reported entity type, in the order the API returned them. */
export function reportsByTypeSeries(
  data: OverviewReportsByType,
  t: Translate,
): ChartSeriesValues[] {
  return data.series.map((entry) => ({
    id: entry.entityType,
    label: t(`overview.entity.${entry.entityType}`),
    colorVar: ENTITY_TYPE_COLOR[entry.entityType],
    values: entry.counts,
  }))
}

/** The day with the most listens, or `null` when nothing was played in the range. */
export function peakDay(series: OverviewSeries): { date: Date; count: number } | null {
  let peak: { date: Date; count: number } | null = null
  for (const point of series.listens) {
    if (point.count > 0 && (peak === null || point.count > peak.count)) peak = point
  }
  return peak
}
