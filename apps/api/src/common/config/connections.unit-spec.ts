import { describe, expect, it } from '@jest/globals'
import { allowedOrigins } from './connections'

const env = {
  USER_WEB_HOST: 'https://bitrate.example',
  ARTIST_WEB_HOST: 'https://artists.bitrate.example',
  ADMIN_WEB_HOST: 'https://admin.bitrate.example',
}

const configured = (origins: ReturnType<typeof allowedOrigins>) =>
  origins.filter((origin): origin is string => typeof origin === 'string')

const allows = (origins: ReturnType<typeof allowedOrigins>, origin: string) =>
  origins.some((allowed) =>
    typeof allowed === 'string' ? allowed === origin : allowed.test(origin),
  )

describe('allowedOrigins (#458)', () => {
  it('lets the player and the artists portal call the public API, not the operator panel', () => {
    expect(configured(allowedOrigins('public', env))).toEqual([
      'https://bitrate.example',
      'https://artists.bitrate.example',
    ])
  })

  it('lets only the operator panel call the operator API', () => {
    expect(configured(allowedOrigins('admin', env))).toEqual(['https://admin.bitrate.example'])
  })

  it('has no configured origin for the operator API while ADMIN_WEB_HOST is unset', () => {
    expect(configured(allowedOrigins('admin', { WEB_HOST: 'https://bitrate.example' }))).toEqual([])
  })

  it('keeps accepting any localhost port in development on both surfaces', () => {
    expect(allows(allowedOrigins('public', env), 'http://localhost:3001')).toBe(true)
    expect(allows(allowedOrigins('admin', env), 'http://localhost:3005')).toBe(true)
  })
})
