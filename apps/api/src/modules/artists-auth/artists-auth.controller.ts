import { AUTH_ROUTE_THROTTLE } from '@common/config'
import { ArtistsService } from '@modules/artists/artists.service'
import { TokenService } from '@modules/tokens/token.service'
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type { Request, Response } from 'express'
import { ZodValidationPipe } from 'nestjs-zod'
import { ArtistOAuthService } from './artist-oauth.service'
import { ArtistTwoFactorService } from './artist-two-factor.service'
import { ArtistAuth } from './artists-auth.guard'
import { ArtistsAuthService } from './artists-auth.service'
import {
  AuthForgotPasswordSwagger,
  AuthLoginSwagger,
  AuthLogoutSwagger,
  AuthMeSwagger,
  AuthRefreshSwagger,
  AuthRegistrationSwagger,
  AuthResetPasswordSwagger,
  EmailAvailabilitySwagger,
  OAuthFacebookCallbackSwagger,
  OAuthFacebookSwagger,
  OAuthGoogleCallbackSwagger,
  OAuthGoogleSwagger,
  TwoFactorDisableSwagger,
  TwoFactorEnableSwagger,
  TwoFactorSetupSwagger,
  TwoFactorVerifyLoginSwagger,
} from './decorators'
import {
  ArtistForgotPasswordDto,
  ForgotPasswordSchema,
  type LoginDto,
  LoginSchema,
  type RegistrationDto,
  RegistrationSchema,
  ResendArtistEmailDto,
  ResendArtistEmailSchema,
  ResetPasswordDto,
  ResetPasswordSchema,
  TwoFactorCodeDto,
  TwoFactorCodeSchema,
  TwoFactorVerifyLoginDto,
  TwoFactorVerifyLoginSchema,
  VerifyArtistEmailDto,
  VerifyArtistEmailSchema,
} from './dtos'
import { ArtistSessionEntity } from './entities'
import type { ArtistAuthRequest } from './types'

/** Represents the auth controller. */
@ApiExtraModels(ArtistSessionEntity)
@ApiTags('Artists Auth')
@Throttle(AUTH_ROUTE_THROTTLE)
@Controller({ path: 'artists/auth', version: '1' })
export class AuthController {
  constructor(
    private artistAuthService: ArtistsAuthService,
    private artistService: ArtistsService,
    private tokenService: TokenService,
    private twoFactorService: ArtistTwoFactorService,
    private oauthService: ArtistOAuthService,
  ) {}

