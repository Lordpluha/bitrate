import { describe, expect, it } from '@jest/globals'
import { API_RATE_LIMITS, AUTH_ROUTE_THROTTLE } from './rate-limit.config'

describe('rate-limit config', () => {
  it('does not apply the auth limit as a second global throttler', () => {
    expect(API_RATE_LIMITS).toEqual([{ name: 'default', ttl: 60_000, limit: 100 }])
  })

  it('overrides the registered default throttler on auth routes', () => {
    const registeredNames = new Set(API_RATE_LIMITS.map(({ name }) => name ?? 'default'))

    expect(Object.keys(AUTH_ROUTE_THROTTLE)).toEqual(['default'])
    expect(registeredNames.has('default')).toBe(true)
    expect(AUTH_ROUTE_THROTTLE.default).toEqual({
      ttl: 60_000,
      limit: 10,
    })
  })
})
