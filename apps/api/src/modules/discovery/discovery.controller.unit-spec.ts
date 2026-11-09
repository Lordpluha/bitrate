import { beforeEach, describe, expect, it } from '@jest/globals'
import { buildUser } from '@modules/users/__tests__/fixtures/users.fixtures'
import { BadRequestException } from '@nestjs/common'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { DiscoveryController } from './discovery.controller'
import type { DiscoveryService } from './discovery.service'
import type { PersonalTopService } from './personal-top.service'
import type { PlatformStatsService } from './platform-stats.service'

describe('DiscoveryController', () => {
  let controller: DiscoveryController
  let discovery: DeepMockProxy<DiscoveryService>
  let personalTop: DeepMockProxy<PersonalTopService>
  let platformStats: DeepMockProxy<PlatformStatsService>

  beforeEach(() => {
    discovery = mockDeep<DiscoveryService>()
    personalTop = mockDeep<PersonalTopService>()
    mockReset(discovery)
    platformStats = mockDeep<PlatformStatsService>()
    mockReset(personalTop)
    controller = new DiscoveryController(discovery, personalTop, platformStats)
  })

  describe('stats', () => {
    it('answers with the public platform totals', async () => {
      platformStats.getStats.mockResolvedValue({ artists: 3, listeners: 20, tracks: 140 })

      await expect(controller.stats()).resolves.toEqual({ artists: 3, listeners: 20, tracks: 140 })
    })
  })

  describe('charts', () => {
    it('rejects a scope outside the known allowlist', () => {
      expect(() => controller.charts('not-a-real-scope')).toThrow(BadRequestException)
      expect(discovery.getCharts).not.toHaveBeenCalled()
    })

    it('rejects the country scope when no country is given', () => {
      expect(() => controller.charts('country')).toThrow(BadRequestException)
      expect(discovery.getCharts).not.toHaveBeenCalled()
    })

    it('accepts the country scope once a country is given', async () => {
      discovery.getCharts.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never)

      await controller.charts('country', 'us')

      expect(discovery.getCharts).toHaveBeenCalledWith(
        'country',
        'us',
        undefined,
        undefined,
        undefined,
      )
    })

    it('passes a genre filter through to the track chart', async () => {
      discovery.getCharts.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never)

      await controller.charts('global', undefined, 1, 20, 'house')

      expect(discovery.getCharts).toHaveBeenCalledWith('global', undefined, 1, 20, 'house')
    })
  })

  describe('artist charts', () => {
    it('rejects a scope outside the known allowlist', () => {
      expect(() => controller.artistCharts('nope')).toThrow(BadRequestException)
      expect(discovery.getArtistCharts).not.toHaveBeenCalled()
    })

    it('rejects the country scope when no country is given', () => {
      expect(() => controller.artistCharts('country')).toThrow(BadRequestException)
    })

    it('ranks artists for a valid scope', async () => {
      discovery.getArtistCharts.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      } as never)

      await controller.artistCharts('viral', undefined, 2, 10)

      expect(discovery.getArtistCharts).toHaveBeenCalledWith('viral', undefined, 2, 10)
    })
  })

  describe('feed', () => {
    it('reads an anonymous feed with no user id when the session is optional and absent', async () => {
      discovery.getFeed.mockResolvedValue([] as never)

      await controller.feed(undefined)

      expect(discovery.getFeed).toHaveBeenCalledWith(undefined)
    })
  })

  describe('personal top', () => {
    const user = buildUser({ id: 'user-1' })

    it('rejects a time range outside short/medium/long', () => {
      expect(() => controller.topTracks(user, 'decade')).toThrow(BadRequestException)
      expect(personalTop.getTopTracks).not.toHaveBeenCalled()
    })

    it('forwards a valid range to the personal-top service', async () => {
      personalTop.getTopArtists.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      } as never)

      await controller.topArtists(user, 'long')

      expect(personalTop.getTopArtists).toHaveBeenCalledWith('user-1', 'long', undefined, undefined)
    })
  })
})
