import { DEFAULT_LIMIT, DEFAULT_PAGE, type PaginationInput } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import type { AuditContextValue } from '@modules/admin/shared'
import {
  runBatch,
  runTakeDownTransition,
  type TakeDownActor,
  type TakeDownDirection,
} from '@modules/admin/shared'
import { TrackUploadService } from '@modules/tracks'
import { Injectable } from '@nestjs/common'
import {
  type AdminTrackDetail,
  type AdminTrackRow,
  DELETED_AT_SELECT,
  DETAIL_INCLUDE,
  TRACK_ROW_SELECT,
  type TrackWithDetail,
  toAdminTrackRow,
} from './admin-tracks.select'
import {
  TrackAlreadyDeletedException,
  TrackNotDeletedException,
  TrackNotFoundException,
} from './errors'

/**
 * One track as the operator sees it — detail, processing history — and the moderation actions
 * on it: reprocess, take down, restore. Listing and CSV export live in `AdminTrackListService`.
 */
@Injectable()
export class AdminTracksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trackUpload: TrackUploadService,
  ) {}

  /** Flattens a track with the full detail include into the detail response shape. */
  private toDetail(track: TrackWithDetail, openReportCount: number): AdminTrackDetail {
    return {
      ...toAdminTrackRow(track),
      audioFiles: track.audioFiles,
      artists: track.artists.map((credit) => ({
        artistId: credit.artistId,
        username: credit.artist.username,
        isPrimary: credit.isPrimary,
        position: credit.position,
      })),
      genres: track.genres.map((entry) => entry.genre),
      albums: track.albums.map((entry) => ({
        id: entry.album.id,
        title: entry.album.title,
        trackNumber: entry.trackNumber,
        discNumber: entry.discNumber,
      })),
      openReportCount,
    }
  }

  /**
   * Finds one track by id. Deliberately does not filter `deletedAt` — a soft-deleted
   * track must stay reachable so the operator can review it before deciding to restore it.
   */
  async findById(id: string): Promise<AdminTrackDetail> {
    const [track, openReportCount] = await Promise.all([
      this.prisma.track.findFirst({ where: { id }, include: DETAIL_INCLUDE }),
      this.prisma.moderationReport.count({
        where: { entityType: 'track', entityId: id, status: 'OPEN' },
      }),
    ])
    if (!track) throw new TrackNotFoundException(id)

    return this.toDetail(track, openReportCount)
  }

  /**
   * Lists a track's recorded processing attempts, newest first. Deliberately does not filter
   * `deletedAt` — same reasoning as {@link findById}, the history stays reachable for a
   * soft-deleted track.
   */
  async findProcessingAttempts(
    id: string,
    { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT }: PaginationInput,
  ) {
    const [track, data, total] = await Promise.all([
      this.prisma.track.findFirst({ where: { id }, select: { id: true } }),
      this.prisma.trackProcessingAttempt.findMany({
        where: { trackId: id },
        orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.trackProcessingAttempt.count({ where: { trackId: id } }),
    ])
    if (!track) throw new TrackNotFoundException(id)

    return { data, total, page, limit }
  }

  /**
   * Re-queues a track's stored source file for transcoding.
   *
   * Reuses the existing audio-processing producer
   * (`TrackUploadService.reprocess`) instead of a second queue.
   */
  async reprocess(id: string) {
    const existing = await this.prisma.track.findFirst({ where: { id }, select: DELETED_AT_SELECT })
    if (!existing) throw new TrackNotFoundException(id)
    if (existing.deletedAt) throw new TrackAlreadyDeletedException(id)

    return await this.trackUpload.reprocess(id)
  }

  /**
   * Soft-deletes a track, recording the operator's stated reason in an audit row.
   *
   * The write is an `updateMany` scoped to `deletedAt: null` inside the transaction, not a
   * plain `update` — two concurrent take-down requests for the same track would otherwise both
   * "succeed", the second silently re-stamping `deletedAt` and re-writing an audit row for an
   * action that already happened. A `count` of 0 means someone else won the race, which is a
   * 409, not the 404 a genuinely missing track gets.
   */
  softDelete(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ): Promise<AdminTrackRow> {
    return this.transition('take-down', id, { staffId, reason, ...auditContext })
  }

  /** Takes every id down independently via {@link softDelete}; per-id results, same rules. */
  softDeleteMany(ids: readonly string[], staffId: string, auditContext: AuditContextValue = {}) {
    return runBatch(ids, (id) => this.softDelete(id, staffId, undefined, auditContext))
  }

  /**
   * Restores a soft-deleted track, recording the operator's stated reason in an audit row.
   * Uses the same `updateMany` + count-guard pattern as {@link softDelete} for the same
   * concurrent-request reason.
   */
  restore(
    id: string,
    staffId: string,
    reason?: string,
    auditContext: AuditContextValue = {},
  ): Promise<AdminTrackRow> {
    return this.transition('restore', id, { staffId, reason, ...auditContext })
  }

  /** Takes a track down or restores it, with its audit row — see {@link runTakeDownTransition}. */
  private transition(
    direction: TakeDownDirection,
    id: string,
    actor: TakeDownActor,
  ): Promise<AdminTrackRow> {
    const takeDown = direction === 'take-down'
    return runTakeDownTransition({
      prisma: this.prisma,
      direction,
      current: () => this.prisma.track.findFirst({ where: { id }, select: { deletedAt: true } }),
      mark: (tx, guard, data) => tx.track.updateMany({ where: { id, ...guard }, data }),
      load: async (tx) =>
        toAdminTrackRow(
          await tx.track.findFirstOrThrow({ where: { id }, select: TRACK_ROW_SELECT }),
        ),
      notFound: () => new TrackNotFoundException(id),
      conflict: () =>
        takeDown ? new TrackAlreadyDeletedException(id) : new TrackNotDeletedException(id),
      audit: { entityType: 'admin-tracks', entityId: id, ...actor },
    })
  }
}
