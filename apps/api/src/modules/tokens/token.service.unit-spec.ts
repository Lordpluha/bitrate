import type { AppConfig } from '@common/config'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { ConfigService } from '@nestjs/config'
import type { JwtService } from '@nestjs/jwt'
import type { Response } from 'express'
import { TokenService } from './token.service'

describe('TokenService', () => {
  let service: TokenService
  let jwtService: jest.Mocked<JwtService>
  let configService: jest.Mocked<ConfigService<AppConfig>>

  const configMap = new Map<string, unknown>([
    ['JWT_ACCESS_EXPIRES_IN', '5m'],
    ['JWT_REFRESH_EXPIRES_IN', '30d'],
    ['JWT_SECRET', 'super-secret'],
    ['cookie', { httpOnly: true, sameSite: 'lax', secure: false, path: '/' }],
  ])

  beforeEach(() => {
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>

    configService = {
      getOrThrow: jest.fn((key: string) => configMap.get(key)) as never,
    } as unknown as jest.Mocked<ConfigService<AppConfig>>

    service = new TokenService(jwtService, configService)
  })

  it('generateAccessToken should sign with access expiry', async () => {
    jwtService.signAsync.mockResolvedValue('access-token')

    const result = await service.generateAccessToken('user-1', 'alice', 'user')

    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { username: 'alice', type: 'user' },
      {
        subject: 'user-1',
        expiresIn: '5m',
        secret: 'super-secret',
      },
    )
    expect(result).toBe('access-token')
  })

  it('generateRefreshToken should sign with refresh expiry', async () => {
    jwtService.signAsync.mockResolvedValue('refresh-token')

    const result = await service.generateRefreshToken('user-1', 'alice', 'user')

    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { username: 'alice', type: 'user' },
      {
        subject: 'user-1',
        expiresIn: '30d',
        secret: 'super-secret',
      },
    )
    expect(result).toBe('refresh-token')
  })

  it('verifyToken should verify with secret', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1', username: 'alice' })

    const result = await service.verifyToken('token')

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('token', {
      secret: 'super-secret',
    })
    expect(result).toEqual({ sub: 'user-1', username: 'alice' })
  })

  const createResponse = () =>
    ({ cookie: jest.fn(), clearCookie: jest.fn() }) as unknown as jest.Mocked<Response>

  /** Names a response wrote (`cookie`) or dropped (`clearCookie`), in call order. */
  const namesOf = (mock: jest.Mock) => mock.mock.calls.map(([name]) => name)

  it('setAuthCookies should set the access and refresh cookies of the audience', () => {
    const res = createResponse()

    service.setAuthCookies(res, 'user', 'access-token', 'refresh-token')

    expect(res.cookie).toHaveBeenCalledWith('user_access_token', 'access-token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 300_000,
    })
    expect(res.cookie).toHaveBeenCalledWith('user_refresh_token', 'refresh-token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 2_592_000_000,
    })
  })

  /** The bug this split fixes: one sign-in overwrote or dropped another audience's session. */
  it.each([
    ['user', ['user_access_token', 'user_refresh_token']],
    ['artist', ['artist_access_token', 'artist_refresh_token']],
    ['staff', ['staff_access_token', 'staff_refresh_token']],
  ] as const)("should touch only the %s session's cookies", (audience, own) => {
    const signIn = createResponse()
    const signOut = createResponse()

    service.setAuthCookies(signIn, audience, 'at', 'rt')
    service.clearAuthCookies(signOut, audience)

    const legacy = ['access_token', 'refresh_token']
    expect(namesOf(signIn.cookie as jest.Mock)).toEqual(own)
    expect(namesOf(signIn.clearCookie as jest.Mock)).toEqual(legacy)
    expect(namesOf(signOut.clearCookie as jest.Mock)).toEqual([...own, ...legacy])
  })

  it('clearAuthCookies should clear access and refresh cookies with the write-time attributes', () => {
    const res = createResponse()

    service.clearAuthCookies(res, 'artist')

    const attributes = { httpOnly: true, sameSite: 'lax' as const, secure: false, path: '/' }
    expect(res.clearCookie).toHaveBeenCalledWith('artist_access_token', attributes)
    expect(res.clearCookie).toHaveBeenCalledWith('artist_refresh_token', attributes)
  })

  it('clearAuthCookies should repeat the cookie domain, or a scoped session survives logout', () => {
    const res = createResponse()
    configMap.set('cookie', {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      domain: '.bitrate.me',
    })

    try {
      service.clearAuthCookies(res, 'staff')
    } finally {
      configMap.set('cookie', { httpOnly: true, sameSite: 'lax', secure: false, path: '/' })
    }

    const attributes = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: true,
      path: '/',
      domain: '.bitrate.me',
    }
    expect(res.clearCookie).toHaveBeenCalledWith('staff_access_token', attributes)
    expect(res.clearCookie).toHaveBeenCalledWith('staff_refresh_token', attributes)
    // A legacy cookie written on the shared domain is only dropped by a domain-scoped clear.
    expect(res.clearCookie).toHaveBeenCalledWith('access_token', attributes)
  })
})