  /** Runs the login operation. */
  @AuthLoginSwagger()
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.artistAuthService.loginArtist(loginDto.email, loginDto.password)
    if ('requires2fa' in result) {
      res.cookie('pending_2fa_token', result.pendingToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 10 * 60 * 1000,
      })
      return { requires2fa: true }
    }
    this.tokenService.setAuthCookies(res, result.access_token, result.refresh_token)
  }

  /** Runs the registration operation. */
  @AuthRegistrationSwagger()
  @Post('registration')
  async registration(
    @Body(new ZodValidationPipe(RegistrationSchema))
    registrationDto: RegistrationDto,
  ) {
    await this.artistAuthService.registerArtist(registrationDto)
  }

  /** Checks whether an artist email is already registered. */
  @EmailAvailabilitySwagger()
  @Throttle({
    default: { ...AUTH_ROUTE_THROTTLE.default, limit: 20 },
  })
  @Get('email-availability')
  async emailAvailability(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required')
    }

    const artist = await this.artistService.findByEmail(email.trim().toLowerCase())
    return { available: !artist }
  }

  /** Runs the logout operation. */
  @AuthLogoutSwagger()
  @ArtistAuth()
  @Post('logout')
  async logout(@Req() req: ArtistAuthRequest & Request, @Res({ passthrough: true }) res: Response) {
    const access_token = req[process.env.ACCESS_TOKEN_NAME!] as string
    await this.artistAuthService.logout(req.artist.id, access_token)
    this.tokenService.clearAuthCookies(res)
  }

  /** Runs the refresh operation. */
  @AuthRefreshSwagger()
  @ArtistAuth('refresh')
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refresh_token = req[process.env.REFRESH_TOKEN_NAME!] as string
    const tokens = await this.artistAuthService.refresh(refresh_token)
    this.tokenService.setAuthCookies(res, tokens.access_token, tokens.refresh_token)
  }

  /** Runs the get me operation. */
  @AuthMeSwagger()
  @ArtistAuth()
  @Get('me')
  async getMe(@Req() req: ArtistAuthRequest) {
    return await this.artistService.findById(req.artist.id)
  }

  /** Runs the forgot password operation. */
  @AuthForgotPasswordSwagger()
  @HttpCode(200)
  @Post('forgot-password')
  async forgotPassword(
    @Body(new ZodValidationPipe(ForgotPasswordSchema)) dto: ArtistForgotPasswordDto,
  ) {
    await this.artistAuthService.forgotPassword(dto.email)
  }

  /** Runs the reset password operation. */
  @AuthResetPasswordSwagger()
  @HttpCode(200)
  @Post('reset-password')
  async resetPassword(@Body(new ZodValidationPipe(ResetPasswordSchema)) dto: ResetPasswordDto) {
    await this.artistAuthService.resetPassword(dto.token, dto.password)
  }

  @HttpCode(200)
  @Post('verify-email')
  async verifyEmail(
    @Body(new ZodValidationPipe(VerifyArtistEmailSchema)) dto: VerifyArtistEmailDto,
  ) {
    await this.artistAuthService.verifyEmail(dto.token)
  }

  @HttpCode(200)
  @Post('verify-email/resend')
  async resendEmail(
    @Body(new ZodValidationPipe(ResendArtistEmailSchema)) dto: ResendArtistEmailDto,
  ) {
    await this.artistAuthService.resendEmailVerification(dto.email)
  }

  /** Runs the two factor setup operation. */
  @TwoFactorSetupSwagger()
  @ArtistAuth()
  @Post('2fa/setup')
  async twoFactorSetup(@Req() req: ArtistAuthRequest) {
    return await this.twoFactorService.setupTwoFactor(req.artist.id)
  }

  /** Runs the two factor enable operation. */
  @TwoFactorEnableSwagger()
  @ArtistAuth()
  @HttpCode(200)
  @Post('2fa/enable')
  async twoFactorEnable(
    @Req() req: ArtistAuthRequest,
    @Body(new ZodValidationPipe(TwoFactorCodeSchema)) dto: TwoFactorCodeDto,
  ) {
    await this.twoFactorService.enableTwoFactor(req.artist.id, dto.code)
  }

  /** Runs the two factor disable operation. */
  @TwoFactorDisableSwagger()
  @ArtistAuth()
  @HttpCode(200)
  @Delete('2fa/disable')
  async twoFactorDisable(
    @Req() req: ArtistAuthRequest,
    @Body(new ZodValidationPipe(TwoFactorCodeSchema)) dto: TwoFactorCodeDto,
  ) {
    await this.twoFactorService.disableTwoFactor(req.artist.id, dto.code)
  }

  /** Runs the two factor verify login operation. */
  @TwoFactorVerifyLoginSwagger()
  @HttpCode(200)
  @Post('2fa/verify-login')
  async twoFactorVerifyLogin(
    @Body(new ZodValidationPipe(TwoFactorVerifyLoginSchema)) dto: TwoFactorVerifyLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const pendingToken = req.cookies?.pending_2fa_token ?? dto.pendingToken
    const artist = await this.twoFactorService.verifyLoginCode(pendingToken, dto.code)
    const { access_token, refresh_token } = await this.artistAuthService.completeTwoFactorLogin(
      artist.id,
    )
    res.clearCookie('pending_2fa_token', { path: '/' })
    this.tokenService.setAuthCookies(res, access_token, refresh_token)
  }

  /** Runs the google auth operation. */
  @OAuthGoogleSwagger()
  @Get('oauth/google')
  googleAuth(@Res() res: Response) {
    const state = this.oauthService.generateState()
    res.cookie('oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 5 * 60 * 1000,
    })
    return res.redirect(this.oauthService.getGoogleAuthUrl(state))
  }

  /** Runs the google callback operation. */
  @OAuthGoogleCallbackSwagger()
  @Get('oauth/google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!state || state !== req.cookies?.oauth_state) {
      return res.redirect(`${process.env.WEB_HOST!}/login?error=oauth_state_mismatch`)
    }
    res.clearCookie('oauth_state')
    const result = await this.oauthService.handleGoogleCallback(code)
    return this.handleOAuthResult(result, res)
  }

  /** Runs the facebook auth operation. */
  @OAuthFacebookSwagger()
  @Get('oauth/facebook')
  facebookAuth(@Res() res: Response) {
    const state = this.oauthService.generateState()
    res.cookie('oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 5 * 60 * 1000,
    })
    return res.redirect(this.oauthService.getFacebookAuthUrl(state))
  }

  /** Runs the facebook callback operation. */
  @OAuthFacebookCallbackSwagger()
  @Get('oauth/facebook/callback')
  async facebookCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!state || state !== req.cookies?.oauth_state) {
      return res.redirect(`${process.env.WEB_HOST!}/login?error=oauth_state_mismatch`)
    }
    res.clearCookie('oauth_state')
    const result = await this.oauthService.handleFacebookCallback(code)
    return this.handleOAuthResult(result, res)
  }

  /** Runs the handle oauth result operation. */
  private handleOAuthResult(
    result:
      | { access_token: string; refresh_token: string }
      | { requires2fa: true; pendingToken: string },
    res: Response,
  ) {
    if ('requires2fa' in result) {
      res.cookie('pending_2fa_token', result.pendingToken, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000,
      })
      return res.redirect(`${process.env.WEB_HOST!}/login/2fa`)
    }
    this.tokenService.setAuthCookies(res, result.access_token, result.refresh_token)
    return res.redirect(process.env.WEB_HOST!)
  }
}
