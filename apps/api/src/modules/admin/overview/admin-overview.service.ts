import { PrismaService } from '@infra/prisma/prisma.service'
import { AdminAuditService } from '@modules/admin/audit'
import { Injectable } from '@nestjs/common'
import { Prisma, type TrackProcessingStatus } from '@prisma/client'
import { DEFAULT_OVERVIEW_SERIES_DAYS } from './dtos'

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
 * "Signups" and "uploads" are historical activity counts, not current-state counts: a row counts
 * if it was *created* inside the trailing window, regardless of whether it was soft-deleted
 * afterward. `deactivated` already reports current soft-deleted state separately, so applying a
 * `deletedAt` filter here would double-penalize a row deactivated the same week it was created and
 * make the two sections disagree about what a "count" means. All three of users, artists, and
 * tracks apply this rule identically — none of the three `createdAt` queries below filters on
 * `deletedAt`.
 */

/** A single day's `date_trunc('day', …)::date` bucket, as Postgres returns it via `$queryRaw`. */
type DayBucket = { day: Date }

/** One day of `Track` creation, broken down by current processing outcome. */
type UploadsDayRow = DayBucket & { uploaded: number; ready: number; failed: number; stuck: number }

/** One day of a plain per-day count — shared shape for signups/listens/reports raw rows. */
type DayCountRow = DayBucket & { count: number }

/** One entry of a zero-filled series keyed only by day. */
type SeriesPoint<T> = { date: string } & T

/**
 * Formats a `date_trunc('day', …)::date` value as `YYYY-MM-DD`. Postgres returns a bare `date`
 * (no time-of-day, no offset) as a JS `Date` at UTC midnight, so slicing the ISO string is exact
 * — no timezone math needed on the way back out.
 */
function toDateKey(day: Date): string {
  return day.toISOString().slice(0, 10)
}

/**
 * The UTC calendar-day sequence a series window covers, oldest first, `days` entries long,
 * ending on `endUtcMidnight` (which callers pass as today at UTC midnight).
 */
function buildDateSequence(endUtcMidnight: Date, days: number): string[] {
  const start = new Date(endUtcMidnight)
  start.setUTCDate(start.getUTCDate() - (days - 1))

  return Array.from({ length: days }, (_, offset) => {
    const day = new Date(start)
    day.setUTCDate(day.getUTCDate() + offset)
    return toDateKey(day)
  })
}

/** Zero-fills a per-day count series (signups/listens/reports) across every day in the window. */
function zeroFillCounts(
  rows: readonly DayCountRow[],
  dates: readonly string[],
): SeriesPoint<{ count: number }>[] {
  const byDate = new Map(rows.map((row) => [toDateKey(row.day), row.count]))
  return dates.map((date) => ({ date, count: byDate.get(date) ?? 0 }))
}

