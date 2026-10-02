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
import { LegalAcceptanceRequiredError } from '@common/legal'
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
  googleAuth(@Res() res: Response, @Query('acceptLegal') acceptLegal?: string) {
    return this.startOAuth(res, { acceptLegal: acceptLegal === 'true' }, (state) =>
      this.oauthService.getGoogleAuthUrl(state),
    )
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
    return await this.completeOAuth(req, res, state, (acceptance) =>
      this.oauthService.handleGoogleCallback(code, acceptance),
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
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return await this.completeOAuth(req, res, state, (acceptance) =>
      this.oauthService.handleFacebookCallback(code, acceptance),
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
    setOAuthStateCookie(res, state)
    setOAuthAcceptCookie(res, accepted)
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
    exchange: (acceptance: Pick<OAuthAcceptance, 'acceptLegal'>) => Promise<LoginResult>,
  ) {
    const host = this.config.getOrThrow('web').userHost

    if (!state || state !== req.cookies?.[OAUTH_STATE_COOKIE]) {
      return res.redirect(`${host}/login?error=oauth_state_mismatch`)
    }

    clearOAuthStateCookie(res)
    const { acceptLegal } = readOAuthAcceptance(req.cookies)
    clearOAuthAcceptCookie(res)

    let result: LoginResult
    try {
      result = await exchange({ acceptLegal })
    } catch (err) {
      if (err instanceof LegalAcceptanceRequiredError) {
        return res.redirect(`${host}/login?error=legal_acceptance_required`)
      }
      throw err
    }

    if ('requires2fa' in result) {
      setPendingTwoFactorCookie(res, result.pendingToken)
      return res.redirect(`${host}/login/2fa`)
    }

    this.tokenService.setAuthCookies(res, result.access_token, result.refresh_token)
    return res.redirect(host)
  }
}
