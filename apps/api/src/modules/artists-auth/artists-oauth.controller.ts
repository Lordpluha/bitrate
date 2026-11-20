import type { LoginResult } from '@common/auth.types'
import {
  clearOAuthAcceptCookie,
  clearOAuthStateCookie,
  OAUTH_STATE_COOKIE,
  type OAuthAcceptance,
  readOAuthAcceptance,
  setOAuthAcceptCookie,
  setOAuthStateCookie,
  setPendingTwoFactorCookie,
} from '@common/auth-cookies'
import { type AppConfig, AUTH_ROUTE_THROTTLE } from '@common/config'
import { oauthErrorCode } from '@modules/auth-core'
import { TokenService } from '@modules/tokens/token.service'
import { Controller, Get, Logger, Query, Req, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type { Request, Response } from 'express'
import { ArtistOAuthService } from './artist-oauth.service'
import {
  OAuthFacebookCallbackSwagger,
  OAuthFacebookSwagger,
  OAuthGoogleCallbackSwagger,
  OAuthGoogleSwagger,
} from './decorators'
import { sessionClient } from './session-client'

/** What the provider sent back besides the state: a code, or an error when the user backed out. */
type OAuthCallback = { code?: string; providerError?: string }

/** Handles the artist-facing social sign-in round trips. */
@ApiTags('Artists Auth')
@Throttle(AUTH_ROUTE_THROTTLE)
@Controller({ path: 'artists/auth/oauth', version: '1' })
export class ArtistsOAuthController {
  private readonly logger = new Logger(ArtistsOAuthController.name)

  constructor(
    private oauthService: ArtistOAuthService,
    private tokenService: TokenService,
    private config: ConfigService<AppConfig>,
  ) {}

  /** Runs the google auth operation. */
  @OAuthGoogleSwagger()
  @Get('google')
  googleAuth(
    @Res() res: Response,
    @Query('acceptLegal') acceptLegal?: string,
    @Query('acceptArtistAgreement') acceptArtistAgreement?: string,
  ) {
    return this.startOAuth(
      res,
      {
        acceptLegal: acceptLegal === 'true',
        acceptArtistAgreement: acceptArtistAgreement === 'true',
      },
      (state) => this.oauthService.getGoogleAuthUrl(state),
    )
  }

  /** Runs the google callback operation. */
  @OAuthGoogleCallbackSwagger()
  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('error') providerError?: string,
  ) {
    return await this.completeOAuth(
      req,
      res,
      state,
      { code, providerError },
      (authCode, acceptance) =>
        this.oauthService.handleGoogleCallback(authCode, acceptance, sessionClient(req)),
    )
  }

  /** Runs the facebook auth operation. */
  @OAuthFacebookSwagger()
  @Get('facebook')
  facebookAuth(
    @Res() res: Response,
    @Query('acceptLegal') acceptLegal?: string,
    @Query('acceptArtistAgreement') acceptArtistAgreement?: string,
  ) {
    return this.startOAuth(
      res,
      {
        acceptLegal: acceptLegal === 'true',
        acceptArtistAgreement: acceptArtistAgreement === 'true',
      },
      (state) => this.oauthService.getFacebookAuthUrl(state),
    )
  }

  /** Runs the facebook callback operation. */
  @OAuthFacebookCallbackSwagger()
  @Get('facebook/callback')
  async facebookCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('error') providerError?: string,
  ) {
    return await this.completeOAuth(
      req,
      res,
      state,
      { code, providerError },
      (authCode, acceptance) =>
        this.oauthService.handleFacebookCallback(authCode, acceptance, sessionClient(req)),
    )
  }

  /**
   * Issues a fresh CSRF state and sends the browser to the provider. What the artist accepted
   * is carried in a cookie because the provider round trip drops every query parameter.
   */
  private startOAuth(
    res: Response,
    accepted: OAuthAcceptance,
    buildAuthUrl: (state: string) => string,
  ) {
    const state = this.oauthService.generateState()
    let authUrl: string
    try {
      authUrl = buildAuthUrl(state)
    } catch (err) {
      return this.failOAuth(res, err)
    }
    setOAuthStateCookie(res, state)
    setOAuthAcceptCookie(res, accepted)
    return res.redirect(authUrl)
  }

  /**
   * Verifies the echoed OAuth state before exchanging the authorization code.
   *
   * A mismatch means the callback did not come from the browser that started
   * the flow, so it is bounced back to login rather than exchanged. A callback
   * without a code means the artist backed out at the provider. Every failure
   * ends on the login page with an `?error=` code, never as an error body.
   */
  private async completeOAuth(
    req: Request,
    res: Response,
    state: string,
    callback: OAuthCallback,
    exchange: (code: string, acceptance: OAuthAcceptance) => Promise<LoginResult>,
  ) {
    const host = this.config.getOrThrow('web').artistHost

    if (!state || state !== req.cookies?.[OAUTH_STATE_COOKIE]) {
      return res.redirect(`${host}/login?error=oauth_state_mismatch`)
    }

    clearOAuthStateCookie(res)
    const acceptance = readOAuthAcceptance(req.cookies)
    clearOAuthAcceptCookie(res)

    if (callback.providerError || !callback.code) {
      return res.redirect(`${host}/login?error=oauth_cancelled`)
    }

    let result: LoginResult
    try {
      result = await exchange(callback.code, acceptance)
    } catch (err) {
      return this.failOAuth(res, err)
    }

    // The artist portal asks for the code on its login page rather than at a route of its own.
    if ('requires2fa' in result) {
      setPendingTwoFactorCookie(res, result.pendingToken)
      return res.redirect(`${host}/login?twoFactor=1`)
    }

    this.tokenService.setAuthCookies(res, 'artist', result.access_token, result.refresh_token)
    return res.redirect(host)
  }

  /** Sends the browser back to login with the failure's code; unexpected failures are logged. */
  private failOAuth(res: Response, err: unknown) {
    const code = oauthErrorCode(err)
    if (code === 'oauth_failed') this.logger.error('Social sign-in failed', err)
    return res.redirect(`${this.config.getOrThrow('web').artistHost}/login?error=${code}`)
  }
}
