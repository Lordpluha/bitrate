import { describe, expect, it } from '@jest/globals'
import { UnauthorizedException } from '@nestjs/common'
import { readAccessToken, readRefreshToken } from './auth-http'

const requestWith = (fields: Record<string, unknown>): object => fields

describe('session token readers', () => {
  it('reads the tokens the session guard stored under their cookie names', () => {
    const request = requestWith({ user_access_token: 'at', user_refresh_token: 'rt' })

    expect(readAccessToken(request, 'user')).toBe('at')
    expect(readRefreshToken(request, 'user')).toBe('rt')
  })

  /** Each audience reads only its own session, never another one the browser also carries. */
  it("ignores another audience's tokens", () => {
    const request = requestWith({ artist_access_token: 'artist-at' })

    expect(() => readAccessToken(request, 'user')).toThrow(UnauthorizedException)
    expect(readAccessToken(request, 'artist')).toBe('artist-at')
  })

  /** A route that acts on "the current session" must never run with no session token: an empty
   * hash would match no session and, for "revoke the others", would end every session. */
  it.each([
    ['missing', {}],
    ['empty', { user_access_token: '' }],
    ['not a string', { user_access_token: ['at'] }],
  ])('fails closed when the access token is %s', (_label, fields) => {
    expect(() => readAccessToken(requestWith(fields), 'user')).toThrow(UnauthorizedException)
  })
})
