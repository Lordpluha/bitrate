import type { LoginResult } from '@common/auth.types'
import {
  clearOAuthStateCookie,
  OAUTH_STATE_COOKIE,
  setOAuthStateCookie,
  setPendingTwoFactorCookie,
} from '@common/auth-cookies'
import { type AppConfig, AUTH_ROUTE_THROTTLE } from '@common/config'
import { Controller, Get, Query, Req, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { Request, Response } from 'express'
import { TokenService } from '../tokens/token.service'
import {
  OAuthFacebookCallbackSwagger,
  OAuthFacebookSwagger,
  OAuthGoogleCallbackSwagger,
  OAuthGoogleSwagger,
} from './decorators'
import { OAuthService } from './oauth.service'

/** Handles the listener-facing social sign-in round trips. */
@ApiTags('Users Auth')
@Throttle(AUTH_ROUTE_THROTTLE)
@Controller({ path: 'auth/oauth', version: '1' })
export class UsersOAuthController {
  constructor(
    private oauthService: OAuthService,
    private tokenService: TokenService,
    private config: ConfigService<AppConfig>,
  ) {}

  /** Runs the google auth operation. */
  @OAuthGoogleSwagger()
  @Get('google')
  googleAuth(@Res() res: Response) {
    return this.startOAuth(res, (state) => this.oauthService.getGoogleAuthUrl(state))
  }

  /** Runs the google callback operation. */
  @OAuthGoogleCallbackSwagger()
  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.completeOAuth(req, res, state, () =>
      this.oauthService.handleGoogleCallback(code),
    )
  }

  /** Runs the facebook auth operation. */
  @OAuthFacebookSwagger()
  @Get('facebook')
  facebookAuth(@Res() res: Response) {
    return this.startOAuth(res, (state) => this.oauthService.getFacebookAuthUrl(state))
  }

  /** Runs the facebook callback operation. */
  @OAuthFacebookCallbackSwagger()
  @Get('facebook/callback')
  async facebookCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.completeOAuth(req, res, state, () =>
      this.oauthService.handleFacebookCallback(code),
    )
  }

  /** Issues a fresh CSRF state and sends the browser to the provider. */
  private startOAuth(res: Response, buildAuthUrl: (state: string) => string) {
    const state = this.oauthService.generateState()
    setOAuthStateCookie(res, state)
    return res.redirect(buildAuthUrl(state))
  }

  /**
   * Verifies the echoed OAuth state before exchanging the authorization code.
   *
   * A mismatch means the callback did not come from the browser that started
   * the flow, so it is bounced back to login rather than exchanged.
   */
  private async completeOAuth(
    req: Request,
    res: Response,
    state: string,
    exchange: () => Promise<LoginResult>,
  ) {
    const host = this.config.getOrThrow('web').userHost

    if (!state || state !== req.cookies?.[OAUTH_STATE_COOKIE]) {
      return res.redirect(`${host}/login?error=oauth_state_mismatch`)
    }

    clearOAuthStateCookie(res)
    const result = await exchange()

    if ('requires2fa' in result) {
      setPendingTwoFactorCookie(res, result.pendingToken)
      return res.redirect(`${host}/login/2fa`)
    }

    this.tokenService.setAuthCookies(res, result.access_token, result.refresh_token)
    return res.redirect(host)
  }
}
