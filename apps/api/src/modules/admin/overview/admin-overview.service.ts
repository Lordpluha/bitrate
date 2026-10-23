import { PrismaService } from '@infra/prisma/prisma.service'
import { AdminAuditService } from '@modules/admin/audit'
import { MODERATION_ENTITY_TYPES } from '@modules/moderation'
import { Injectable } from '@nestjs/common'
import { Prisma, type TrackProcessingStatus } from '@prisma/client'
import { DEFAULT_OVERVIEW_SERIES_DAYS } from './dtos'
import {
  type DayCountRow,
  type DayEntityTypeRow,
  resolveWindow,
  toDateKey,
  type UploadsDayRow,
  zeroFillCounts,
  zeroFillSignups,
  zeroFillUploads,
} from './overview-series'

/**
 * The cut, in milliseconds, after which a `PROCESSING` track counts as stuck. Mirrors
 * `apps/admin`'s own `STUCK_AFTER_MS` (`domain/track/track.ts`) — kept as one source per side,
 * and returned in the response so the panel reads it rather than duplicating it.
 */
export const STUCK_AFTER_MS = 30 * 60 * 1000

/** How many most-recent audit log rows the dashboard surfaces. */
const RECENT_ACTIVITY_LIMIT = 10

/** The trailing window, in days, "signups"/"uploads" counts cover. */
const LAST_DAYS_WINDOW = 7

/**
 * The tables and timestamp columns the plain per-day series count. Both are compile-time
 * constants spliced in with `Prisma.raw` — never a caller-supplied value.
 */
type DailyCountSource =
  | { table: 'User' | 'Artist' | 'ModerationReport'; column: 'createdAt' }
  | { table: 'ListeningHistory'; column: 'listenedAt' }

/** The overview's track tile: current processing outcomes plus the stuck count and its cut. */
type TrackTile = {
  processing: number
  ready: number
  failed: number
  stuck: number
  stuckAfterMs: number
}

/** A moderation entity type the reports-by-type breakdown keys on. */
type ModerationEntityType = (typeof MODERATION_ENTITY_TYPES)[number]

