import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { buildArtist } from '@modules/artists/__tests__/fixtures/artists.fixtures'
import type { ArtistsService } from '@modules/artists/artists.service'
import type { TokenService } from '@modules/tokens/token.service'
import type { Response } from 'express'

jest.mock('otplib', () => ({
  generateSecret: jest.fn(),
  generateURI: jest.fn(),
  verify: jest.fn(),
}))
jest.mock('qrcode', () => ({ toDataURL: jest.fn() }))

import type { ArtistTwoFactorService } from './artist-two-factor.service'
import { AuthController } from './artists-auth.controller'
import type { ArtistsAuthService } from './artists-auth.service'

const makeAuthServiceMock = () =>
  ({
    loginArtist: jest.fn(),
    registerArtist: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
  }) as unknown as jest.Mocked<ArtistsAuthService>

const makeArtistsServiceMock = () =>
  ({
    findById: jest.fn(),
  }) as unknown as jest.Mocked<ArtistsService>

const makeTokenServiceMock = () =>
  ({
    setAuthCookies: jest.fn(),
    clearAuthCookies: jest.fn(),
  }) as unknown as jest.Mocked<TokenService>

const makeTwoFactorServiceMock = () =>
  ({
    setupTwoFactor: jest.fn(),
    enableTwoFactor: jest.fn(),
    disableTwoFactor: jest.fn(),
    verifyLoginCode: jest.fn(),
  }) as unknown as jest.Mocked<ArtistTwoFactorService>

const makeResponse = () =>
  ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    redirect: jest.fn(),
  }) as unknown as Response

describe('AuthController (artists)', () => {
  let controller: AuthController
  let authService: jest.Mocked<ArtistsAuthService>
  let artistsService: jest.Mocked<ArtistsService>
  let tokenService: jest.Mocked<TokenService>

  beforeEach(() => {
    authService = makeAuthServiceMock()
    artistsService = makeArtistsServiceMock()
    tokenService = makeTokenServiceMock()
    controller = new AuthController(
      authService,
      artistsService,
      tokenService,
      makeTwoFactorServiceMock(),
    )
  })

  it('login should call loginArtist and setAuthCookies', async () => {
    authService.loginArtist.mockResolvedValue({
      access_token: 'at',
      refresh_token: 'rt',
    } as never)
    const res = makeResponse()

    const req = { headers: { 'user-agent': 'Firefox' } } as never

    await controller.login({ email: 'a@example.com', password: 'pass' }, req, res)

    expect(authService.loginArtist).toHaveBeenCalledWith('a@example.com', 'pass', {
      userAgent: 'Firefox',
    })
    expect(tokenService.setAuthCookies).toHaveBeenCalledWith(res, 'artist', 'at', 'rt')
  })

  it('registration should call registerArtist', async () => {
    authService.registerArtist.mockResolvedValue(undefined as never)

    await controller.registration({
      email: 'a@example.com',
      password: 'pass',
      username: 'a',
      acceptLegal: true,
      acceptArtistAgreement: true,
    })

    expect(authService.registerArtist).toHaveBeenCalledWith({
      email: 'a@example.com',
      password: 'pass',
      username: 'a',
      acceptLegal: true,
      acceptArtistAgreement: true,
    })
  })

  it('logout should call service.logout and clearAuthCookies', async () => {
    authService.logout.mockResolvedValue(undefined as never)
    const res = makeResponse()
    const req = {
      artist: { id: 'artist-1' },
      artist_access_token: 'at',
    } as never

    await controller.logout(req, res)

    expect(authService.logout).toHaveBeenCalledWith('artist-1', 'at')
    expect(tokenService.clearAuthCookies).toHaveBeenCalledWith(res, 'artist')
  })

  it('refresh should call service.refresh and setAuthCookies', async () => {
    authService.refresh.mockResolvedValue({
      access_token: 'new-at',
      refresh_token: 'new-rt',
    } as never)
    const res = makeResponse()
    const req = {
      artist_refresh_token: 'rt',
    } as never

    await controller.refresh(req, res)

    expect(authService.refresh).toHaveBeenCalledWith('rt', {})
    expect(tokenService.setAuthCookies).toHaveBeenCalledWith(res, 'artist', 'new-at', 'new-rt')
  })

  it('getMe should return artist by id from request user', async () => {
    const artist = buildArtist()
    artistsService.findById.mockResolvedValue(artist as never)
    const req = { artist: { id: 'artist-1' } } as never

    const result = await controller.getMe(req)

    expect(artistsService.findById).toHaveBeenCalledWith('artist-1')
    expect(result).toBe(artist)
  })
})
