import { NS, TTL } from '@infra/cache/cache.constants'
import type { CacheService } from '@infra/cache/cache.service'
import { beforeEach, describe, expect, it } from '@jest/globals'
import { PUBLIC_TRACK_WHERE } from '@modules/tracks/orm'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { mockDeep } from 'jest-mock-extended'
import { PlatformStatsService } from './platform-stats.service'

describe('PlatformStatsService', () => {
  let prisma: PrismaMock
  let cache: ReturnType<typeof mockDeep<CacheService>>
  let service: PlatformStatsService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    cache = mockDeep<CacheService>()
    cache.wrap.mockImplementation((_namespace, _key, _ttl, loader) => loader())
    service = new PlatformStatsService(prisma, cache)
  })

  it('counts live artists, live listeners and tracks listeners can play', async () => {
    prisma.artist.count.mockResolvedValue(12)
    prisma.user.count.mockResolvedValue(340)
    prisma.track.count.mockResolvedValue(5600)

    await expect(service.getStats()).resolves.toEqual({
      artists: 12,
      listeners: 340,
      tracks: 5600,
    })
    expect(prisma.artist.count).toHaveBeenCalledWith({ where: { deletedAt: null } })
    expect(prisma.user.count).toHaveBeenCalledWith({ where: { deletedAt: null } })
    expect(prisma.track.count).toHaveBeenCalledWith({ where: PUBLIC_TRACK_WHERE })
  })

  it('serves the counts from the cache for a few minutes', async () => {
    cache.wrap.mockResolvedValue({ artists: 1, listeners: 2, tracks: 3 })

    await expect(service.getStats()).resolves.toEqual({ artists: 1, listeners: 2, tracks: 3 })
    expect(cache.wrap).toHaveBeenCalledWith(
      NS.BROWSE,
      'platform-stats',
      TTL.LONG,
      expect.any(Function),
    )
    expect(prisma.user.count).not.toHaveBeenCalled()
  })
})
