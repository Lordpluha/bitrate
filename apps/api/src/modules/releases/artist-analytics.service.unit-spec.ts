import type { PrismaService } from '@infra/prisma/prisma.service'
import { describe, expect, it } from '@jest/globals'
import { mockDeep } from 'jest-mock-extended'
import { ArtistAnalyticsService } from './artist-analytics.service'

describe('Artist top tracks pagination', () => {
  it('clamps the requested page and keeps the global leader for the bar scale', async () => {
    const prisma = mockDeep<PrismaService>()
    prisma.queryRaw.mockResolvedValueOnce([{ total: 12n }]).mockResolvedValueOnce([
      { id: 'track-11', title: 'Eleventh', cover: null, plays: 2n, listeners: 1n, maxPlays: 100n },
      { id: 'track-12', title: 'Twelfth', cover: null, plays: 1n, listeners: 1n, maxPlays: 100n },
    ])
    const result = await new ArtistAnalyticsService(prisma).topTracks('artist-1', {
      days: 28,
      page: 999,
    })
    expect(result).toMatchObject({ page: 3, limit: 5, total: 12, maxPlays: 100, days: 28 })
    expect(result.data.map((track) => track.trackId)).toEqual(['track-11', 'track-12'])
    const query = prisma.queryRaw.mock.calls[1]?.[0]
    if (!(query && 'sql' in query)) throw new Error('Expected a parameterized SQL query')
    expect(query.values.slice(-2)).toEqual([5, 10])
  })

  it('returns an empty first page without querying rows when the period has no plays', async () => {
    const prisma = mockDeep<PrismaService>()
    prisma.queryRaw.mockResolvedValueOnce([{ total: 0n }])
    await expect(
      new ArtistAnalyticsService(prisma).topTracks('artist-1', { days: 7, page: 9 }),
    ).resolves.toEqual({ data: [], total: 0, page: 1, limit: 5, days: 7, maxPlays: 0 })
    expect(prisma.queryRaw).toHaveBeenCalledTimes(1)
  })
})
