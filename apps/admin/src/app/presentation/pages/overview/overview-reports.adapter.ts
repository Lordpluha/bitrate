import type { ModerationEntityType } from '@domain/moderation'
import type { OverviewReportsByType } from '@domain/overview'
import {
  type ChartHeadline,
  type ChartSeriesValues,
  formatChartValue,
} from '@presentation/components'

/**
 * One design token per entity type. The chart palette only defines five categorical roles, so
 * `episode` and `user` fall back to neutral theme tokens; each series is also named in the
 * legend, tooltip and accessible table, so colour never carries the meaning alone.
 */
const ENTITY_TYPE_COLOR: Record<ModerationEntityType, string> = {
  track: '--color-chart-1',
  album: '--color-chart-2',
  playlist: '--color-chart-3',
  artist: '--color-chart-4',
  podcast: '--color-chart-5',
  episode: '--color-muted-foreground',
  user: '--color-foreground',
}

/** `track` -> `Track`. */
export function entityTypeLabel(entityType: string): string {
  return entityType.charAt(0).toUpperCase() + entityType.slice(1)
}

/** Short day-of-month labels for the chart's sr-only table, e.g. "18 Sep". */
export function reportsByTypeCategories(data: OverviewReportsByType): string[] {
  return data.dates.map((date) =>
    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  )
}

/** The stacked bar chart's series: one per entity type, in the order the API returned them. */
export function reportsByTypeChartSeries(data: OverviewReportsByType): ChartSeriesValues[] {
  return data.series.map((entry) => ({
    id: entry.entityType,
    label: entityTypeLabel(entry.entityType),
    colorVar: ENTITY_TYPE_COLOR[entry.entityType],
    values: entry.counts,
  }))
}

/** Total reports filed across the whole selected range. `null` for the loading placeholder. */
export function reportsByTypeHeadline(data: OverviewReportsByType): ChartHeadline | null {
  if (data.days === 0) return null
  return { value: formatChartValue(data.total), label: `Reports filed, ${data.days}d` }
}

/** What the chart counts, over what window, and in what unit — shown under its caption. */
export function reportsByTypeDescription(data: OverviewReportsByType): string {
  return `Moderation reports filed each UTC day over the last ${data.days} days, by the kind of entity reported, whatever their current status. Values are reports.`
}
