import type { CacheService } from '@infra/cache/cache.service'
import { beforeEach, describe, expect, it } from '@jest/globals'
import type { Prisma } from '@prisma/client'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { mockDeep } from 'jest-mock-extended'
import { SearchService } from './search.service'

describe('SearchService', () => {
  let service: SearchService
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    const cache = mockDeep<CacheService>()
    cache.wrap.mockImplementation((_namespace, _key, _ttl, loader) => loader())
    service = new SearchService(prisma, cache)
  })

  it('returns a response matching SearchResponseEntity: grouped data, per-type totals, pagination', async () => {
    prisma.queryRaw.mockResolvedValue([])

    const result = await service.search('bitrate', { types: ['tracks', 'artists'] })

    expect(result).toEqual(
      expect.objectContaining({
        data: { tracks: [], artists: [] },
        totals: { tracks: 0, artists: 0 },
        total: 0,
        page: 1,
        limit: 10,
        limitPerType: 10,
        topResult: null,
      }),
    )
  })

  it('picks the highest-ranked result across buckets as topResult', async () => {
    const trackResult = {
      id: 't1',
      title: 'Track',
      subtitle: null,
      image: null,
      type: 'tracks',
      rank: 0.2,
      artistId: 'a1',
      ownerId: null,
    }
    const artistResult = {
      id: 'ar1',
      title: 'Artist',
      subtitle: null,
      image: null,
      type: 'artists',
      rank: 0.9,
      artistId: null,
      ownerId: null,
    }
    prisma.queryRaw
      .mockResolvedValueOnce([trackResult])
      .mockResolvedValueOnce([artistResult])
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([{ count: 1 }])

    const result = await service.search('bitrate', { types: ['tracks', 'artists'] })

    expect(result.topResult).toEqual(artistResult)
  })

  it('hides explicit tracks for a signed-in user who turned explicit content off', async () => {
    prisma.queryRaw.mockResolvedValue([])
    prisma.userSettings.findUnique.mockResolvedValue({ explicitContent: false } as never)
    prisma.searchHistory.findFirst.mockResolvedValue(null)

    await service.search('night', { types: ['tracks'], userId: 'user-1' })

    expect(prisma.queryRaw.mock.calls.length).toBeGreaterThan(0)
    for (const [query] of prisma.queryRaw.mock.calls) {
      expect((query as Prisma.Sql).strings.join(' ')).toContain('t.explicit = false')
    }
  })

  it('keeps explicit tracks for guests and for users who allow them', async () => {
    prisma.queryRaw.mockResolvedValue([])
    prisma.userSettings.findUnique.mockResolvedValue({ explicitContent: true } as never)
    prisma.searchHistory.findFirst.mockResolvedValue(null)

    await service.search('night', { types: ['tracks'] })
    await service.search('night', { types: ['tracks'], userId: 'user-1' })

    for (const [query] of prisma.queryRaw.mock.calls) {
      expect((query as Prisma.Sql).strings.join(' ')).not.toContain('t.explicit = false')
    }
  })
})
