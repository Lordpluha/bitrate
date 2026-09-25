import { beforeEach, describe, expect, it } from '@jest/globals'
import type { OptionalUserAuthRequest, UserAuthRequest } from '@modules/users-auth/types'
import { BadRequestException } from '@nestjs/common'
import { type DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import { DiscoveryController } from './discovery.controller'
import type { DiscoveryService } from './discovery.service'
import type { PersonalTopService } from './personal-top.service'

describe('DiscoveryController', () => {
  let controller: DiscoveryController
  let discovery: DeepMockProxy<DiscoveryService>
  let personalTop: DeepMockProxy<PersonalTopService>

  beforeEach(() => {
    discovery = mockDeep<DiscoveryService>()
    personalTop = mockDeep<PersonalTopService>()
    mockReset(discovery)
    mockReset(personalTop)
    controller = new DiscoveryController(discovery, personalTop)
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

    it('accepts the country scope once a country is given', () => {
      discovery.getCharts.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 } as never)

      controller.charts('country', 'us')

      expect(discovery.getCharts).toHaveBeenCalledWith('country', 'us', undefined, undefined)
    })
  })

  describe('feed', () => {
    it('reads an anonymous feed with no user id when the session is optional and absent', () => {
      discovery.getFeed.mockResolvedValue([] as never)

      controller.feed({} as OptionalUserAuthRequest)

      expect(discovery.getFeed).toHaveBeenCalledWith(undefined)
    })
  })

  describe('personal top', () => {
    const authedRequest = { user: { id: 'user-1' } } as UserAuthRequest

    it('rejects a time range outside short/medium/long', () => {
      expect(() => controller.topTracks(authedRequest, 'decade')).toThrow(BadRequestException)
      expect(personalTop.getTopTracks).not.toHaveBeenCalled()
    })

    it('forwards a valid range to the personal-top service', () => {
      personalTop.getTopArtists.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      } as never)

      controller.topArtists(authedRequest, 'long')

      expect(personalTop.getTopArtists).toHaveBeenCalledWith('user-1', 'long', undefined, undefined)
    })
  })
})
