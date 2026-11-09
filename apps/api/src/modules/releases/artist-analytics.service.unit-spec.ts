import type { PrismaService } from '@infra/prisma/prisma.service'
import { describe, expect, it } from '@jest/globals'
import { mockDeep } from 'jest-mock-extended'
import { ArtistAnalyticsService } from './artist-analytics.service'

describe('Artist top tracks pagination', () => {
  const row = (id: string, plays: bigint) => ({
    id,
    title: id,
    cover: null,
    plays,
    listeners: 1n,
    maxPlays: 100n,
    total: 12n,
  })

  it('reads a page, its total and the global leader in one history scan', async () => {
    const prisma = mockDeep<PrismaService>()
    prisma.queryRaw.mockResolvedValueOnce([row('track-6', 5n), row('track-7', 4n)])
    const result = await new ArtistAnalyticsService(prisma).topTracks('artist-1', {
      days: 28,
      page: 2,
    })
    expect(result).toMatchObject({ page: 2, limit: 5, total: 12, maxPlays: 100, days: 28 })
    expect(result.data.map((track) => track.trackId)).toEqual(['track-6', 'track-7'])
    expect(prisma.queryRaw).toHaveBeenCalledTimes(1)
  })

  it('clamps a page past the end to the last one', async () => {
    const prisma = mockDeep<PrismaService>()
    prisma.queryRaw
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ total: 12n }])
      .mockResolvedValueOnce([row('track-11', 2n), row('track-12', 1n)])
    const result = await new ArtistAnalyticsService(prisma).topTracks('artist-1', {
      days: 28,
      page: 999,
    })
    expect(result).toMatchObject({ page: 3, limit: 5, total: 12, maxPlays: 100, days: 28 })
    expect(result.data.map((track) => track.trackId)).toEqual(['track-11', 'track-12'])
    const query = prisma.queryRaw.mock.calls[2]?.[0]
    if (!(query && 'sql' in query)) throw new Error('Expected a parameterized SQL query')
    expect(query.values.slice(-2)).toEqual([5, 10])
  })

  it('returns an empty first page when the period has no plays', async () => {
    const prisma = mockDeep<PrismaService>()
    prisma.queryRaw.mockResolvedValueOnce([]).mockResolvedValueOnce([{ total: 0n }])
    await expect(
      new ArtistAnalyticsService(prisma).topTracks('artist-1', { days: 7, page: 9 }),
    ).resolves.toEqual({ data: [], total: 0, page: 1, limit: 5, days: 7, maxPlays: 0 })
    expect(prisma.queryRaw).toHaveBeenCalledTimes(2)
  })

  it('does not count again when the first page is already empty', async () => {
    const prisma = mockDeep<PrismaService>()
    prisma.queryRaw.mockResolvedValueOnce([])
    await expect(
      new ArtistAnalyticsService(prisma).topTracks('artist-1', { days: 7, page: 1 }),
    ).resolves.toEqual({ data: [], total: 0, page: 1, limit: 5, days: 7, maxPlays: 0 })
    expect(prisma.queryRaw).toHaveBeenCalledTimes(1)
  })
})
