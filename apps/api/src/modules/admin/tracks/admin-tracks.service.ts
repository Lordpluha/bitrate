import { PrismaService } from '@infra/prisma/prisma.service'
import { TrackUploadService } from '@modules/tracks'
import { Injectable } from '@nestjs/common'
import { Prisma, type TrackProcessingStatus } from '@prisma/client'
import { TrackNotFoundException } from './errors'

/** Input for listing operator-facing tracks. */
type ListTracksInput = {
  page?: number
  limit?: number
  processingStatus?: TrackProcessingStatus
  q?: string
}

/** A row of the operator track list, with its primary artist's name resolved. */
type AdminTrackRow = {
  id: string
  title: string
  artistId: string
  artistUsername: string
  processingStatus: TrackProcessingStatus
  processingError: string | null
  processingAttempts: number
  processingStartedAt: Date | null
  processingFinishedAt: Date | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Handles the operator-facing track pipeline queue.
 *
 * Listing defaults to surfacing problems first — `FAILED`, then the longest-stuck
 * `PROCESSING` rows, then everything else — because this screen exists for stuck
 * uploads, not an alphabetical catalog browse. That ordering can't be expressed as a
 * plain Prisma `orderBy`, so it's resolved with a small raw-SQL `CASE` query that
 * only ever selects ids; the actual rows are hydrated back through normal Prisma
 * `findMany` + `include`, keeping the raw-SQL surface (and its blast radius) minimal.
 */
@Injectable()
export class AdminTracksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trackUpload: TrackUploadService,
  ) {}

  /** Builds the shared Prisma `where` clause for counting. */
  private buildWhere({ processingStatus, q }: Omit<ListTracksInput, 'page' | 'limit'>) {
    return {
      deletedAt: null,
      ...(processingStatus && { processingStatus }),
      ...(q && { title: { contains: q, mode: 'insensitive' } }),
    } satisfies Prisma.TrackWhereInput
  }

  /** Builds the matching raw-SQL `WHERE` fragment for the ordered id query. */
  private buildRawWhere({ processingStatus, q }: Omit<ListTracksInput, 'page' | 'limit'>) {
    return Prisma.sql`
      WHERE "deletedAt" IS NULL
        ${processingStatus ? Prisma.sql`AND "processingStatus" = ${processingStatus}::"TrackProcessingStatus"` : Prisma.empty}
        ${q ? Prisma.sql`AND title ILIKE ${`%${q}%`}` : Prisma.empty}
    `
  }

  /** Runs the find all operation, paginated, problem-first by default. */
  async findAll({ page = 1, limit = 20, processingStatus, q }: ListTracksInput) {
    const where = this.buildWhere({ processingStatus, q })
    const rawWhere = this.buildRawWhere({ processingStatus, q })
    const skip = (page - 1) * limit

    const [orderedIds, total] = await Promise.all([
      this.prisma.queryRaw<{ id: string }[]>(Prisma.sql`
        SELECT id FROM "Track"
        ${rawWhere}
        ORDER BY
          CASE "processingStatus" WHEN 'FAILED' THEN 0 WHEN 'PROCESSING' THEN 1 ELSE 2 END,
          "processingStartedAt" ASC NULLS LAST,
          "createdAt" DESC
        OFFSET ${skip} LIMIT ${limit}
      `),
      this.prisma.track.count({ where }),
    ])

    const data = await this.hydrateOrdered(orderedIds.map((row) => row.id))
    return { data, total, page, limit }
  }

  /** Fetches full rows for the given ids and restores the id order raw SQL computed. */
  private async hydrateOrdered(ids: string[]): Promise<AdminTrackRow[]> {
    if (ids.length === 0) return []

    const tracks = await this.prisma.track.findMany({
      where: { id: { in: ids } },
      include: { artist: { select: { username: true } } },
    })
    const byId = new Map(tracks.map((track) => [track.id, track]))

    return ids.flatMap((id) => {
      const track = byId.get(id)
      if (!track) return []
      return [
        {
          id: track.id,
          title: track.title,
          artistId: track.artistId,
          artistUsername: track.artist.username,
          processingStatus: track.processingStatus,
          processingError: track.processingError,
          processingAttempts: track.processingAttempts,
          processingStartedAt: track.processingStartedAt,
          processingFinishedAt: track.processingFinishedAt,
          deletedAt: track.deletedAt,
          createdAt: track.createdAt,
          updatedAt: track.updatedAt,
        },
      ]
    })
  }

  /** Runs the find by id operation. Excludes soft-deleted tracks. */
  async findById(id: string): Promise<AdminTrackRow> {
    const track = await this.prisma.track.findFirst({
      where: { id, deletedAt: null },
      include: { artist: { select: { username: true } } },
    })
    if (!track) throw new TrackNotFoundException(id)

    return {
      id: track.id,
      title: track.title,
      artistId: track.artistId,
      artistUsername: track.artist.username,
      processingStatus: track.processingStatus,
      processingError: track.processingError,
      processingAttempts: track.processingAttempts,
      processingStartedAt: track.processingStartedAt,
      processingFinishedAt: track.processingFinishedAt,
      deletedAt: track.deletedAt,
      createdAt: track.createdAt,
      updatedAt: track.updatedAt,
    }
  }

  /**
   * Re-queues a track's stored source file for transcoding.
   *
   * Reuses the existing audio-processing producer
   * (`TrackUploadService.reprocess`) instead of a second queue.
   */
  async reprocess(id: string) {
    const existing = await this.prisma.track.findFirst({ where: { id, deletedAt: null } })
    if (!existing) throw new TrackNotFoundException(id)

    return await this.trackUpload.reprocess(id)
  }
}
