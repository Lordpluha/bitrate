import type { AppConfig } from '@common/config'
import { LegalAcceptanceRequiredError } from '@common/legal'
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

  describe('legal acceptance', () => {
    it('remembers both acceptances from the start request for the callback', () => {
      const res = makeResponse()

      controller.googleAuth(res, 'true', 'true')

      expect(res.cookie).toHaveBeenCalledWith(
        'oauth_accept',
        'legal,artist-agreement',
        expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' }),
      )
    })

    it('stores no acceptance when the start request did not accept', () => {
      const res = makeResponse()

      controller.googleAuth(res)

      expect(res.cookie).not.toHaveBeenCalledWith(
        'oauth_accept',
        expect.anything(),
        expect.anything(),
      )
    })

    it('passes the remembered acceptances to the callback and clears them', async () => {
      oauthService.handleGoogleCallback.mockResolvedValue({
        access_token: 'at',
        refresh_token: 'rt',
      })
      const res = makeResponse()

      await controller.googleCallback(
        'code',
        'state',
        { cookies: { oauth_state: 'state', oauth_accept: 'legal,artist-agreement' } } as never,
        res,
      )

      expect(oauthService.handleGoogleCallback).toHaveBeenCalledWith('code', {
        acceptLegal: true,
        acceptArtistAgreement: true,
      })
      expect(res.clearCookie).toHaveBeenCalledWith('oauth_accept')
    })

    it('sends a new, unaccepting artist back to login with an explanatory error', async () => {
      oauthService.handleFacebookCallback.mockRejectedValue(new LegalAcceptanceRequiredError())
      const res = makeResponse()

      await controller.facebookCallback(
        'code',
        'state',
        { cookies: { oauth_state: 'state' } } as never,
        res,
      )

      expect(res.redirect).toHaveBeenCalledWith(
        'https://artists.example.com/login?error=legal_acceptance_required',
      )
    })
  })
})
