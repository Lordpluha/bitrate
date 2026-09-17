import { PrismaService } from '@infra/prisma/prisma.service'
import { AdminAuditService } from '@modules/admin/audit'
import { Injectable } from '@nestjs/common'
import type { TrackProcessingStatus } from '@prisma/client'

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
}
