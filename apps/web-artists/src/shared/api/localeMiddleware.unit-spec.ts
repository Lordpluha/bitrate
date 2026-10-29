import type { ApiPaths } from '@bitrate/contracts'
import createClient from 'openapi-fetch'
import { describe, expect, it, vi } from 'vitest'
import { createLocaleMiddleware } from './localeMiddleware'

describe('createLocaleMiddleware', () => {
  it('asks the API to answer in the workspace language', async () => {
    const fetch = vi.fn(async (_request: Request) => Response.json({}))
    const client = createClient<ApiPaths>({ baseUrl: 'http://api.test', fetch })
    let locale = 'uk'
    client.use(createLocaleMiddleware(() => locale))

    await client.GET('/api/v1/artist-music/counts')
    locale = 'pl'
    await client.GET('/api/v1/artist-music/counts')

    expect(fetch.mock.calls[0]?.[0].headers.get('Accept-Language')).toBe('uk')
    expect(fetch.mock.calls[1]?.[0].headers.get('Accept-Language')).toBe('pl')
  })
})
