/** One day's upload outcomes — the day a track was created, broken down by pipeline result. */
export type OverviewUploadsPoint = {
  date: Date
  uploaded: number
  ready: number
  failed: number
  stuck: number
}

/** One day's new accounts, by account type. */
export type OverviewSignupsPoint = {
  date: Date
  listeners: number
  artists: number
}

/** One day's listening-history rows recorded, across every user. */
export type OverviewListensPoint = {
  date: Date
  count: number
}

/** One day's newly filed moderation reports. */
export type OverviewReportsPoint = {
  date: Date
  count: number
}

/** The current (not windowed) distribution of every report across its statuses. */
export type OverviewReportsByStatus = {
  open: number
  reviewing: number
  resolved: number
  rejected: number
}

/** Zero-filled daily series over a trailing window of UTC calendar days, for the dashboard. */
export type OverviewSeries = {
  from: Date
  to: Date
  days: number
  uploads: OverviewUploadsPoint[]
  signups: OverviewSignupsPoint[]
  listens: OverviewListensPoint[]
  reports: OverviewReportsPoint[]
  reportsByStatus: OverviewReportsByStatus
}

/** The range choices the overview page's chart control offers. */
export const OVERVIEW_SERIES_RANGE_DAYS = [7, 30, 90] as const

export type OverviewSeriesRangeDays = (typeof OVERVIEW_SERIES_RANGE_DAYS)[number]
