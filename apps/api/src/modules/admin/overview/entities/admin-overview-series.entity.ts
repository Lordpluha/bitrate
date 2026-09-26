import { ApiProperty } from '@nestjs/swagger'

/** One day's upload volume and how those uploads' processing currently stands. */
export class AdminOverviewUploadsPointEntity {
  /** The UTC calendar day this point covers, as `YYYY-MM-DD`. */
  @ApiProperty()
  date: string

  /** Tracks created on this day. */
  @ApiProperty()
  uploaded: number

  /** Of those, how many are currently `READY`. */
  @ApiProperty()
  ready: number

  /** Of those, how many are currently `FAILED`. */
  @ApiProperty()
  failed: number

  /**
   * Of those, how many are currently `PROCESSING` and past the stuck cut (see
   * `AdminOverviewTracksEntity.stuckAfterMs`) — evaluated at query time, not at end of day.
   */
  @ApiProperty()
  stuck: number
}

/** One day's new listener and artist accounts. */
export class AdminOverviewSignupsPointEntity {
  /** The UTC calendar day this point covers, as `YYYY-MM-DD`. */
  @ApiProperty()
  date: string

  /** New listener accounts created on this day. */
  @ApiProperty()
  listeners: number

  /** New artist accounts created on this day. */
  @ApiProperty()
  artists: number
}

/** One day's listen count, across every user. */
export class AdminOverviewListensPointEntity {
  /** The UTC calendar day this point covers, as `YYYY-MM-DD`. */
  @ApiProperty()
  date: string

  /** Listening-history rows recorded on this day. */
  @ApiProperty()
  count: number
}

/** One day's newly filed moderation reports. */
export class AdminOverviewReportsPointEntity {
  /** The UTC calendar day this point covers, as `YYYY-MM-DD`. */
  @ApiProperty()
  date: string

  /** Reports filed on this day. */
  @ApiProperty()
  count: number
}

/** The current distribution of every moderation report across its lifecycle statuses. */
export class AdminOverviewReportsByStatusEntity {
  /** Reports awaiting a first look. */
  @ApiProperty()
  open: number

  /** Reports a moderator has picked up. */
  @ApiProperty()
  reviewing: number

  /** Reports closed with action taken. */
  @ApiProperty()
  resolved: number

  /** Reports closed with no action taken. */
  @ApiProperty()
  rejected: number
}

/**
 * Daily time series for the operator dashboard's charts, over a trailing window of calendar
 * days. Every series is zero-filled — a day with no matching rows still appears, with `0`
 * counts, so a chart never draws a misleading gap-free line across missing days. Days are UTC
 * calendar days: a row counts toward the day its timestamp falls on after truncation to UTC
 * midnight, matching how every timestamp in this API is stored and compared elsewhere.
 */
export class AdminOverviewSeriesEntity {
  /** The oldest day in the window, inclusive, as `YYYY-MM-DD`. */
  @ApiProperty()
  from: string

  /** The newest (today, UTC) day in the window, inclusive, as `YYYY-MM-DD`. */
  @ApiProperty()
  to: string

  /** How many calendar days the window covers — `uploads`/`signups`/`listens`/`reports` each
   * have exactly this many entries. */
  @ApiProperty()
  days: number

  /** Daily uploads, by processing outcome. */
  @ApiProperty({ type: [AdminOverviewUploadsPointEntity] })
  uploads: AdminOverviewUploadsPointEntity[]

  /** Daily new accounts, by account type. */
  @ApiProperty({ type: [AdminOverviewSignupsPointEntity] })
  signups: AdminOverviewSignupsPointEntity[]

  /** Daily listens, across every user. */
  @ApiProperty({ type: [AdminOverviewListensPointEntity] })
  listens: AdminOverviewListensPointEntity[]

  /** Daily newly filed moderation reports. */
  @ApiProperty({ type: [AdminOverviewReportsPointEntity] })
  reports: AdminOverviewReportsPointEntity[]

  /** The current (not windowed) distribution of every report across its statuses. */
  @ApiProperty({ type: AdminOverviewReportsByStatusEntity })
  reportsByStatus: AdminOverviewReportsByStatusEntity
}
