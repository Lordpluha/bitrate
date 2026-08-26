import { normalizePagination } from '@common/pagination'
import { NS, TTL } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

export type SearchType = 'tracks' | 'artists' | 'albums' | 'playlists'

export type SearchFilters = {
  year?: number
  genre?: string
  artist?: string
}

export type SearchOptions = SearchFilters & {
  types: SearchType[]
  page: number
  limit: number
  userId?: string
}

type SearchResult = {
  id: string
  title: string
  subtitle: string | null
  image: string | null
  type: SearchType
  rank: number
  artistId: string | null
  ownerId: string | null
}

type SearchCount = { count: number }

const ALL_TYPES: SearchType[] = ['tracks', 'artists', 'albums', 'playlists']

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async search(query: string, options: Partial<SearchOptions> = {}) {
    const types = options.types ?? ALL_TYPES
    const pagination = normalizePagination(options.page ?? 1, options.limit ?? 10)
    const { page, limit } = pagination
    const filters = {
      year: options.year,
      genre: options.genre?.trim() || undefined,
      artist: options.artist?.trim() || undefined,
    }
    const key = JSON.stringify({
      query: query.toLowerCase(),
      types: [...types].sort(),
      page,
      limit,
      filters,
    })

    const response = await this.cache.wrap(NS.SEARCH, key, TTL.MEDIUM, async () => {
      const offset = pagination.skip
      const resultEntries = await Promise.all(
        types.map(
          async (type) =>
            [type, await this.searchType(type, query, limit, offset, filters)] as const,
        ),
      )
      const countEntries = await Promise.all(
        types.map(async (type) => [type, await this.countType(type, query, filters)] as const),
      )
      const data = Object.fromEntries(resultEntries) as Record<SearchType, SearchResult[]>
      const totals = Object.fromEntries(countEntries) as Record<SearchType, number>
      const allResults = resultEntries.flatMap(([, values]) => values)

      return {
        data,
        totals,
        total: Object.values(totals).reduce((sum, count) => sum + count, 0),
        page,
        limit,
        limitPerType: limit,
        topResult: allResults.sort((left, right) => right.rank - left.rank)[0] ?? null,
      }
    })

    if (options.userId) {
      await this.recordSearch(options.userId, query)
    }

    return response
  }

  async getHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [data, total] = await this.prisma.$transaction([
      this.prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { searchedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.searchHistory.count({ where: { userId } }),
    ])
    return { data, total, page, limit }
  }

  async clearHistory(userId: string) {
    await this.prisma.searchHistory.deleteMany({ where: { userId } })
  }

  private async recordSearch(userId: string, query: string) {
    const normalizedQuery = query.trim().slice(0, 200)
    const latest = await this.prisma.searchHistory.findFirst({
      where: { userId, query: { equals: normalizedQuery, mode: 'insensitive' } },
      orderBy: { searchedAt: 'desc' },
    })
    if (latest && Date.now() - latest.searchedAt.getTime() < 60_000) return

    await this.prisma.searchHistory.create({ data: { userId, query: normalizedQuery } })
  }

  private searchType(
    type: SearchType,
    query: string,
    limit: number,
    offset: number,
    filters: SearchFilters,
  ) {
    switch (type) {
      case 'tracks':
        return this.searchTracks(query, limit, offset, filters)
      case 'artists':
        return this.searchArtists(query, limit, offset, filters)
      case 'albums':
        return this.searchAlbums(query, limit, offset, filters)
      case 'playlists':
        return this.searchPlaylists(query, limit, offset)
    }
  }

  private countType(type: SearchType, query: string, filters: SearchFilters) {
    switch (type) {
      case 'tracks':
        return this.countTracks(query, filters)
      case 'artists':
        return this.countArtists(query, filters)
      case 'albums':
        return this.countAlbums(query, filters)
      case 'playlists':
        return this.countPlaylists(query)
    }
  }

  private async countTracks(query: string, filters: SearchFilters) {
    const [result] = await this.prisma.queryRaw<SearchCount[]>(Prisma.sql`
      SELECT COUNT(*)::int AS count
      FROM "Track" t
      JOIN "Artist" a ON a.id = t."artistId"
      WHERE t."processingStatus" = 'READY' AND t."deletedAt" IS NULL
        AND (t.title % ${query} OR t.title ILIKE ${`%${query}%`} OR a.username ILIKE ${`%${query}%`})
        ${filters.year ? Prisma.sql`AND EXTRACT(YEAR FROM t."releaseDate") = ${filters.year}` : Prisma.empty}
        ${filters.artist ? Prisma.sql`AND a.username ILIKE ${`%${filters.artist}%`}` : Prisma.empty}
        ${
          filters.genre
            ? Prisma.sql`AND EXISTS (
          SELECT 1 FROM "TrackGenre" tg JOIN "Genre" g ON g.id = tg."genreId"
          WHERE tg."trackId" = t.id AND (g.slug = ${filters.genre} OR g.name ILIKE ${filters.genre})
        )`
            : Prisma.empty
        }
    `)
    return result?.count ?? 0
  }

  private async countArtists(query: string, filters: SearchFilters) {
    const [result] = await this.prisma.queryRaw<SearchCount[]>(Prisma.sql`
      SELECT COUNT(*)::int AS count
      FROM "Artist" a
      WHERE a."deletedAt" IS NULL AND (a.username % ${query} OR a.username ILIKE ${`%${query}%`})
        ${filters.artist ? Prisma.sql`AND a.username ILIKE ${`%${filters.artist}%`}` : Prisma.empty}
        ${
          filters.genre
            ? Prisma.sql`AND EXISTS (
          SELECT 1 FROM "ArtistGenre" ag JOIN "Genre" g ON g.id = ag."genreId"
          WHERE ag."artistId" = a.id AND (g.slug = ${filters.genre} OR g.name ILIKE ${filters.genre})
        )`
            : Prisma.empty
        }
    `)
    return result?.count ?? 0
  }

  private async countAlbums(query: string, filters: SearchFilters) {
    const [result] = await this.prisma.queryRaw<SearchCount[]>(Prisma.sql`
      SELECT COUNT(*)::int AS count
      FROM "Album" al JOIN "Artist" a ON a.id = al."artistId"
      WHERE al."deletedAt" IS NULL AND (al.title % ${query} OR al.title ILIKE ${`%${query}%`})
        ${filters.year ? Prisma.sql`AND EXTRACT(YEAR FROM al."releaseDate") = ${filters.year}` : Prisma.empty}
        ${filters.artist ? Prisma.sql`AND a.username ILIKE ${`%${filters.artist}%`}` : Prisma.empty}
        ${
          filters.genre
            ? Prisma.sql`AND EXISTS (
          SELECT 1 FROM "AlbumGenre" ag JOIN "Genre" g ON g.id = ag."genreId"
          WHERE ag."albumId" = al.id AND (g.slug = ${filters.genre} OR g.name ILIKE ${filters.genre})
        )`
            : Prisma.empty
        }
    `)
    return result?.count ?? 0
  }

  private async countPlaylists(query: string) {
    const [result] = await this.prisma.queryRaw<SearchCount[]>(Prisma.sql`
      SELECT COUNT(*)::int AS count
      FROM "Playlist" p
      WHERE p."isPublic" = true AND p."deletedAt" IS NULL
        AND (p.title % ${query} OR p.title ILIKE ${`%${query}%`})
    `)
    return result?.count ?? 0
  }

  private searchTracks(query: string, limit: number, offset: number, filters: SearchFilters) {
    return this.prisma.queryRaw<SearchResult[]>(Prisma.sql`
      SELECT t.id, t.title, a.username AS subtitle, t.cover AS image, 'tracks' AS type,
        a.id AS "artistId", NULL::uuid AS "ownerId",
        GREATEST(similarity(t.title, ${query}), similarity(a.username, ${query})) AS rank
      FROM "Track" t
      JOIN "Artist" a ON a.id = t."artistId"
      WHERE t."processingStatus" = 'READY' AND t."deletedAt" IS NULL
        AND (t.title % ${query} OR t.title ILIKE ${`%${query}%`} OR a.username ILIKE ${`%${query}%`})
        ${filters.year ? Prisma.sql`AND EXTRACT(YEAR FROM t."releaseDate") = ${filters.year}` : Prisma.empty}
        ${filters.artist ? Prisma.sql`AND a.username ILIKE ${`%${filters.artist}%`}` : Prisma.empty}
        ${
          filters.genre
            ? Prisma.sql`AND EXISTS (
          SELECT 1 FROM "TrackGenre" tg JOIN "Genre" g ON g.id = tg."genreId"
          WHERE tg."trackId" = t.id AND (g.slug = ${filters.genre} OR g.name ILIKE ${filters.genre})
        )`
            : Prisma.empty
        }
      ORDER BY rank DESC, t.popularity DESC, t.id ASC
      LIMIT ${limit} OFFSET ${offset}
    `)
  }

  private searchArtists(query: string, limit: number, offset: number, filters: SearchFilters) {
    return this.prisma.queryRaw<SearchResult[]>(Prisma.sql`
      SELECT a.id, a.username AS title, a.bio AS subtitle, a.avatar AS image, 'artists' AS type,
        NULL::uuid AS "artistId", NULL::uuid AS "ownerId",
        similarity(a.username, ${query}) AS rank
      FROM "Artist" a
      WHERE a."deletedAt" IS NULL AND (a.username % ${query} OR a.username ILIKE ${`%${query}%`})
        ${filters.artist ? Prisma.sql`AND a.username ILIKE ${`%${filters.artist}%`}` : Prisma.empty}
        ${
          filters.genre
            ? Prisma.sql`AND EXISTS (
          SELECT 1 FROM "ArtistGenre" ag JOIN "Genre" g ON g.id = ag."genreId"
          WHERE ag."artistId" = a.id AND (g.slug = ${filters.genre} OR g.name ILIKE ${filters.genre})
        )`
            : Prisma.empty
        }
      ORDER BY rank DESC, a."monthlyListeners" DESC, a.id ASC
      LIMIT ${limit} OFFSET ${offset}
    `)
  }

  private searchAlbums(query: string, limit: number, offset: number, filters: SearchFilters) {
    return this.prisma.queryRaw<SearchResult[]>(Prisma.sql`
      SELECT al.id, al.title, a.username AS subtitle, al.cover AS image, 'albums' AS type,
        a.id AS "artistId", NULL::uuid AS "ownerId",
        GREATEST(similarity(al.title, ${query}), similarity(a.username, ${query})) AS rank
      FROM "Album" al JOIN "Artist" a ON a.id = al."artistId"
      WHERE al."deletedAt" IS NULL AND (al.title % ${query} OR al.title ILIKE ${`%${query}%`})
        ${filters.year ? Prisma.sql`AND EXTRACT(YEAR FROM al."releaseDate") = ${filters.year}` : Prisma.empty}
        ${filters.artist ? Prisma.sql`AND a.username ILIKE ${`%${filters.artist}%`}` : Prisma.empty}
        ${
          filters.genre
            ? Prisma.sql`AND EXISTS (
          SELECT 1 FROM "AlbumGenre" ag JOIN "Genre" g ON g.id = ag."genreId"
          WHERE ag."albumId" = al.id AND (g.slug = ${filters.genre} OR g.name ILIKE ${filters.genre})
        )`
            : Prisma.empty
        }
      ORDER BY rank DESC, al."releaseDate" DESC NULLS LAST, al.id ASC
      LIMIT ${limit} OFFSET ${offset}
    `)
  }

  private searchPlaylists(query: string, limit: number, offset: number) {
    return this.prisma.queryRaw<SearchResult[]>(Prisma.sql`
      SELECT p.id, p.title, u.username AS subtitle, p.cover AS image, 'playlists' AS type,
        NULL::uuid AS "artistId", u.id AS "ownerId",
        similarity(p.title, ${query}) AS rank
      FROM "Playlist" p JOIN "User" u ON u.id = p."userId"
      WHERE p."isPublic" = true AND p."deletedAt" IS NULL
        AND (p.title % ${query} OR p.title ILIKE ${`%${query}%`})
      ORDER BY rank DESC, p."followersCount" DESC, p.id ASC
      LIMIT ${limit} OFFSET ${offset}
    `)
  }
}
