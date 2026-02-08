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
    ['ACCESS_TOKEN_NAME', 'access_token'],
    ['REFRESH_TOKEN_NAME', 'refresh_token'],
    ['cookie', { httpOnly: true, sameSite: 'lax', secure: false }],
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

    const result = await service.generateAccessToken('user-1', 'alice')

    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { username: 'alice' },
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

    const result = await service.generateRefreshToken('user-1', 'alice')

    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { username: 'alice' },
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

  it('setAuthCookies should set access and refresh cookies', () => {
    const res = {
      cookie: jest.fn(),
    } as unknown as jest.Mocked<Response>

    service.setAuthCookies(res, 'access-token', 'refresh-token')

    expect(res.cookie).toHaveBeenCalledWith('access_token', 'access-token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    })
    expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refresh-token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    })
  })

  it('clearAuthCookies should clear access and refresh cookies', () => {
    const res = {
      clearCookie: jest.fn(),
    } as unknown as jest.Mocked<Response>

    service.clearAuthCookies(res)

    expect(res.clearCookie).toHaveBeenCalledWith('access_token')
    expect(res.clearCookie).toHaveBeenCalledWith('refresh_token')
  })
})
