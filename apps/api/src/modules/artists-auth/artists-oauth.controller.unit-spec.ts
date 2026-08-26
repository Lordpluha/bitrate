import type { AppConfig } from '@common/config'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { TokenService } from '@modules/tokens/token.service'
import type { ConfigService } from '@nestjs/config'
import type { Response } from 'express'
import type { ArtistOAuthService } from './artist-oauth.service'
import { ArtistsOAuthController } from './artists-oauth.controller'

const makeOAuthServiceMock = () =>
  ({
    generateState: jest.fn().mockReturnValue('state'),
    getGoogleAuthUrl: jest.fn().mockReturnValue('https://accounts.google.test/auth'),
    getFacebookAuthUrl: jest.fn().mockReturnValue('https://facebook.test/auth'),
    handleGoogleCallback: jest.fn(),
    handleFacebookCallback: jest.fn(),
  }) as unknown as jest.Mocked<ArtistOAuthService>

const makeTokenServiceMock = () =>
  ({
    setAuthCookies: jest.fn(),
    clearAuthCookies: jest.fn(),
  }) as unknown as jest.Mocked<TokenService>

const makeConfigMock = () =>
  ({
    getOrThrow: jest.fn().mockReturnValue({
      userHost: 'https://users.example.com',
      artistHost: 'https://artists.example.com',
    }),
  }) as unknown as jest.Mocked<ConfigService<AppConfig>>

const makeResponse = () =>
  ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    redirect: jest.fn(),
  }) as unknown as Response

describe('ArtistsOAuthController', () => {
  let controller: ArtistsOAuthController
  let oauthService: jest.Mocked<ArtistOAuthService>
  let tokenService: jest.Mocked<TokenService>

  beforeEach(() => {
    oauthService = makeOAuthServiceMock()
    tokenService = makeTokenServiceMock()
    controller = new ArtistsOAuthController(oauthService, tokenService, makeConfigMock())
  })

  it('googleAuth stores a CSRF state cookie before redirecting to the provider', () => {
    const res = makeResponse()

    controller.googleAuth(res)

    expect(res.cookie).toHaveBeenCalledWith('oauth_state', 'state', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 5 * 60 * 1000,
    })
    expect(res.redirect).toHaveBeenCalledWith('https://accounts.google.test/auth')
  })

  it('rejects a callback whose state does not match the stored cookie', async () => {
    const res = makeResponse()

    await controller.googleCallback(
      'code',
      'other',
      { cookies: { oauth_state: 'state' } } as never,
      res,
    )

    expect(oauthService.handleGoogleCallback).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith(
      'https://artists.example.com/login?error=oauth_state_mismatch',
    )
  })

  it('sets auth cookies and returns to the artist app on a completed callback', async () => {
    oauthService.handleFacebookCallback.mockResolvedValue({
      access_token: 'at',
      refresh_token: 'rt',
    })
    const res = makeResponse()

    await controller.facebookCallback(
      'code',
      'state',
      { cookies: { oauth_state: 'state' } } as never,
      res,
    )

    expect(res.clearCookie).toHaveBeenCalledWith('oauth_state')
    expect(tokenService.setAuthCookies).toHaveBeenCalledWith(res, 'at', 'rt')
    expect(res.redirect).toHaveBeenCalledWith('https://artists.example.com')
  })

  it('OAuth 2FA callback sets a site-wide secure cookie and redirects to artist frontend', async () => {
    const previousNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    oauthService.handleGoogleCallback.mockResolvedValue({
      requires2fa: true,
      pendingToken: 'pending-token',
    })
    const res = makeResponse()

    try {
      await controller.googleCallback(
        'code',
        'state',
        { cookies: { oauth_state: 'state' } } as never,
        res,
      )

      expect(res.cookie).toHaveBeenCalledWith('pending_2fa_token', 'pending-token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
        maxAge: 10 * 60 * 1000,
      })
      expect(res.redirect).toHaveBeenCalledWith('https://artists.example.com/login/2fa')
    } finally {
      process.env.NODE_ENV = previousNodeEnv
    }
  })
})
