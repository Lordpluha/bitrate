import { API_RATE_LIMITS, AUTH_ROUTE_THROTTLE } from '@common/config/rate-limit.config'
import { describe, expect, it } from '@jest/globals'
import { UsersAuthController } from './users-auth.controller'

const LIMIT_KEY = 'THROTTLER:LIMITdefault'

describe('user auth throttling', () => {
  it('keeps the credential limit on the controller', () => {
    expect(Reflect.getMetadata(LIMIT_KEY, UsersAuthController)).toBe(
      AUTH_ROUTE_THROTTLE.default.limit,
    )
  })

  // The web player SSR checks the session from one server IP on every navigation.
  it.each(['getMe', 'refresh'] as const)('gives %s the global session limit', (handler) => {
    expect(Reflect.getMetadata(LIMIT_KEY, UsersAuthController.prototype[handler])).toBe(
      API_RATE_LIMITS.at(0)?.limit,
    )
  })
})