/** Handles the operator landing dashboard's aggregate summary. */
@Injectable()
export class AdminOverviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
  ) {}

  /**
   * Builds the aggregate overview: counts + one small recent-activity list.
   *
   * "Signups" and "uploads" are historical activity counts, not current-state counts: a row
   * counts if it was *created* inside the trailing window, regardless of whether it was
   * soft-deleted afterward. `deactivated` already reports current soft-deleted state separately,
   * so a `deletedAt` filter here would double-penalize a row deactivated the same week it was
   * created and make the two sections disagree about what a "count" means — none of the three
   * `createdAt` counts below filters on `deletedAt`.
   */
  async getOverview() {
    const now = new Date()
    const stuckCutoff = new Date(now.getTime() - STUCK_AFTER_MS)
    const last7DaysCutoff = new Date(now.getTime() - LAST_DAYS_WINDOW * 24 * 60 * 60 * 1000)

    const [reports, tracks, deactivated, last7Days, recentActivity] = await Promise.all([
      this.countOpenReports(),
      this.countTracks(stuckCutoff),
      this.countDeactivated(),
      this.countCreatedSince(last7DaysCutoff),
      this.audit.findRecent(RECENT_ACTIVITY_LIMIT),
    ])

    return { reports, tracks, deactivated, last7Days, recentActivity }
  }

  /** Reports still waiting on an operator, by status. */
  private async countOpenReports(): Promise<{ open: number; reviewing: number }> {
    const [open, reviewing] = await Promise.all([
      this.prisma.moderationReport.count({ where: { status: 'OPEN' } }),
      this.prisma.moderationReport.count({ where: { status: 'REVIEWING' } }),
    ])
    return { open, reviewing }
  }

  /** Live tracks by processing outcome, plus the `PROCESSING` ones older than `stuckCutoff`. */
  private async countTracks(stuckCutoff: Date): Promise<TrackTile> {
    const [tracksByStatus, stuck] = await Promise.all([
      this.prisma.track.groupBy({
        by: ['processingStatus'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      this.prisma.track.count({
        where: {
          deletedAt: null,
          processingStatus: 'PROCESSING',
          // A track a worker never picked up has `processingStartedAt: null` forever — see
          // `track-upload.service.ts`, which only ever sets it to `null` on create/reprocess;
          // only `audio-processing.consumer.ts` stamps a real timestamp once a worker dequeues
          // the job. Falling back to `updatedAt` (bumped by the same create/reprocess writes)
          // keeps a never-dequeued track from being invisible to this count forever.
          OR: [
            { processingStartedAt: { lt: stuckCutoff } },
            { processingStartedAt: null, updatedAt: { lt: stuckCutoff } },
          ],
        },
      }),
    ])

    const countByStatus = new Map<TrackProcessingStatus, number>(
      tracksByStatus.map((row) => [row.processingStatus, row._count._all]),
    )
    return {
      processing: countByStatus.get('PROCESSING') ?? 0,
      ready: countByStatus.get('READY') ?? 0,
      failed: countByStatus.get('FAILED') ?? 0,
      stuck,
      stuckAfterMs: STUCK_AFTER_MS,
    }
  }

  /** Currently soft-deleted listeners and artists. */
  private async countDeactivated(): Promise<{ users: number; artists: number }> {
    const [users, artists] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: { not: null } } }),
      this.prisma.artist.count({ where: { deletedAt: { not: null } } }),
    ])
    return { users, artists }
  }

  /** Accounts (listeners + artists) and tracks created since `cutoff`, deleted or not. */
  private async countCreatedSince(cutoff: Date): Promise<{ signups: number; uploads: number }> {
    const [newUsers, newArtists, uploads] = await Promise.all([
      this.prisma.user.count({ where: { createdAt: { gte: cutoff } } }),
      this.prisma.artist.count({ where: { createdAt: { gte: cutoff } } }),
      this.prisma.track.count({ where: { createdAt: { gte: cutoff } } }),
    ])
    return { signups: newUsers + newArtists, uploads }
  }

  /**
   * Builds the dashboard's zero-filled daily series over a trailing window of UTC calendar
   * days, `days` long and ending today (UTC). Every series bucket is computed in SQL
   * (`date_trunc('day', …)`), not by pulling rows into Node, and zero-filled here so a day with
   * no matching rows still appears with `0` rather than being silently absent from the chart.
   */
  async getSeries(days: number = DEFAULT_OVERVIEW_SERIES_DAYS) {
    const now = new Date()
    const { dates, oldestDate, since } = resolveWindow(now, days)
    const stuckCutoff = new Date(now.getTime() - STUCK_AFTER_MS)

    const [uploadRows, listenerRows, artistRows, listenRows, reportRows, reportsByStatus] =
      await Promise.all([
        this.dailyUploads(since, stuckCutoff),
        this.dailyCounts({ table: 'User', column: 'createdAt' }, since),
        this.dailyCounts({ table: 'Artist', column: 'createdAt' }, since),
        this.dailyCounts({ table: 'ListeningHistory', column: 'listenedAt' }, since),
        this.dailyCounts({ table: 'ModerationReport', column: 'createdAt' }, since),
        this.countReportsByStatus(),
      ])

    return {
      from: oldestDate,
      to: dates[dates.length - 1] ?? oldestDate,
      days,
      uploads: zeroFillUploads(uploadRows, dates),
      signups: zeroFillSignups(listenerRows, artistRows, dates),
      listens: zeroFillCounts(listenRows, dates),
      reports: zeroFillCounts(reportRows, dates),
      reportsByStatus,
    }
  }

  /** Tracks created per UTC day from `since` on, by current outcome — days with none are absent. */
  private dailyUploads(since: Date, stuckCutoff: Date): Promise<UploadsDayRow[]> {
    return this.prisma.queryRaw<UploadsDayRow[]>(Prisma.sql`
      SELECT
        date_trunc('day', "createdAt")::date AS day,
        COUNT(*)::int AS uploaded,
        COUNT(*) FILTER (WHERE "processingStatus" = 'READY')::int AS ready,
        COUNT(*) FILTER (WHERE "processingStatus" = 'FAILED')::int AS failed,
        COUNT(*) FILTER (
          WHERE "processingStatus" = 'PROCESSING'
            AND COALESCE("processingStartedAt", "updatedAt") < ${stuckCutoff}
        )::int AS stuck
      FROM "Track"
      WHERE "createdAt" >= ${since}
      GROUP BY 1
      ORDER BY 1
    `)
  }

  /** Rows per UTC day of `source`, from `since` on — days with no rows are absent. */
  private dailyCounts({ table, column }: DailyCountSource, since: Date): Promise<DayCountRow[]> {
    const day = Prisma.raw(`"${column}"`)
    return this.prisma.queryRaw<DayCountRow[]>(Prisma.sql`
      SELECT date_trunc('day', ${day})::date AS day, COUNT(*)::int AS count
      FROM ${Prisma.raw(`"${table}"`)}
      WHERE ${day} >= ${since}
      GROUP BY 1
      ORDER BY 1
    `)
  }

  /** Every moderation report by current status, all time. */
  private async countReportsByStatus(): Promise<{
    open: number
    reviewing: number
    resolved: number
    rejected: number
  }> {
    const rows = await this.prisma.moderationReport.groupBy({
      by: ['status'],
      _count: { _all: true },
    })
    const statusCounts = new Map(rows.map((row) => [row.status, row._count._all]))
    return {
      open: statusCounts.get('OPEN') ?? 0,
      reviewing: statusCounts.get('REVIEWING') ?? 0,
      resolved: statusCounts.get('RESOLVED') ?? 0,
      rejected: statusCounts.get('REJECTED') ?? 0,
    }
  }

  /**
   * Moderation reports *created* per UTC day over the same trailing window as `getSeries`,
   * broken down by entity type. Counts every report filed in the window regardless of its
   * current status (consistent with `getSeries().reports`, which it drills into). Every
   * `MODERATION_ENTITY_TYPES` value is present and zero-filled; rows with an unrecognised entity
   * type (the column is a free `String`) are ignored.
   */
  async getReportsByType(days: number = DEFAULT_OVERVIEW_SERIES_DAYS) {
    const { dates, oldestDate, since } = resolveWindow(new Date(), days)

    const rows = await this.prisma.queryRaw<DayEntityTypeRow[]>(Prisma.sql`
      SELECT
        date_trunc('day', "createdAt")::date AS day,
        "entityType" AS "entityType",
        COUNT(*)::int AS count
      FROM "ModerationReport"
      WHERE "createdAt" >= ${since}
      GROUP BY 1, 2
      ORDER BY 1
    `)

    const countsByType = bucketByEntityType(rows, dates)
    const series = MODERATION_ENTITY_TYPES.map((entityType) => {
      const counts = countsByType.get(entityType) ?? []
      return { entityType, counts, total: counts.reduce((sum, value) => sum + value, 0) }
    })

    return {
      from: oldestDate,
      to: dates[dates.length - 1] ?? oldestDate,
      days,
      dates,
      series,
      total: series.reduce((sum, entry) => sum + entry.total, 0),
    }
  }
}

/** Per known entity type, a zero-filled count per day of `dates`; unknown types are dropped. */
function bucketByEntityType(
  rows: readonly DayEntityTypeRow[],
  dates: readonly string[],
): Map<ModerationEntityType, number[]> {
  const dayIndex = new Map(dates.map((date, index) => [date, index]))
  const countsByType = new Map(
    MODERATION_ENTITY_TYPES.map((type) => [type, dates.map(() => 0)] as const),
  )
  for (const row of rows) {
    const counts = countsByType.get(row.entityType as ModerationEntityType)
    const index = dayIndex.get(toDateKey(row.day))
    if (counts && index !== undefined) counts[index] = (counts[index] ?? 0) + row.count
  }
  return countsByType
}
