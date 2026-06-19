import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { buildArtist } from '@modules/artists/__tests__/fixtures/artists.fixtures'
import type { ArtistsService } from '@modules/artists/artists.service'
import type { TokenService } from '@modules/tokens/token.service'
import type { Response } from 'express'
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

const makeResponse = () =>
  ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
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
    controller = new AuthController(authService, artistsService, tokenService)
  })

  it('login should call loginArtist and setAuthCookies', async () => {
    authService.loginArtist.mockResolvedValue({
      access_token: 'at',
      refresh_token: 'rt',
    } as never)
    const res = makeResponse()

    await controller.login({ email: 'a@example.com', password: 'pass' }, res)

    expect(authService.loginArtist).toHaveBeenCalledWith('a@example.com', 'pass')
    expect(tokenService.setAuthCookies).toHaveBeenCalledWith(res, 'at', 'rt')
  })

  it('registration should call registerArtist', async () => {
    authService.registerArtist.mockResolvedValue(undefined as never)

    await controller.registration({ email: 'a@example.com', password: 'pass', username: 'a' })

    expect(authService.registerArtist).toHaveBeenCalledWith({
      email: 'a@example.com',
      password: 'pass',
      username: 'a',
    })
  })

  it('logout should call service.logout and clearAuthCookies', async () => {
    authService.logout.mockResolvedValue(undefined as never)
    const res = makeResponse()
    const req = {
      user: { id: 'artist-1' },
      [process.env.ACCESS_TOKEN_NAME ?? 'access_token']: 'at',
    } as never

    await controller.logout(req, res)

    expect(authService.logout).toHaveBeenCalled()
    expect(tokenService.clearAuthCookies).toHaveBeenCalledWith(res)
  })

  it('refresh should call service.refresh and setAuthCookies', async () => {
    authService.refresh.mockResolvedValue({ access_token: 'new-at' } as never)
    const res = makeResponse()
    const req = {
      [process.env.REFRESH_TOKEN_NAME ?? 'refresh_token']: 'rt',
    } as never

    await controller.refresh(req, res)

    expect(authService.refresh).toHaveBeenCalledWith('rt')
    expect(tokenService.setAuthCookies).toHaveBeenCalledWith(res, 'new-at', 'rt')
  })

  it('getMe should return artist by id from request user', async () => {
    const artist = buildArtist()
    artistsService.findById.mockResolvedValue(artist as never)
    const req = { user: { id: 'artist-1' } } as never

    const result = await controller.getMe(req)

    expect(artistsService.findById).toHaveBeenCalledWith('artist-1')
    expect(result).toBe(artist)
  })
})
