import { describe, expect, it } from '@jest/globals'
import { resolveWebHosts } from './web.config'

describe('resolveWebHosts', () => {
  it('uses audience-specific origins when configured', () => {
    expect(
      resolveWebHosts({
        WEB_HOST: 'https://legacy.example.com',
        USER_WEB_HOST: 'https://users.example.com',
        ARTIST_WEB_HOST: 'https://artists.example.com',
      }),
    ).toEqual({
      userHost: 'https://users.example.com',
      artistHost: 'https://artists.example.com',
    })
  })

  it('falls back to WEB_HOST for existing deployments', () => {
    expect(
      resolveWebHosts({
        WEB_HOST: 'https://legacy.example.com',
        USER_WEB_HOST: undefined,
        ARTIST_WEB_HOST: undefined,
      }),
    ).toEqual({
      userHost: 'https://legacy.example.com',
      artistHost: 'https://legacy.example.com',
    })
  })
})
