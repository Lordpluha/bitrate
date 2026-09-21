import type { OverviewSeries } from '@domain/overview'
import type { ChartSeriesValues } from '@presentation/components'

/** Short day-of-month labels for the charts' sr-only tables, e.g. "18 Sep". */
export function seriesCategories(series: OverviewSeries): string[] {
  return series.uploads.map((point) =>
    point.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  )
}

/** The stacked uploads-by-outcome chart: ready, failed, and stuck out of each day's total. */
export function uploadsChartSeries(series: OverviewSeries): ChartSeriesValues[] {
  return [
    {
      id: 'ready',
      label: 'Ready',
      colorVar: '--color-chart-3',
      values: series.uploads.map((point) => point.ready),
    },
    {
      id: 'failed',
      label: 'Failed',
      colorVar: '--color-chart-5',
      values: series.uploads.map((point) => point.failed),
    },
    {
      id: 'stuck',
      label: 'Stuck',
      colorVar: '--color-chart-4',
      values: series.uploads.map((point) => point.stuck),
    },
  ]
}

/** The signups line chart: new listener and artist accounts per day. */
export function signupsChartSeries(series: OverviewSeries): ChartSeriesValues[] {
  return [
    {
      id: 'listeners',
      label: 'Listeners',
      colorVar: '--color-chart-1',
      values: series.signups.map((point) => point.listeners),
    },
    {
      id: 'artists',
      label: 'Artists',
      colorVar: '--color-chart-2',
      values: series.signups.map((point) => point.artists),
    },
  ]
}

/** The listens line chart: one series, total listens per day. */
export function listensChartSeries(series: OverviewSeries): ChartSeriesValues[] {
  return [
    {
      id: 'listens',
      label: 'Listens',
      colorVar: '--color-chart-1',
      values: series.listens.map((point) => point.count),
    },
  ]
}

/** The reports-filed-per-day bar chart: one series. */
export function reportsChartSeries(series: OverviewSeries): ChartSeriesValues[] {
  return [
    {
      id: 'reports',
      label: 'Reports filed',
      colorVar: '--color-chart-5',
      values: series.reports.map((point) => point.count),
    },
  ]
}

/** The current report-status breakdown, as a categorical bar chart. */
export function reportsByStatusChartSeries(series: OverviewSeries): ChartSeriesValues[] {
  const { open, reviewing, resolved, rejected } = series.reportsByStatus
  return [
    {
      id: 'status',
      label: 'Reports',
      colorVar: '--color-chart-2',
      values: [open, reviewing, resolved, rejected],
    },
  ]
}

export const REPORT_STATUS_CATEGORIES = ['Open', 'Reviewing', 'Resolved', 'Rejected']

/** What each chart counts, over what window, and in what unit — shown under its caption. */
export function signupsChartDescription(series: OverviewSeries): string {
  return `New listener and artist accounts created each UTC day over the last ${series.days} days. Values are accounts.`
}

export function listensChartDescription(series: OverviewSeries): string {
  return `Total listens recorded each UTC day over the last ${series.days} days. Values are listens.`
}

export function uploadsChartDescription(series: OverviewSeries): string {
  return `Tracks uploaded each UTC day over the last ${series.days} days, by processing outcome. Values are tracks.`
}

export function reportsChartDescription(series: OverviewSeries): string {
  return `Moderation reports filed each UTC day over the last ${series.days} days. Values are reports.`
}

export function reportsByStatusChartDescription(): string {
  return "Every moderation report's current status, right now. Values are reports."
}

/** The range sentence shown above the charts — the summary text alternative for the section. */
export function rangeSummary(series: OverviewSeries): string {
  const from = series.from.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const to = series.to.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const totalListens = series.listens.reduce((sum, point) => sum + point.count, 0)
  const totalSignups = series.signups.reduce(
    (sum, point) => sum + point.listeners + point.artists,
    0,
  )
  return (
    `${series.days} days, ${from} to ${to}: ` +
    `${totalSignups} new accounts, ${totalListens} listens.`
  )
}
