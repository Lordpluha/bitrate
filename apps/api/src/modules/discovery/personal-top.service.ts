import { normalizePagination } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { PUBLIC_ARTIST_SELECT } from '@modules/artists/artists.select'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

/** How far back a "top items" window reaches. */
export type TimeRange = 'short' | 'medium' | 'long'

/** Days covered by each listening window. */
const RANGE_DAYS: Record<TimeRange, number> = { short: 28, medium: 180, long: 3650 }

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** One ranked row: an entity id plus how many times the listener played it. */
type RankedRow = { id: string; plays: bigint }

/** A page of ranked ids, hydrated with the entities they point at. */
type RankedPageInput<T extends { id: string }> = {
  rows: RankedRow[]
  total: bigint | undefined
  entities: T[]
  pagination: ReturnType<typeof normalizePagination>
}

/** Joins ranked ids back to their entities, dropping rows whose entity vanished. */
function toRankedPage<T extends { id: string }>({
  rows,
  total,
  entities,
  pagination,
}: RankedPageInput<T>) {
  const byId = new Map(entities.map((entity) => [entity.id, entity]))

  return {
    data: rows.flatMap(({ id, plays }) => {
      const entity = byId.get(id)
      return entity ? [{ ...entity, plays: Number(plays) }] : []
    }),
    total: Number(total ?? 0n),
    page: pagination.page,
    limit: pagination.limit,
  }
}

/** Returns a listener's most-played tracks and artists over a time window. */
@Injectable()
export class PersonalTopService {
  /** Creates a new instance. */
  constructor(private readonly prisma: PrismaService) {}

  /** Returns the earliest `listenedAt` still inside the requested window. */
  private rangeStart(range: TimeRange) {
    return new Date(Date.now() - RANGE_DAYS[range] * MS_PER_DAY)
  }

  /** Runs the get top tracks operation. */
  async getTopTracks(userId: string, range: TimeRange, page = 1, limit = 20) {
    const pagination = normalizePagination(page, limit)
    const since = this.rangeStart(range)

    const [rows, countRows] = await Promise.all([
      this.prisma.queryRaw<RankedRow[]>(Prisma.sql`
        SELECT h."trackId" AS id, COUNT(*)::bigint AS plays
        FROM "ListeningHistory" h
        JOIN "Track" t ON t.id = h."trackId"
        WHERE h."userId" = ${userId}::uuid
          AND h."listenedAt" >= ${since}
          AND t."deletedAt" IS NULL
          AND t."processingStatus" = 'READY'
        GROUP BY h."trackId" ORDER BY plays DESC, h."trackId" ASC
        LIMIT ${pagination.limit} OFFSET ${pagination.skip}
      `),
      this.prisma.queryRaw<Array<{ total: bigint }>>(Prisma.sql`
        SELECT COUNT(*)::bigint AS total
        FROM (
          SELECT h."trackId"
          FROM "ListeningHistory" h
          JOIN "Track" t ON t.id = h."trackId"
          WHERE h."userId" = ${userId}::uuid
            AND h."listenedAt" >= ${since}
            AND t."deletedAt" IS NULL
            AND t."processingStatus" = 'READY'
          GROUP BY h."trackId"
        ) ranked_tracks
      `),
    ])

    const entities = await this.prisma.track.findMany({
      where: { id: { in: rows.map(({ id }) => id) }, deletedAt: null },
      include: { artist: { select: { id: true, username: true, avatar: true } } },
    })

    return toRankedPage({ rows, total: countRows[0]?.total, entities, pagination })
  }

  /** Runs the get top artists operation. */
  async getTopArtists(userId: string, range: TimeRange, page = 1, limit = 20) {
    const pagination = normalizePagination(page, limit)
    const since = this.rangeStart(range)

    const [rows, countRows] = await Promise.all([
      this.prisma.queryRaw<RankedRow[]>(Prisma.sql`
        SELECT t."artistId" AS id, COUNT(*)::bigint AS plays
        FROM "ListeningHistory" h
        JOIN "Track" t ON t.id = h."trackId"
        JOIN "Artist" a ON a.id = t."artistId"
        WHERE h."userId" = ${userId}::uuid
          AND h."listenedAt" >= ${since}
          AND t."deletedAt" IS NULL
          AND t."processingStatus" = 'READY'
          AND a."deletedAt" IS NULL
        GROUP BY t."artistId" ORDER BY plays DESC, t."artistId" ASC
        LIMIT ${pagination.limit} OFFSET ${pagination.skip}
      `),
      this.prisma.queryRaw<Array<{ total: bigint }>>(Prisma.sql`
        SELECT COUNT(*)::bigint AS total
        FROM (
          SELECT t."artistId"
          FROM "ListeningHistory" h
          JOIN "Track" t ON t.id = h."trackId"
          JOIN "Artist" a ON a.id = t."artistId"
          WHERE h."userId" = ${userId}::uuid
            AND h."listenedAt" >= ${since}
            AND t."deletedAt" IS NULL
            AND t."processingStatus" = 'READY'
            AND a."deletedAt" IS NULL
          GROUP BY t."artistId"
        ) ranked_artists
      `),
    ])

    const entities = await this.prisma.artist.findMany({
      where: { id: { in: rows.map(({ id }) => id) }, deletedAt: null },
      select: PUBLIC_ARTIST_SELECT,
    })

    return toRankedPage({ rows, total: countRows[0]?.total, entities, pagination })
  }
}
