import { AdminAuditLogEntity } from '@modules/admin/audit'
import { ApiProperty } from '@nestjs/swagger'

/** Open moderation report counts, by status. */
export class AdminOverviewReportsEntity {
  /** Reports awaiting a first look. */
  @ApiProperty()
  open: number

  /** Reports a moderator has already picked up. */
  @ApiProperty()
  reviewing: number
}

/** The track pipeline queue, by processing status, plus the stuck cut. */
export class AdminOverviewTracksEntity {
  /** Tracks still transcoding. */
  @ApiProperty()
  processing: number

  /** Tracks that finished transcoding successfully. */
  @ApiProperty()
  ready: number

  /** Tracks whose transcode failed. */
  @ApiProperty()
  failed: number

  /** `PROCESSING` tracks whose `processingStartedAt` is older than {@link stuckAfterMs}. */
  @ApiProperty()
  stuck: number

  /**
   * The cut, in milliseconds, after which a `PROCESSING` track counts as stuck — exposed so
   * the panel never has to duplicate this threshold as its own constant.
   */
  @ApiProperty()
  stuckAfterMs: number
}

/** Deactivated (soft-deleted) account counts. */
export class AdminOverviewDeactivatedEntity {
  /** Deactivated listener accounts. */
  @ApiProperty()
  users: number

  /** Deactivated artist accounts. */
  @ApiProperty()
  artists: number
}

/**
 * Activity in the trailing 7 days. Both counts are historical activity, not current state: a row
 * counts if it was created inside the window, whether or not it was soft-deleted afterward.
 */
export class AdminOverviewLast7DaysEntity {
  /** New listener + artist accounts created in the window, including ones later deactivated. */
  @ApiProperty()
  signups: number

  /** New tracks uploaded in the window, including ones later soft-deleted. */
  @ApiProperty()
  uploads: number
}

/** The operator landing dashboard's aggregate summary. */
export class AdminOverviewEntity {
  /** Moderation report counts. */
  @ApiProperty({ type: AdminOverviewReportsEntity })
  reports: AdminOverviewReportsEntity

  /** Track pipeline counts. */
  @ApiProperty({ type: AdminOverviewTracksEntity })
  tracks: AdminOverviewTracksEntity

  /** Deactivated account counts. */
  @ApiProperty({ type: AdminOverviewDeactivatedEntity })
  deactivated: AdminOverviewDeactivatedEntity

  /** Trailing-7-day activity counts. */
  @ApiProperty({ type: AdminOverviewLast7DaysEntity })
  last7Days: AdminOverviewLast7DaysEntity

  /** The 10 most recent operator actions, actor resolved. */
  @ApiProperty({ type: [AdminAuditLogEntity] })
  recentActivity: AdminAuditLogEntity[]
}
