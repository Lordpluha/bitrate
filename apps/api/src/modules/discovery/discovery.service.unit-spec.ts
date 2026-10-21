import type { CacheService } from '@infra/cache/cache.service'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { PUBLIC_ARTIST_SELECT } from '@modules/artists/artists.select'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { mockDeep } from 'jest-mock-extended'
import { DiscoveryService } from './discovery.service'
import { PersonalTopService } from './personal-top.service'

describe('DiscoveryService public artist projections', () => {
  let service: DiscoveryService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    const cache = mockDeep<CacheService>()
    cache.wrap.mockImplementation((_namespace, _key, _ttl, loader) => loader())
    service = new DiscoveryService(prisma, cache, new PersonalTopService(prisma))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('allowlists public fields for related artists', async () => {
    prisma.artist.findFirst.mockResolvedValue({ genres: [{ genreId: 'genre-1' }] } as never)
    prisma.artist.findMany.mockResolvedValue([])

    await service.getRelatedArtists('artist-1')

    expect(prisma.artist.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: {
          ...PUBLIC_ARTIST_SELECT,
          genres: { include: { genre: true } },
        },
      }),
    )
    expect(PUBLIC_ARTIST_SELECT).not.toHaveProperty('password')
    expect(PUBLIC_ARTIST_SELECT).not.toHaveProperty('email')
    expect(PUBLIC_ARTIST_SELECT).not.toHaveProperty('twoFactorSecret')
    expect(PUBLIC_ARTIST_SELECT).not.toHaveProperty('failedLoginAttempts')
    expect(PUBLIC_ARTIST_SELECT).not.toHaveProperty('lockedUntil')
  })

  it.each([0, -1, 51, 1.5])('rejects an invalid related-artist limit: %s', async (limit) => {
    await expect(service.getRelatedArtists('artist-1', limit)).rejects.toThrow(
      'Limit must be between 1 and 50',
    )
    expect(prisma.artist.findFirst).not.toHaveBeenCalled()
  })

  it.each([1, 50])('accepts a bounded related-artist limit: %s', async (limit) => {
    prisma.artist.findFirst.mockResolvedValue({ genres: [] } as never)
    prisma.artist.findMany.mockResolvedValue([])

    await service.getRelatedArtists('artist-1', limit)

    expect(prisma.artist.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: limit }))
  })

  it('ranks viral charts from recent deduplicated listening history', async () => {
    const now = Date.UTC(2026, 7, 18, 12)
    jest.spyOn(Date, 'now').mockReturnValue(now)
    prisma.queryRaw
      .mockResolvedValueOnce([
        { id: 'track-2', plays: 12n },
        { id: 'track-1', plays: 8n },
      ] as never)
      .mockResolvedValueOnce([{ total: 18n }] as never)
    prisma.track.findMany.mockResolvedValue([
      { id: 'track-1', title: 'First' },
      { id: 'track-2', title: 'Second' },
    ] as never)

    const result = await service.getCharts('viral', undefined, 2, 10)

    expect(result).toMatchObject({ total: 18, page: 2, limit: 10 })
    expect(result.data).toMatchObject([
      { id: 'track-2', plays: 12 },
      { id: 'track-1', plays: 8 },
    ])
    const rankingQuery = prisma.queryRaw.mock.calls[0]?.[0] as Prisma.Sql
    const sql = rankingQuery.strings.join(' ')
    expect(sql).toContain('FROM "ListeningHistory"')
    expect(sql).toContain('COUNT(DISTINCT (h."userId", date_trunc(\'hour\', h."listenedAt")))')
    expect(sql).toContain('ORDER BY plays DESC, MAX(h."listenedAt") DESC, h."trackId" ASC')
    expect(sql).not.toContain('playCount')
    expect(sql).not.toContain('popularity')
    expect(rankingQuery.values).toContainEqual(new Date(now - 7 * 24 * 60 * 60 * 1000))
  })

  it('applies artist-country and lifecycle filters to both chart queries', async () => {
    prisma.queryRaw
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([{ total: 0n }] as never)
    prisma.track.findMany.mockResolvedValue([])

    await service.getCharts('country', 'Ukraine')

    const rawQueries = prisma.queryRaw.mock.calls.map(([query]) => query as Prisma.Sql)
    for (const query of rawQueries) {
      const sql = query.strings.join(' ')
      expect(sql).toContain('LOWER(a."country") = LOWER(')
      expect(sql).toContain('t."deletedAt" IS NULL')
      expect(sql).toContain('t."processingStatus" = \'READY\'')
      expect(sql).toContain('a."deletedAt" IS NULL')
      expect(query.values).toContain('Ukraine')
    }
  })

  it('filters the track chart to one genre and keys the cache by it', async () => {
    prisma.genre.findUnique.mockResolvedValue({ id: 'genre-1' } as never)
    prisma.queryRaw
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([{ total: 0n }] as never)
    prisma.track.findMany.mockResolvedValue([])

    await service.getCharts('global', undefined, 1, 20, 'house')

    expect(prisma.genre.findUnique).toHaveBeenCalledWith({
      where: { slug: 'house' },
      select: { id: true },
    })
    for (const [query] of prisma.queryRaw.mock.calls) {
      const sql = (query as Prisma.Sql).strings.join(' ')
      expect(sql).toContain('FROM "TrackGenre" tg')
      expect((query as Prisma.Sql).values).toContain('genre-1')
    }
  })

  it('rejects an unknown genre with NotFound', async () => {
    prisma.genre.findUnique.mockResolvedValue(null)

    await expect(service.getCharts('global', undefined, 1, 20, 'nope')).rejects.toThrow(
      'errors.discovery.category_not_found',
    )
    expect(prisma.queryRaw).not.toHaveBeenCalled()
  })

  it('ranks artists by distinct listeners in the chart window', async () => {
    const now = Date.UTC(2026, 9, 14, 12)
    jest.spyOn(Date, 'now').mockReturnValue(now)
    prisma.queryRaw
      .mockResolvedValueOnce([
        { id: 'artist-2', listeners: 9n },
        { id: 'artist-1', listeners: 4n },
      ] as never)
      .mockResolvedValueOnce([{ total: 2n }] as never)
    prisma.artist.findMany.mockResolvedValue([
      { id: 'artist-1', username: 'one' },
      { id: 'artist-2', username: 'two' },
    ] as never)

    const result = await service.getArtistCharts('global', undefined, 1, 20)

    expect(result).toMatchObject({ total: 2, page: 1, limit: 20 })
    expect(result.data).toMatchObject([
      { id: 'artist-2', listeners: 9 },
      { id: 'artist-1', listeners: 4 },
    ])
    const ranking = prisma.queryRaw.mock.calls[0]?.[0] as Prisma.Sql
    const sql = ranking.strings.join(' ')
    expect(sql).toContain('COUNT(DISTINCT h."userId")')
    expect(sql).toContain('GROUP BY t."artistId"')
    expect(sql).toContain('a."deletedAt" IS NULL')
    expect(ranking.values).toContainEqual(new Date(now - 28 * 24 * 60 * 60 * 1000))
    expect(prisma.artist.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['artist-2', 'artist-1'] }, deletedAt: null },
      select: PUBLIC_ARTIST_SELECT,
    })
  })

  describe('feed explicit content', () => {
    const stubFeedQueries = () => {
      prisma.queryRaw.mockResolvedValue([] as never)
      prisma.track.findMany.mockResolvedValue([])
      prisma.album.findMany.mockResolvedValue([])
      prisma.playlist.findMany.mockResolvedValue([])
      jest
        .spyOn(PersonalTopService.prototype, 'getTopTracks')
        .mockResolvedValue({ data: [] } as never)
    }

    it('drops explicit tracks for a user who turned explicit content off', async () => {
      stubFeedQueries()
      prisma.userSettings.findUnique.mockResolvedValue({ explicitContent: false } as never)

      await service.getFeed('user-1')

      expect(prisma.track.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ explicit: false }) }),
      )
    })

    it('reads preferred genres from a bounded listening window', async () => {
      stubFeedQueries()

      await service.getFeed('user-1')

      const genreQuery = prisma.queryRaw.mock.calls[0]?.[0] as Prisma.Sql
      expect(genreQuery.strings.join(' ')).toContain('h."listenedAt" >=')
      expect(genreQuery.values).toContainEqual(expect.any(Date))
    })

    it('keeps explicit tracks for guests', async () => {
      stubFeedQueries()

      await service.getFeed()

      const where = prisma.track.findMany.mock.calls[0]?.[0]?.where
      expect(where).not.toHaveProperty('explicit')
      expect(prisma.userSettings.findUnique).not.toHaveBeenCalled()
    })
  })
})
