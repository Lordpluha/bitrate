import { API_RATE_LIMITS, AUTH_ROUTE_THROTTLE } from '@common/config/rate-limit.config'
import { describe, expect, it } from '@jest/globals'
import { AuthController } from './artists-auth.controller'

const LIMIT_KEY = 'THROTTLER:LIMITdefault'

describe('artist auth throttling', () => {
  it('keeps the credential limit on the controller', () => {
    expect(Reflect.getMetadata(LIMIT_KEY, AuthController)).toBe(AUTH_ROUTE_THROTTLE.default.limit)
  })

  // The dashboard SSR checks the session from one server IP on every navigation and preload.
  it.each(['getMe', 'refresh'] as const)('gives %s the global session limit', (handler) => {
    expect(Reflect.getMetadata(LIMIT_KEY, AuthController.prototype[handler])).toBe(
      API_RATE_LIMITS.at(0)?.limit,
    )
  })
})
