import type { CacheService } from '@infra/cache/cache.service'
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { PUBLIC_ARTIST_SELECT } from '@modules/artists/artists.select'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { mockDeep } from 'jest-mock-extended'
import { DiscoveryService } from './discovery.service'

describe('DiscoveryService public artist projections', () => {
  let service: DiscoveryService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    const cache = mockDeep<CacheService>()
    cache.wrap.mockImplementation((_namespace, _key, _ttl, loader) => loader())
    service = new DiscoveryService(prisma, cache)
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

  it('returns the total matching ready tracks rather than the current page length', async () => {
    prisma.queryRaw
      .mockResolvedValueOnce([{ trackId: 'track-2', plays: 7n }] as never)
      .mockResolvedValueOnce([{ total: 41n }] as never)
    prisma.track.findMany.mockResolvedValue([
      { id: 'track-2', title: 'Track', artist: { id: 'artist-1' } },
    ] as never)

    const result = await service.getTopTracks('user-1', 'medium', 3, 20)

    expect(result).toMatchObject({ total: 41, page: 3, limit: 20 })
    expect(result.data).toHaveLength(1)
    const rawSql = prisma.queryRaw.mock.calls
      .map(([query]) => (query as Prisma.Sql).strings.join(' '))
      .join(' ')
    expect(rawSql).toContain('t."deletedAt" IS NULL')
    expect(rawSql).toContain('t."processingStatus" = \'READY\'')
  })

  it('counts only playable tracks belonging to non-deleted artists', async () => {
    prisma.queryRaw
      .mockResolvedValueOnce([{ artistId: 'artist-1', plays: 9n }] as never)
      .mockResolvedValueOnce([{ total: 27n }] as never)
    prisma.artist.findMany.mockResolvedValue([{ id: 'artist-1', username: 'Artist' }] as never)

    const result = await service.getTopArtists('user-1', 'long', 2, 10)

    expect(result).toMatchObject({ total: 27, page: 2, limit: 10 })
    const rawSql = prisma.queryRaw.mock.calls
      .map(([query]) => (query as Prisma.Sql).strings.join(' '))
      .join(' ')
    expect(rawSql).toContain('a."deletedAt" IS NULL')
    expect(rawSql).toContain('t."processingStatus" = \'READY\'')
  })

  it('ranks viral charts from recent deduplicated listening history', async () => {
    const now = Date.UTC(2026, 7, 18, 12)
    jest.spyOn(Date, 'now').mockReturnValue(now)
    prisma.queryRaw
      .mockResolvedValueOnce([
        { trackId: 'track-2', plays: 12n },
        { trackId: 'track-1', plays: 8n },
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
})
