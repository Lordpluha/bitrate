import { normalizePagination } from '@common/pagination'
import { NS, TTL } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'

type ChartScope = 'global' | 'viral' | 'country'
type TimeRange = 'short' | 'medium' | 'long'

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  getCategories(page = 1, limit = 20) {
    const pagination = normalizePagination(page, limit)
    return this.cache.wrap(NS.BROWSE, `categories:${page}:${limit}`, TTL.LONG, async () => {
      const [data, total] = await this.prisma.$transaction([
        this.prisma.genre.findMany({
          orderBy: { name: 'asc' },
          skip: pagination.skip,
          take: pagination.limit,
          include: {
            _count: { select: { tracks: true, albums: true, artists: true } },
          },
        }),
        this.prisma.genre.count(),
      ])
      return { data, total, page: pagination.page, limit: pagination.limit }
    })
  }

  getCategoryPlaylists(slug: string, page = 1, limit = 20) {
    const pagination = normalizePagination(page, limit)
    return this.cache.wrap(NS.BROWSE, `category:${slug}:${page}:${limit}`, TTL.MEDIUM, async () => {
      const genre = await this.prisma.genre.findUnique({ where: { slug }, select: { id: true } })
      if (!genre) throw new NotFoundException('Browse category not found')
      const where = {
        isPublic: true,
        deletedAt: null,
        tracks: { some: { track: { genres: { some: { genreId: genre.id } } } } },
      } as const
      const [data, total] = await this.prisma.$transaction([
        this.prisma.playlist.findMany({
          where,
          orderBy: [{ followersCount: 'desc' }, { updatedAt: 'desc' }],
          skip: pagination.skip,
          take: pagination.limit,
          include: {
            user: { select: { id: true, username: true, avatar: true } },
            _count: { select: { tracks: true } },
          },
        }),
        this.prisma.playlist.count({ where }),
      ])
      return { data, total, page: pagination.page, limit: pagination.limit }
    })
  }

  getFeed(userId?: string) {
    const key = userId ?? 'anonymous'
    return this.cache.wrap(NS.RECOMMENDATIONS, `feed:${key}`, TTL.SHORT, async () => {
      const preferredGenreIds = userId ? await this.getPreferredGenreIds(userId) : []
      const trackWhere = {
        processingStatus: 'READY' as const,
        deletedAt: null,
        ...(preferredGenreIds.length > 0
          ? { genres: { some: { genreId: { in: preferredGenreIds } } } }
          : {}),
      }
      const [recommendedTracks, newReleases, popularPlaylists, onRepeat] = await Promise.all([
        this.prisma.track.findMany({
          where: trackWhere,
          orderBy: [{ popularity: 'desc' }, { playCount: 'desc' }],
          take: 20,
          include: {
            artist: { select: { id: true, username: true, avatar: true } },
            genres: { include: { genre: true } },
          },
        }),
        this.prisma.album.findMany({
          where: { deletedAt: null },
          orderBy: [{ releaseDate: 'desc' }, { createdAt: 'desc' }],
          take: 12,
          include: { artist: { select: { id: true, username: true, avatar: true } } },
        }),
        this.prisma.playlist.findMany({
          where: { isPublic: true, deletedAt: null },
          orderBy: [{ followersCount: 'desc' }, { updatedAt: 'desc' }],
          take: 12,
          include: {
            user: { select: { id: true, username: true, avatar: true } },
            _count: { select: { tracks: true } },
          },
        }),
        userId ? this.getTopTracks(userId, 'short', 1, 12) : Promise.resolve(null),
      ])

      return {
        sections: [
          { id: 'made-for-you', title: 'Made For You', items: recommendedTracks },
          { id: 'new-releases', title: 'New Releases', items: newReleases },
          { id: 'popular-playlists', title: 'Popular playlists', items: popularPlaylists },
          ...(onRepeat ? [{ id: 'on-repeat', title: 'On Repeat', items: onRepeat.data }] : []),
        ],
      }
    })
  }

  async getRelatedArtists(artistId: string, limit = 12) {
    const artist = await this.prisma.artist.findFirst({
      where: { id: artistId, deletedAt: null },
      include: { genres: { select: { genreId: true } } },
    })
    if (!artist) throw new NotFoundException('Artist not found')
    const genreIds = artist.genres.map(({ genreId }) => genreId)
    return this.prisma.artist.findMany({
      where: {
        id: { not: artistId },
        deletedAt: null,
        ...(genreIds.length ? { genres: { some: { genreId: { in: genreIds } } } } : {}),
      },
      orderBy: [{ monthlyListeners: 'desc' }, { verified: 'desc' }],
      take: Math.min(limit, 50),
      include: { genres: { include: { genre: true } } },
    })
  }

  getCharts(scope: ChartScope, country: string | undefined, page = 1, limit = 50) {
    const pagination = normalizePagination(page, limit)
    const key = `${scope}:${country ?? 'global'}:${page}:${limit}`
    return this.cache.wrap(NS.CHARTS, key, TTL.MEDIUM, async () => {
      const countryFilter =
        scope === 'country' && country
          ? { artist: { country: { equals: country, mode: 'insensitive' as const } } }
          : {}
      const where = { processingStatus: 'READY' as const, deletedAt: null, ...countryFilter }
      const orderBy =
        scope === 'viral'
          ? [{ popularity: 'desc' as const }, { createdAt: 'desc' as const }]
          : [{ playCount: 'desc' as const }, { popularity: 'desc' as const }]
      const [data, total] = await this.prisma.$transaction([
        this.prisma.track.findMany({
          where,
          orderBy,
          skip: pagination.skip,
          take: pagination.limit,
          include: { artist: { select: { id: true, username: true, avatar: true } } },
        }),
        this.prisma.track.count({ where }),
      ])
      return { data, total, page: pagination.page, limit: pagination.limit }
    })
  }

  async getTopTracks(userId: string, range: TimeRange, page = 1, limit = 20) {
    const pagination = normalizePagination(page, limit)
    const since = this.rangeStart(range)
    const rows = await this.prisma.queryRaw<Array<{ trackId: string; plays: bigint }>>(Prisma.sql`
      SELECT "trackId", COUNT(*)::bigint AS plays
      FROM "ListeningHistory"
      WHERE "userId" = ${userId}::uuid AND "listenedAt" >= ${since}
      GROUP BY "trackId" ORDER BY plays DESC
      LIMIT ${pagination.limit} OFFSET ${pagination.skip}
    `)
    const ids = rows.map(({ trackId }) => trackId)
    const tracks = await this.prisma.track.findMany({
      where: { id: { in: ids }, deletedAt: null },
      include: { artist: { select: { id: true, username: true, avatar: true } } },
    })
    const byId = new Map(tracks.map((track) => [track.id, track]))
    return {
      data: rows.flatMap(({ trackId, plays }) => {
        const track = byId.get(trackId)
        return track ? [{ ...track, plays: Number(plays) }] : []
      }),
      total: rows.length,
      page: pagination.page,
      limit: pagination.limit,
    }
  }

  async getTopArtists(userId: string, range: TimeRange, page = 1, limit = 20) {
    const pagination = normalizePagination(page, limit)
    const since = this.rangeStart(range)
    const rows = await this.prisma.queryRaw<Array<{ artistId: string; plays: bigint }>>(Prisma.sql`
      SELECT t."artistId", COUNT(*)::bigint AS plays
      FROM "ListeningHistory" h JOIN "Track" t ON t.id = h."trackId"
      WHERE h."userId" = ${userId}::uuid AND h."listenedAt" >= ${since}
      GROUP BY t."artistId" ORDER BY plays DESC
      LIMIT ${pagination.limit} OFFSET ${pagination.skip}
    `)
    const ids = rows.map(({ artistId }) => artistId)
    const artists = await this.prisma.artist.findMany({
      where: { id: { in: ids }, deletedAt: null },
    })
    const byId = new Map(artists.map((artist) => [artist.id, artist]))
    return {
      data: rows.flatMap(({ artistId, plays }) => {
        const artist = byId.get(artistId)
        return artist ? [{ ...artist, plays: Number(plays) }] : []
      }),
      total: rows.length,
      page: pagination.page,
      limit: pagination.limit,
    }
  }

  private async getPreferredGenreIds(userId: string) {
    const rows = await this.prisma.queryRaw<Array<{ genreId: string }>>(Prisma.sql`
      SELECT tg."genreId"
      FROM "ListeningHistory" h
      JOIN "TrackGenre" tg ON tg."trackId" = h."trackId"
      WHERE h."userId" = ${userId}::uuid
      GROUP BY tg."genreId" ORDER BY COUNT(*) DESC LIMIT 5
    `)
    return rows.map(({ genreId }) => genreId)
  }

  private rangeStart(range: TimeRange) {
    const days = range === 'short' ? 28 : range === 'medium' ? 180 : 3650
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  }
}
