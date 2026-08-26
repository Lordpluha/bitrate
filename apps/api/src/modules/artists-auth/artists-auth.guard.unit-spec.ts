import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { buildArtist } from '@modules/artists/__tests__/fixtures/artists.fixtures'
import type { TokenService } from '@modules/tokens/token.service'
import { UnauthorizedException } from '@nestjs/common'
import type { Reflector } from '@nestjs/core'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { buildArtistSession } from './__tests__/fixtures/artists-auth.fixtures'
import { ArtistAuthGuard } from './artists-auth.guard'
import { UNAUTHORIZED_ERRORS } from './errors/unauthorized.errors'

const makeTokenServiceMock = () =>
  ({
    verifyToken: jest.fn(),
    hashToken: jest.fn().mockReturnValue('hashed-token'),
    getTokenName: jest.fn((type: string) => (type === 'access' ? 'access_token' : 'refresh_token')),
  }) as unknown as jest.Mocked<TokenService>

const makeReflectorMock = (requirement: string) =>
  ({
    getAllAndOverride: jest.fn().mockReturnValue(requirement),
  }) as unknown as Reflector

const makeContext = (cookies: Record<string, string>) => ({
  getHandler: () => ({}),
  getClass: () => ({}),
  switchToHttp: () => ({
    getRequest: () => ({ cookies }),
  }),
})

describe('ArtistAuthGuard', () => {
  let guard: ArtistAuthGuard
  let prisma: PrismaMock
  let tokenService: jest.Mocked<TokenService>
  let reflector: Reflector

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    tokenService = makeTokenServiceMock()
  })

  it('should throw ACCESS_TOKEN_REQUIRED when access token is missing for access requirement', async () => {
    reflector = makeReflectorMock('access')
    guard = new ArtistAuthGuard(prisma, reflector, tokenService)

    await expect(guard.canActivate(makeContext({}) as never)).rejects.toThrow(
      UNAUTHORIZED_ERRORS.ACCESS_TOKEN_REQUIRED,
    )
  })

  it('should throw REFRESH_TOKEN_REQUIRED when refresh token is missing for refresh requirement', async () => {
    reflector = makeReflectorMock('refresh')
    guard = new ArtistAuthGuard(prisma, reflector, tokenService)

    await expect(guard.canActivate(makeContext({}) as never)).rejects.toThrow(
      UNAUTHORIZED_ERRORS.REFRESH_TOKEN_REQUIRED,
    )
  })

  it('should throw UnauthorizedException when token verification fails', async () => {
    process.env.ACCESS_TOKEN_NAME = 'access_token'
    reflector = makeReflectorMock('access')
    guard = new ArtistAuthGuard(prisma, reflector, tokenService)
    tokenService.verifyToken.mockRejectedValue(new Error('invalid') as never)

    await expect(
      guard.canActivate(makeContext({ access_token: 'bad-token' }) as never),
    ).rejects.toThrow(UnauthorizedException)
  })

  it('should throw INVALID_OR_EXPIRED_TOKEN when artist not found in DB', async () => {
    process.env.ACCESS_TOKEN_NAME = 'access_token'
    process.env.REFRESH_TOKEN_NAME = 'refresh_token'
    reflector = makeReflectorMock('access')
    guard = new ArtistAuthGuard(prisma, reflector, tokenService)
    tokenService.verifyToken.mockResolvedValue({
      sub: 'artist-1',
      username: 'artist',
      type: 'artist',
    } as never)
    prisma.artist.findFirst.mockResolvedValue(null)

    await expect(guard.canActivate(makeContext({ access_token: 'at' }) as never)).rejects.toThrow(
      UNAUTHORIZED_ERRORS.USER_NOT_FOUND,
    )
  })

  it('should throw SESSION_NOT_FOUND when session not found', async () => {
    process.env.ACCESS_TOKEN_NAME = 'access_token'
    process.env.REFRESH_TOKEN_NAME = 'refresh_token'
    reflector = makeReflectorMock('access')
    guard = new ArtistAuthGuard(prisma, reflector, tokenService)
    tokenService.verifyToken.mockResolvedValue({
      sub: 'artist-1',
      username: 'artist',
      type: 'artist',
    } as never)
    prisma.artist.findFirst.mockResolvedValue(buildArtist() as never)
    prisma.artistSession.findFirst.mockResolvedValue(null)

    await expect(guard.canActivate(makeContext({ access_token: 'at' }) as never)).rejects.toThrow(
      UNAUTHORIZED_ERRORS.SESSION_NOT_FOUND,
    )
  })

  it('should return true and attach artist to request when auth succeeds', async () => {
    process.env.ACCESS_TOKEN_NAME = 'access_token'
    process.env.REFRESH_TOKEN_NAME = 'refresh_token'
    reflector = makeReflectorMock('access')
    guard = new ArtistAuthGuard(prisma, reflector, tokenService)

    const artist = buildArtist()
    const session = buildArtistSession()
    tokenService.verifyToken.mockResolvedValue({
      sub: 'artist-1',
      username: 'artist',
      type: 'artist',
    } as never)
    prisma.artist.findFirst.mockResolvedValue(artist as never)
    prisma.artistSession.findFirst.mockResolvedValue(session as never)

    const req: Record<string, unknown> = { cookies: { access_token: 'at' } }
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => req }),
    }

    const result = await guard.canActivate(ctx as never)

    expect(result).toBe(true)
    expect(req.artist).toBe(artist)
    expect(prisma.artist.findFirst).toHaveBeenCalledWith({
      where: { id: 'artist-1', deletedAt: null },
    })
  })
})
