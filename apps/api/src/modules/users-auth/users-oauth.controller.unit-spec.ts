import type { AppConfig } from '@common/config'
import { LegalAcceptanceRequiredError } from '@common/legal'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { OAuthSignInError } from '@modules/auth-core'
import type { TokenService } from '@modules/tokens/token.service'
import type { ConfigService } from '@nestjs/config'
import type { Response } from 'express'
import type { OAuthService } from './oauth.service'
import { UsersOAuthController } from './users-oauth.controller'

const makeOAuthServiceMock = () =>
  ({
    generateState: jest.fn().mockReturnValue('state'),
    getGoogleAuthUrl: jest.fn().mockReturnValue('https://accounts.google.test/auth'),
    getFacebookAuthUrl: jest.fn().mockReturnValue('https://facebook.test/auth'),
    handleGoogleCallback: jest.fn(),
    handleFacebookCallback: jest.fn(),
  }) as unknown as jest.Mocked<OAuthService>

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

describe('UsersOAuthController legal acceptance', () => {
  let controller: UsersOAuthController
  let oauthService: jest.Mocked<OAuthService>

  beforeEach(() => {
    oauthService = makeOAuthServiceMock()
    controller = new UsersOAuthController(oauthService, makeTokenServiceMock(), makeConfigMock())
  })

  it('remembers acceptance from the start request for the callback', () => {
    const res = makeResponse()

    controller.googleAuth(res, 'true')

    expect(res.cookie).toHaveBeenCalledWith(
      'oauth_accept',
      'legal',
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

  it('passes the remembered acceptance to the callback and clears it', async () => {
    oauthService.handleGoogleCallback.mockResolvedValue({
      access_token: 'at',
      refresh_token: 'rt',
    })
    const res = makeResponse()

    await controller.googleCallback(
      'code',
      'state',
      { cookies: { oauth_state: 'state', oauth_accept: 'legal' } } as never,
      res,
    )

    expect(oauthService.handleGoogleCallback).toHaveBeenCalledWith('code', { acceptLegal: true })
    expect(res.clearCookie).toHaveBeenCalledWith('oauth_accept')
  })

  it('treats a missing acceptance cookie as not accepted', async () => {
    oauthService.handleFacebookCallback.mockResolvedValue({
      access_token: 'at',
      refresh_token: 'rt',
    })

    await controller.facebookCallback(
      'code',
      'state',
      { cookies: { oauth_state: 'state' } } as never,
      makeResponse(),
    )

    expect(oauthService.handleFacebookCallback).toHaveBeenCalledWith('code', { acceptLegal: false })
  })

  it('sends a new, unaccepting user back to login with an explanatory error', async () => {
    oauthService.handleGoogleCallback.mockRejectedValue(new LegalAcceptanceRequiredError())
    const res = makeResponse()

    await controller.googleCallback(
      'code',
      'state',
      { cookies: { oauth_state: 'state' } } as never,
      res,
    )

    expect(res.redirect).toHaveBeenCalledWith(
      'https://users.example.com/login?error=legal_acceptance_required',
    )
  })
})

describe('UsersOAuthController failures', () => {
  let controller: UsersOAuthController
  let oauthService: jest.Mocked<OAuthService>

  beforeEach(() => {
    oauthService = makeOAuthServiceMock()
    controller = new UsersOAuthController(oauthService, makeTokenServiceMock(), makeConfigMock())
  })

  const callback = (res: Response, code?: string, providerError?: string) =>
    controller.googleCallback(
      code as string,
      'state',
      { cookies: { oauth_state: 'state' } } as never,
      res,
      providerError,
    )

  it('sends the browser back to login when the provider is not configured', () => {
    oauthService.getFacebookAuthUrl.mockImplementation(() => {
      throw new OAuthSignInError('unavailable', 'Facebook OAuth is not configured')
    })
    const res = makeResponse()

    controller.facebookAuth(res)

    expect(res.redirect).toHaveBeenCalledWith(
      'https://users.example.com/login?error=oauth_unavailable',
    )
  })

  it('treats a callback without a code as a sign-in the listener cancelled', async () => {
    const res = makeResponse()

    await callback(res, undefined, 'access_denied')

    expect(oauthService.handleGoogleCallback).not.toHaveBeenCalled()
    expect(res.clearCookie).toHaveBeenCalledWith('oauth_state')
    expect(res.clearCookie).toHaveBeenCalledWith('oauth_accept')
    expect(res.redirect).toHaveBeenCalledWith(
      'https://users.example.com/login?error=oauth_cancelled',
    )
  })

  it.each([
    ['account_exists'],
    ['email_missing'],
    ['email_unverified'],
    ['exchange_failed'],
    ['account_unavailable'],
  ] as const)('explains a %s failure on the login page', async (reason) => {
    oauthService.handleGoogleCallback.mockRejectedValue(new OAuthSignInError(reason, reason))
    const res = makeResponse()

    await callback(res, 'code')

    expect(res.redirect).toHaveBeenCalledWith(
      `https://users.example.com/login?error=oauth_${reason}`,
    )
  })

  it('never shows an unexpected error as raw JSON', async () => {
    oauthService.handleGoogleCallback.mockRejectedValue(new Error('database is down'))
    const res = makeResponse()

    await expect(callback(res, 'code')).resolves.not.toThrow()

    expect(res.redirect).toHaveBeenCalledWith('https://users.example.com/login?error=oauth_failed')
  })
})
