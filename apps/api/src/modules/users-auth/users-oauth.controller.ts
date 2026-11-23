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
import { Controller, Get, Logger, Query, Req, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type { Request, Response } from 'express'
import { TokenService } from '../tokens/token.service'
import {
  OAuthFacebookCallbackSwagger,
  OAuthFacebookSwagger,
  OAuthGoogleCallbackSwagger,
  OAuthGoogleSwagger,
} from './decorators'
import { OAuthService } from './oauth.service'

/** What the provider sent back besides the state: a code, or an error when the user backed out. */
type OAuthCallback = { code?: string; providerError?: string }

/** Handles the listener-facing social sign-in round trips. */
@ApiTags('Users Auth')
@Throttle(AUTH_ROUTE_THROTTLE)
@Controller({ path: 'auth/oauth', version: '1' })
export class UsersOAuthController {
  private readonly logger = new Logger(UsersOAuthController.name)

  constructor(
    private oauthService: OAuthService,
    private tokenService: TokenService,
    private config: ConfigService<AppConfig>,
  ) {}

  /** Runs the google auth operation. */
  @OAuthGoogleSwagger()
  @Get('google')
  googleAuth(@Res() res: Response, @Query('acceptLegal') acceptLegal?: string) {
    return this.startOAuth(res, { acceptLegal: acceptLegal === 'true' }, (state) =>
      this.oauthService.getGoogleAuthUrl(state),
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
      (authCode, acceptance) => this.oauthService.handleGoogleCallback(authCode, acceptance),
    )
  }

  /** Runs the facebook auth operation. */
  @OAuthFacebookSwagger()
  @Get('facebook')
  facebookAuth(@Res() res: Response, @Query('acceptLegal') acceptLegal?: string) {
    return this.startOAuth(res, { acceptLegal: acceptLegal === 'true' }, (state) =>
      this.oauthService.getFacebookAuthUrl(state),
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
      (authCode, acceptance) => this.oauthService.handleFacebookCallback(authCode, acceptance),
    )
  }

  /**
   * Issues a fresh CSRF state and sends the browser to the provider. What the user accepted
   * is carried in a cookie because the provider round trip drops every query parameter.
   */
  private startOAuth(
    res: Response,
    accepted: Pick<OAuthAcceptance, 'acceptLegal'>,
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
   * without a code means the user backed out at the provider. Every failure
   * ends on the login page with an `?error=` code, never as an error body.
   */
  private async completeOAuth(
    req: Request,
    res: Response,
    state: string,
    callback: OAuthCallback,
    exchange: (
      code: string,
      acceptance: Pick<OAuthAcceptance, 'acceptLegal'>,
    ) => Promise<LoginResult>,
  ) {
    const host = this.config.getOrThrow('web').userHost

    if (!state || state !== req.cookies?.[OAUTH_STATE_COOKIE]) {
      return res.redirect(`${host}/login?error=oauth_state_mismatch`)
    }

    clearOAuthStateCookie(res)
    const { acceptLegal } = readOAuthAcceptance(req.cookies)
    clearOAuthAcceptCookie(res)

    if (callback.providerError || !callback.code) {
      return res.redirect(`${host}/login?error=oauth_cancelled`)
    }

    let result: LoginResult
    try {
      result = await exchange(callback.code, { acceptLegal })
    } catch (err) {
      return this.failOAuth(res, err)
    }

    if ('requires2fa' in result) {
      setPendingTwoFactorCookie(res, result.pendingToken)
      return res.redirect(`${host}/login/2fa`)
    }

    this.tokenService.setAuthCookies(res, 'user', result.access_token, result.refresh_token)
    return res.redirect(host)
  }

  /** Sends the browser back to login with the failure's code; unexpected failures are logged. */
  private failOAuth(res: Response, err: unknown) {
    const code = oauthErrorCode(err)
    if (code === 'oauth_failed') this.logger.error('Social sign-in failed', err)
    return res.redirect(`${this.config.getOrThrow('web').userHost}/login?error=${code}`)
  }
}