/** Handles the operator landing dashboard's aggregate summary. */
@Injectable()
export class AdminOverviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
  ) {}

  /** Builds the aggregate overview: counts + one small recent-activity list. */
  async getOverview() {
    const now = new Date()
    const stuckCutoff = new Date(now.getTime() - STUCK_AFTER_MS)
    const last7DaysCutoff = new Date(now.getTime() - LAST_DAYS_WINDOW * 24 * 60 * 60 * 1000)

    const [
      openReports,
      reviewingReports,
      tracksByStatus,
      stuckTracks,
      deactivatedUsers,
      deactivatedArtists,
      newUsers,
      newArtists,
      newTracks,
      recentActivity,
    ] = await Promise.all([
      this.prisma.moderationReport.count({ where: { status: 'OPEN' } }),
      this.prisma.moderationReport.count({ where: { status: 'REVIEWING' } }),
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
      this.prisma.user.count({ where: { deletedAt: { not: null } } }),
      this.prisma.artist.count({ where: { deletedAt: { not: null } } }),
      this.prisma.user.count({ where: { createdAt: { gte: last7DaysCutoff } } }),
      this.prisma.artist.count({ where: { createdAt: { gte: last7DaysCutoff } } }),
      this.prisma.track.count({ where: { createdAt: { gte: last7DaysCutoff } } }),
      this.audit.findRecent(RECENT_ACTIVITY_LIMIT),
    ])

    const countByStatus = new Map<TrackProcessingStatus, number>(
      tracksByStatus.map((row) => [row.processingStatus, row._count._all]),
    )

    return {
      reports: { open: openReports, reviewing: reviewingReports },
      tracks: {
        processing: countByStatus.get('PROCESSING') ?? 0,
        ready: countByStatus.get('READY') ?? 0,
        failed: countByStatus.get('FAILED') ?? 0,
        stuck: stuckTracks,
        stuckAfterMs: STUCK_AFTER_MS,
      },
      deactivated: { users: deactivatedUsers, artists: deactivatedArtists },
      last7Days: { signups: newUsers + newArtists, uploads: newTracks },
      recentActivity,
    }
  }

  /**
   * Builds the dashboard's zero-filled daily series over a trailing window of UTC calendar
   * days, `days` long and ending today (UTC). Every series bucket is computed in SQL
   * (`date_trunc('day', …)`), not by pulling rows into Node, and zero-filled here so a day with
   * no matching rows still appears with `0` rather than being silently absent from the chart.
   */
  async getSeries(days: number = DEFAULT_OVERVIEW_SERIES_DAYS) {
    const now = new Date()
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    const dates = buildDateSequence(todayUtc, days)
    // `days` is zod-bound to >= 1 before this is ever called, so `dates` is never empty — the
    // fallback below is unreachable, just satisfying `noUncheckedIndexedAccess`.
    const oldestDate = dates[0] ?? toDateKey(todayUtc)
    const since = new Date(`${oldestDate}T00:00:00.000Z`)
    const stuckCutoff = new Date(now.getTime() - STUCK_AFTER_MS)

    const [uploadRows, listenerRows, artistRows, listenRows, reportRows, reportsByStatusRaw] =
      await Promise.all([
        this.prisma.queryRaw<UploadsDayRow[]>(Prisma.sql`
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
        `),
        this.prisma.queryRaw<DayCountRow[]>(Prisma.sql`
          SELECT date_trunc('day', "createdAt")::date AS day, COUNT(*)::int AS count
          FROM "User"
          WHERE "createdAt" >= ${since}
          GROUP BY 1
          ORDER BY 1
        `),
        this.prisma.queryRaw<DayCountRow[]>(Prisma.sql`
          SELECT date_trunc('day', "createdAt")::date AS day, COUNT(*)::int AS count
          FROM "Artist"
          WHERE "createdAt" >= ${since}
          GROUP BY 1
          ORDER BY 1
        `),
        this.prisma.queryRaw<DayCountRow[]>(Prisma.sql`
          SELECT date_trunc('day', "listenedAt")::date AS day, COUNT(*)::int AS count
          FROM "ListeningHistory"
          WHERE "listenedAt" >= ${since}
          GROUP BY 1
          ORDER BY 1
        `),
        this.prisma.queryRaw<DayCountRow[]>(Prisma.sql`
          SELECT date_trunc('day', "createdAt")::date AS day, COUNT(*)::int AS count
          FROM "ModerationReport"
          WHERE "createdAt" >= ${since}
          GROUP BY 1
          ORDER BY 1
        `),
        this.prisma.moderationReport.groupBy({ by: ['status'], _count: { _all: true } }),
      ])

    const uploadsByDate = new Map(uploadRows.map((row) => [toDateKey(row.day), row]))
    const uploads = dates.map((date) => {
      const row = uploadsByDate.get(date)
      return {
        date,
        uploaded: row?.uploaded ?? 0,
        ready: row?.ready ?? 0,
        failed: row?.failed ?? 0,
        stuck: row?.stuck ?? 0,
      }
    })

    const listenersByDate = new Map(listenerRows.map((row) => [toDateKey(row.day), row.count]))
    const artistsByDate = new Map(artistRows.map((row) => [toDateKey(row.day), row.count]))
    const signups = dates.map((date) => ({
      date,
      listeners: listenersByDate.get(date) ?? 0,
      artists: artistsByDate.get(date) ?? 0,
    }))

    const statusCounts = new Map(reportsByStatusRaw.map((row) => [row.status, row._count._all]))

    return {
      from: oldestDate,
      to: dates[dates.length - 1] ?? oldestDate,
      days,
      uploads,
      signups,
      listens: zeroFillCounts(listenRows, dates),
      reports: zeroFillCounts(reportRows, dates),
      reportsByStatus: {
        open: statusCounts.get('OPEN') ?? 0,
        reviewing: statusCounts.get('REVIEWING') ?? 0,
        resolved: statusCounts.get('RESOLVED') ?? 0,
        rejected: statusCounts.get('REJECTED') ?? 0,
      },
    }
  }
}
