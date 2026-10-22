import { beforeEach, describe, expect, it } from '@jest/globals'
import { UnauthorizedException } from '@nestjs/common'
import { readAccessToken, readRefreshToken } from './auth-http'

const requestWith = (fields: Record<string, unknown>): object => fields

describe('session token readers', () => {
  beforeEach(() => {
    process.env.ACCESS_TOKEN_NAME = 'access_token'
    process.env.REFRESH_TOKEN_NAME = 'refresh_token'
  })

  it('reads the tokens the session guard stored under their cookie names', () => {
    const request = requestWith({ access_token: 'at', refresh_token: 'rt' })

    expect(readAccessToken(request)).toBe('at')
    expect(readRefreshToken(request)).toBe('rt')
  })

  /** A route that acts on "the current session" must never run with no session token: an empty
   * hash would match no session and, for "revoke the others", would end every session. */
  it.each([
    ['missing', {}],
    ['empty', { access_token: '' }],
    ['not a string', { access_token: ['at'] }],
  ])('fails closed when the access token is %s', (_label, fields) => {
    expect(() => readAccessToken(requestWith(fields))).toThrow(UnauthorizedException)
  })
})
