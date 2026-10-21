import { normalizePagination } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { PUBLIC_ARTIST_SELECT } from '@modules/artists/artists.select'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { toRankedPage } from './ranked-page'

/** How far back a "top items" window reaches. */
export type TimeRange = 'short' | 'medium' | 'long'

/** Days covered by each listening window. */
const RANGE_DAYS: Record<TimeRange, number> = { short: 28, medium: 180, long: 3650 }

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** One ranked row: an entity id plus how many times the listener played it. */
type RankedRow = { id: string; plays: bigint }

/** Adds the row's play count to its entity. */
const withPlays = <T>(entity: T, { plays }: RankedRow) => ({ ...entity, plays: Number(plays) })

/** Returns a listener's most-played tracks and artists over a time window. */
@Injectable()
export class PersonalTopService {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns the earliest `listenedAt` still inside the requested window. */
  private rangeStart(range: TimeRange) {
    return new Date(Date.now() - RANGE_DAYS[range] * MS_PER_DAY)
  }

  /** The listener's most-played ready tracks in the window, most plays first. */
  async getTopTracks(userId: string, range: TimeRange, page = 1, limit = 20) {
    const pagination = normalizePagination(page, limit)
    const source = Prisma.sql`
      FROM "ListeningHistory" h
      JOIN "Track" t ON t.id = h."trackId"
      WHERE h."userId" = ${userId}::uuid
        AND h."listenedAt" >= ${this.rangeStart(range)}
        AND t."deletedAt" IS NULL
        AND t."processingStatus" = 'READY'
    `

    const [rows, countRows] = await Promise.all([
      this.prisma.queryRaw<RankedRow[]>(Prisma.sql`
        SELECT h."trackId" AS id, COUNT(*)::bigint AS plays
        ${source}
        GROUP BY h."trackId" ORDER BY plays DESC, h."trackId" ASC
        LIMIT ${pagination.limit} OFFSET ${pagination.skip}
      `),
      this.prisma.queryRaw<Array<{ total: bigint }>>(Prisma.sql`
        SELECT COUNT(DISTINCT h."trackId")::bigint AS total
        ${source}
      `),
    ])

    const entities = await this.prisma.track.findMany({
      where: { id: { in: rows.map(({ id }) => id) }, deletedAt: null },
      include: { artist: { select: { id: true, username: true, avatar: true } } },
    })

    return toRankedPage({
      rows,
      total: countRows[0]?.total,
      entities,
      pagination,
      rank: withPlays,
    })
  }

  /** The listener's most-played artists in the window, most plays first. */
  async getTopArtists(userId: string, range: TimeRange, page = 1, limit = 20) {
    const pagination = normalizePagination(page, limit)
    const source = Prisma.sql`
      FROM "ListeningHistory" h
      JOIN "Track" t ON t.id = h."trackId"
      JOIN "Artist" a ON a.id = t."artistId"
      WHERE h."userId" = ${userId}::uuid
        AND h."listenedAt" >= ${this.rangeStart(range)}
        AND t."deletedAt" IS NULL
        AND t."processingStatus" = 'READY'
        AND a."deletedAt" IS NULL
    `

    const [rows, countRows] = await Promise.all([
      this.prisma.queryRaw<RankedRow[]>(Prisma.sql`
        SELECT t."artistId" AS id, COUNT(*)::bigint AS plays
        ${source}
        GROUP BY t."artistId" ORDER BY plays DESC, t."artistId" ASC
        LIMIT ${pagination.limit} OFFSET ${pagination.skip}
      `),
      this.prisma.queryRaw<Array<{ total: bigint }>>(Prisma.sql`
        SELECT COUNT(DISTINCT t."artistId")::bigint AS total
        ${source}
      `),
    ])

    const entities = await this.prisma.artist.findMany({
      where: { id: { in: rows.map(({ id }) => id) }, deletedAt: null },
      select: PUBLIC_ARTIST_SELECT,
    })

    return toRankedPage({
      rows,
      total: countRows[0]?.total,
      entities,
      pagination,
      rank: withPlays,
    })
  }
}
