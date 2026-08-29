import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { API_RATE_LIMITS, AUTH_ROUTE_THROTTLE } from './rate-limit.config'

type RateLimitEnv = Record<string, string | undefined>

const OVERRIDE_KEYS = ['API_RATE_LIMIT_MAX', 'API_RATE_LIMIT_WINDOW_MS']

/** Re-imports the config with a fresh module registry so env overrides are re-read. */
async function loadConfigWithEnv(env: RateLimitEnv) {
  for (const key of OVERRIDE_KEYS) delete process.env[key]
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) process.env[key] = value
  }
  jest.resetModules()

  return await import('./rate-limit.config')
}

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

describe('rate-limit config env overrides', () => {
  afterEach(() => {
    for (const key of OVERRIDE_KEYS) delete process.env[key]
    jest.resetModules()
  })

  it('lifts the global ceiling when API_RATE_LIMIT_MAX is set', async () => {
    const config = await loadConfigWithEnv({ API_RATE_LIMIT_MAX: '250000' })

    expect(config.API_RATE_LIMITS).toEqual([{ name: 'default', ttl: 60_000, limit: 250_000 }])
  })

  it('widens the global window when API_RATE_LIMIT_WINDOW_MS is set', async () => {
    const config = await loadConfigWithEnv({ API_RATE_LIMIT_WINDOW_MS: '120000' })

    expect(config.API_RATE_LIMITS).toEqual([{ name: 'default', ttl: 120_000, limit: 100 }])
  })

  it.each([
    '',
    '0',
    '-5',
    'abc',
    'Infinity',
  ])('keeps the default ceiling for the invalid override %p', async (raw) => {
    const config = await loadConfigWithEnv({ API_RATE_LIMIT_MAX: raw })

    expect(config.API_RATE_LIMITS).toEqual([{ name: 'default', ttl: 60_000, limit: 100 }])
  })

  it('never loosens the auth-route throttle through the env override', async () => {
    const config = await loadConfigWithEnv({
      API_RATE_LIMIT_MAX: '250000',
      API_RATE_LIMIT_WINDOW_MS: '120000',
    })

    expect(config.AUTH_ROUTE_THROTTLE.default).toEqual({ ttl: 60_000, limit: 10 })
  })
})
