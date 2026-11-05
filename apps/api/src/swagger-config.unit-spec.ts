import { describe, expect, it } from '@jest/globals'
import { buildSwaggerConfig } from './swagger-config'

const servers = { local: 'http://localhost:3000', deployed: 'https://api.example' }

const schemesOf = (surface: Parameters<typeof buildSwaggerConfig>[0]) =>
  Object.keys(buildSwaggerConfig(surface, servers).components?.securitySchemes ?? {}).sort()

describe('buildSwaggerConfig (#458)', () => {
  it('documents the listener and artist sessions and Google sign-in on the public API', () => {
    expect(schemesOf('public')).toEqual([
      'artist_access_token',
      'artist_refresh_token',
      'oauth2',
      'user_access_token',
      'user_refresh_token',
    ])
  })

  it('documents only the staff session on the operator API', () => {
    expect(schemesOf('admin')).toEqual(['staff_access_token', 'staff_refresh_token'])
  })

  it('names the operator document apart from the public one', () => {
    const publicTitle = buildSwaggerConfig('public', servers).info.title
    const adminTitle = buildSwaggerConfig('admin', servers).info.title

    expect(adminTitle).not.toEqual(publicTitle)
  })

  it('lists the given local and deployed servers', () => {
    expect(buildSwaggerConfig('admin', servers).servers?.map(({ url }) => url)).toEqual([
      'http://localhost:3000',
      'https://api.example',
    ])
  })
})
