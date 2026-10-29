import { normalizePagination } from '@common/pagination'
import { readUserSettings } from '@common/user-settings'
import { NS, TTL } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { PUBLIC_ALBUM_WHERE } from '@modules/albums/album-visibility'
import { PUBLIC_ARTIST_SELECT } from '@modules/artists/artists.select'
import { PUBLIC_TRACK_SQL, PUBLIC_TRACK_WHERE } from '@modules/tracks/track-visibility'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { DISCOVERY_ERRORS } from './errors/discovery.errors'
import { PersonalTopService } from './personal-top.service'
import { toRankedPage } from './ranked-page'

export type ChartScope = 'global' | 'viral' | 'country'
/** Chart scopes a request may ask for. */
export const CHART_SCOPES: readonly ChartScope[] = ['global', 'viral', 'country']

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Listening history the feed reads to pick preferred genres; bounded so it stays index-backed. */
const PREFERRED_GENRE_WINDOW_DAYS = 90

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
      const genreId = await this.requireGenreId(slug)
      const where = {
        isPublic: true,
        deletedAt: null,
        tracks: { some: { track: { genres: { some: { genreId } } } } },
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

  async getFeed(userId?: string) {
    /* a user who turned explicit content off gets no explicit tracks; part of the cache key */
    const hideExplicit = userId
      ? !(await readUserSettings(this.prisma, userId)).explicitContent
      : false
    const key = `${userId ?? 'anonymous'}:${hideExplicit ? 'clean' : 'all'}`
    return this.cache.wrap(NS.RECOMMENDATIONS, `feed:${key}`, TTL.SHORT, async () => {
      const preferredGenreIds = userId ? await this.getPreferredGenreIds(userId) : []
      const trackWhere = {
        ...PUBLIC_TRACK_WHERE,
        ...(hideExplicit ? { explicit: false } : {}),
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
          where: PUBLIC_ALBUM_WHERE,
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

  async getCharts(
    scope: ChartScope,
    country: string | undefined,
    page = 1,
    limit = 50,
    genre?: string,
  ) {
    const pagination = normalizePagination(page, limit)
    /* resolve the genre first so an unknown slug is a 404, not an empty chart */
    const genreId = genre ? await this.requireGenreId(genre) : undefined
    const key = `history-v2:${scope}:${country ?? 'global'}:${genre ?? 'all'}:${page}:${limit}`
    return this.cache.wrap(NS.CHARTS, key, TTL.MEDIUM, async () => {
      const genreFilter = genreId
        ? Prisma.sql`AND EXISTS (SELECT 1 FROM "TrackGenre" tg WHERE tg."trackId" = t.id AND tg."genreId" = ${genreId}::uuid)`
        : Prisma.empty
      const source = this.chartSource(scope, country, genreFilter)
      const [rows, countRows] = await Promise.all([
        this.prisma.queryRaw<Array<{ id: string; plays: bigint }>>(Prisma.sql`
          SELECT h."trackId" AS id,
                 COUNT(DISTINCT (h."userId", date_trunc('hour', h."listenedAt")))::bigint AS plays
          ${source}
          GROUP BY h."trackId"
          ORDER BY plays DESC, MAX(h."listenedAt") DESC, h."trackId" ASC
          LIMIT ${pagination.limit} OFFSET ${pagination.skip}
        `),
        this.prisma.queryRaw<Array<{ total: bigint }>>(Prisma.sql`
          SELECT COUNT(DISTINCT h."trackId")::bigint AS total
          ${source}
        `),
      ])
      const tracks = await this.prisma.track.findMany({
        where: {
          id: { in: rows.map(({ id }) => id) },
          ...PUBLIC_TRACK_WHERE,
          artist: { deletedAt: null },
        },
        include: { artist: { select: { id: true, username: true, avatar: true } } },
      })
      return toRankedPage({
        rows,
        total: countRows[0]?.total,
        entities: tracks,
        pagination,
        rank: (track, { plays }) => ({ ...track, plays: Number(plays) }),
      })
    })
  }

  /** Artists ranked by distinct listeners in the chart window (one listener counts once). */
  getArtistCharts(scope: ChartScope, country: string | undefined, page = 1, limit = 50) {
    const pagination = normalizePagination(page, limit)
    const key = `artists-v1:${scope}:${country ?? 'global'}:${page}:${limit}`
    return this.cache.wrap(NS.CHARTS, key, TTL.MEDIUM, async () => {
      const source = this.chartSource(scope, country, Prisma.empty)
      const [rows, countRows] = await Promise.all([
        this.prisma.queryRaw<Array<{ id: string; listeners: bigint }>>(Prisma.sql`
          SELECT t."artistId" AS id, COUNT(DISTINCT h."userId")::bigint AS listeners
          ${source}
          GROUP BY t."artistId"
          ORDER BY listeners DESC, MAX(h."listenedAt") DESC, t."artistId" ASC
          LIMIT ${pagination.limit} OFFSET ${pagination.skip}
        `),
        this.prisma.queryRaw<Array<{ total: bigint }>>(Prisma.sql`
          SELECT COUNT(DISTINCT t."artistId")::bigint AS total
          ${source}
        `),
      ])
      const artists = await this.prisma.artist.findMany({
        where: { id: { in: rows.map(({ id }) => id) }, deletedAt: null },
        select: PUBLIC_ARTIST_SELECT,
      })
      return toRankedPage({
        rows,
        total: countRows[0]?.total,
        entities: artists,
        pagination,
        rank: (artist, { listeners }) => ({ ...artist, listeners: Number(listeners) }),
      })
    })
  }

  /** Playable listening history in the chart window, optionally narrowed to a country/genre. */
  private chartSource(scope: ChartScope, country: string | undefined, genreFilter: Prisma.Sql) {
    return Prisma.sql`
      FROM "ListeningHistory" h
      JOIN "Track" t ON t.id = h."trackId"
      JOIN "Artist" a ON a.id = t."artistId"
      WHERE h."listenedAt" >= ${this.chartRangeStart(scope)}
        AND ${PUBLIC_TRACK_SQL}
        AND a."deletedAt" IS NULL
        ${this.countryFilter(scope, country)}
        ${genreFilter}
    `
  }

  private countryFilter(scope: ChartScope, country: string | undefined) {
    return scope === 'country' && country
      ? Prisma.sql`AND LOWER(a."country") = LOWER(${country})`
      : Prisma.empty
  }

  private async requireGenreId(slug: string) {
    const genre = await this.prisma.genre.findUnique({ where: { slug }, select: { id: true } })
    if (!genre) throw new NotFoundException(DISCOVERY_ERRORS.CATEGORY_NOT_FOUND)
    return genre.id
  }

  /** The user's most-played genres over the recent listening window. */
  private async getPreferredGenreIds(userId: string) {
    const since = new Date(Date.now() - PREFERRED_GENRE_WINDOW_DAYS * MS_PER_DAY)
    const rows = await this.prisma.queryRaw<Array<{ genreId: string }>>(Prisma.sql`
      SELECT tg."genreId"
      FROM "ListeningHistory" h
      JOIN "TrackGenre" tg ON tg."trackId" = h."trackId"
      WHERE h."userId" = ${userId}::uuid
        AND h."listenedAt" >= ${since}
      GROUP BY tg."genreId" ORDER BY COUNT(*) DESC LIMIT 5
    `)
    return rows.map(({ genreId }) => genreId)
  }

  private chartRangeStart(scope: ChartScope) {
    const days = scope === 'viral' ? 7 : 28
    return new Date(Date.now() - days * MS_PER_DAY)
  }
}
