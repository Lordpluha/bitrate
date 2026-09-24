import type { AuditEntry } from '../audit/audit-entry'

/** Open moderation report counts, by status. */
type OverviewReportCounts = {
  open: number
  reviewing: number
}

/**
 * The track pipeline queue, by processing status, plus the stuck cut.
 *
 * `stuckAfterMs` comes from the server response rather than this panel's own constant — see
 * `domain/track/track.ts`'s `STUCK_AFTER_MS` for why the catalog list still keeps a local copy
 * for `isTrackStuck`, and why this response is the authoritative one for the dashboard tile.
 */
type OverviewTrackCounts = {
  processing: number
  ready: number
  failed: number
  stuck: number
  stuckAfterMs: number
}

/** Deactivated (soft-deleted) account counts. */
type OverviewDeactivatedCounts = {
  users: number
  artists: number
}

/** Activity in the trailing 7 days. */
type OverviewLast7Days = {
  signups: number
  uploads: number
}

/** The operator landing dashboard's aggregate summary. */
export type Overview = {
  reports: OverviewReportCounts
  tracks: OverviewTrackCounts
  deactivated: OverviewDeactivatedCounts
  last7Days: OverviewLast7Days
  /** The 10 most recent operator actions, actor resolved. Reuses `AuditEntry` — same shape. */
  recentActivity: AuditEntry[]
}
