import { describe, expect, it } from '@jest/globals'
import { redactPlaybackToken, serializeRequest } from './logger.config'

describe('redactPlaybackToken', () => {
  it.each([
    ['/api/v1/tracks/x/cmaf/192?t=abc.def', '/api/v1/tracks/x/cmaf/192?t=[REDACTED]'],
    [
      '/api/v1/tracks/x/cmaf/192?a=1&t=abc.def&b=2',
      '/api/v1/tracks/x/cmaf/192?a=1&t=[REDACTED]&b=2',
    ],
    ['/api/v1/tracks?title=t=1', '/api/v1/tracks?title=t=1'],
    ['/api/v1/me', '/api/v1/me'],
  ])('keeps the playback token of %s out of the log', (url, logged) => {
    expect(redactPlaybackToken(url)).toBe(logged)
  })
})

describe('serializeRequest', () => {
  it('redacts the token in both the url and the parsed query', () => {
    const logged = serializeRequest({
      method: 'GET',
      url: '/api/v1/tracks/x/cmaf/192?t=abc.def',
      query: { t: 'abc.def' },
    })

    expect(logged).toMatchObject({
      method: 'GET',
      url: '/api/v1/tracks/x/cmaf/192?t=[REDACTED]',
      query: { t: '[REDACTED]' },
    })
  })
})
