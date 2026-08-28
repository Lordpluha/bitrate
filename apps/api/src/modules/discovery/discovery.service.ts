import { normalizePagination } from '@common/pagination'
import { NS, TTL } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { PUBLIC_ARTIST_SELECT } from '@modules/artists/artists.select'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PersonalTopService } from './personal-top.service'

type ChartScope = 'global' | 'viral' | 'country'

@Injectable()
export class DiscoveryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly personalTop: PersonalTopService,
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
        userId ? this.personalTop.getTopTracks(userId, 'short', 1, 12) : Promise.resolve(null),
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
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new BadRequestException('Limit must be between 1 and 50')
    }
    const artist = await this.prisma.artist.findFirst({
      where: { id: artistId, deletedAt: null },
      select: { genres: { select: { genreId: true } } },
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
      take: limit,
      select: {
        ...PUBLIC_ARTIST_SELECT,
        genres: { include: { genre: true } },
      },
    })
  }

  getCharts(scope: ChartScope, country: string | undefined, page = 1, limit = 50) {
    const pagination = normalizePagination(page, limit)
    const key = `history-v1:${scope}:${country ?? 'global'}:${page}:${limit}`
    return this.cache.wrap(NS.CHARTS, key, TTL.MEDIUM, async () => {
      const since = this.chartRangeStart(scope)
      const countryFilter =
        scope === 'country' && country
          ? Prisma.sql`AND LOWER(a."country") = LOWER(${country})`
          : Prisma.empty
      const [rows, countRows] = await Promise.all([
        this.prisma.queryRaw<Array<{ trackId: string; plays: bigint }>>(Prisma.sql`
          SELECT h."trackId",
                 COUNT(DISTINCT (h."userId", date_trunc('hour', h."listenedAt")))::bigint AS plays
          FROM "ListeningHistory" h
          JOIN "Track" t ON t.id = h."trackId"
          JOIN "Artist" a ON a.id = t."artistId"
          WHERE h."listenedAt" >= ${since}
            AND t."deletedAt" IS NULL
            AND t."processingStatus" = 'READY'
            AND a."deletedAt" IS NULL
            ${countryFilter}
          GROUP BY h."trackId"
          ORDER BY plays DESC, MAX(h."listenedAt") DESC, h."trackId" ASC
          LIMIT ${pagination.limit} OFFSET ${pagination.skip}
        `),
        this.prisma.queryRaw<Array<{ total: bigint }>>(Prisma.sql`
          SELECT COUNT(*)::bigint AS total
          FROM (
            SELECT h."trackId"
            FROM "ListeningHistory" h
            JOIN "Track" t ON t.id = h."trackId"
            JOIN "Artist" a ON a.id = t."artistId"
            WHERE h."listenedAt" >= ${since}
              AND t."deletedAt" IS NULL
              AND t."processingStatus" = 'READY'
              AND a."deletedAt" IS NULL
              ${countryFilter}
            GROUP BY h."trackId"
          ) ranked_tracks
        `),
      ])
      const ids = rows.map(({ trackId }) => trackId)
      const tracks = await this.prisma.track.findMany({
        where: {
          id: { in: ids },
          deletedAt: null,
          processingStatus: 'READY',
          artist: { deletedAt: null },
        },
        include: { artist: { select: { id: true, username: true, avatar: true } } },
      })
      const byId = new Map(tracks.map((track) => [track.id, track]))
      return {
        data: rows.flatMap(({ trackId, plays }) => {
          const track = byId.get(trackId)
          return track ? [{ ...track, plays: Number(plays) }] : []
        }),
        total: Number(countRows[0]?.total ?? 0n),
        page: pagination.page,
        limit: pagination.limit,
      }
    })
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

  private chartRangeStart(scope: ChartScope) {
    const days = scope === 'viral' ? 7 : 28
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  }
}
