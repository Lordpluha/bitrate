import { describe, expect, it } from '@jest/globals'
import { resolveWebHosts } from './web.config'

describe('resolveWebHosts', () => {
  it('uses audience-specific origins when configured', () => {
    expect(
      resolveWebHosts({
        WEB_HOST: 'https://legacy.example.com',
        USER_WEB_HOST: 'https://users.example.com',
        ARTIST_WEB_HOST: 'https://artists.example.com',
        ADMIN_WEB_HOST: 'https://admin.example.com',
      }),
    ).toEqual({
      userHost: 'https://users.example.com',
      artistHost: 'https://artists.example.com',
      adminHost: 'https://admin.example.com',
    })
  })

  it('falls back to WEB_HOST for existing deployments', () => {
    expect(
      resolveWebHosts({
        WEB_HOST: 'https://legacy.example.com',
        USER_WEB_HOST: undefined,
        ARTIST_WEB_HOST: undefined,
        ADMIN_WEB_HOST: undefined,
      }),
    ).toEqual({
      userHost: 'https://legacy.example.com',
      artistHost: 'https://legacy.example.com',
      adminHost: undefined,
    })
  })

  it('never falls back to WEB_HOST for the admin origin', () => {
    // Admin is a new, distinct audience -- WEB_HOST historically names the user-facing
    // web player, and silently accepting it as an admin origin would let the wrong
    // frontend pass CORS instead of failing loudly on a missing ADMIN_WEB_HOST.
    expect(
      resolveWebHosts({
        WEB_HOST: 'https://legacy.example.com',
        ADMIN_WEB_HOST: undefined,
      }).adminHost,
    ).toBeUndefined()
  })
})
