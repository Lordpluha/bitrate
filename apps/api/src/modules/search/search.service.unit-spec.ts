import type { CacheService } from '@infra/cache/cache.service'
import { beforeEach, describe, expect, it } from '@jest/globals'
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
})
