import { type AppConfig, AUTH_ROUTE_THROTTLE } from '@common/config'
import { SelfUserEntity, UserEntity } from '@modules/users'
import { UsersService } from '@modules/users/users.service'
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { Request, Response } from 'express'
import { ZodValidationPipe } from 'nestjs-zod'
import { TokenService } from '../tokens/token.service'
import {
  AuthForgotPasswordSwagger,
  AuthLoginSwagger,
  AuthLogoutSwagger,
  AuthMeSwagger,
  AuthRefreshSwagger,
  AuthRegistrationSwagger,
  AuthResetPasswordSwagger,
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
  ForgotPasswordSchema,
  LoginDto,
  LoginSchema,
  RegistrationDto,
  RegistrationSchema,
  ResendEmailVerificationDto,
  ResendEmailVerificationSchema,
  ResetPasswordDto,
  ResetPasswordSchema,
  TwoFactorCodeDto,
  TwoFactorCodeSchema,
  TwoFactorVerifyLoginDto,
  TwoFactorVerifyLoginSchema,
  UserForgotPasswordDto,
  VerifyEmailDto,
  VerifyEmailSchema,
} from './dtos'
import { UserSessionEntity } from './entities'
import { OAuthService } from './oauth.service'
import { TwoFactorService } from './two-factor.service'
import type { UserAuthRequest } from './types'
import { UserAuthService } from './user-auth.service'
import { UserAuth } from './users-auth.guard'

/** Represents the users auth controller. */
@ApiExtraModels(UserSessionEntity, SelfUserEntity)
@ApiTags('Users Auth')
@Throttle(AUTH_ROUTE_THROTTLE)
@Controller({ path: 'auth', version: '1' })
export class UsersAuthController {
  constructor(
    private authService: UserAuthService,
    private oauthService: OAuthService,
    private twoFactorService: TwoFactorService,
    private userService: UsersService,
    private tokenService: TokenService,
    private config: ConfigService<AppConfig>,
  ) {}

  /** Runs the login operation. */
  @AuthLoginSwagger()
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginUser(loginDto.email, loginDto.password)
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
    await this.authService.registerUser(registrationDto)
  }

  /** Runs the logout operation. */
  @AuthLogoutSwagger()
  @UserAuth()
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as UserEntity
    const access_token = req[process.env.ACCESS_TOKEN_NAME!] as string
    await this.authService.logout(user.id, access_token)
    this.tokenService.clearAuthCookies(res)
  }

  /** Runs the refresh operation. */
  @AuthRefreshSwagger()
  @UserAuth('refresh')
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refresh_token = req[process.env.REFRESH_TOKEN_NAME!] as string
    const tokens = await this.authService.refresh(refresh_token)
    this.tokenService.setAuthCookies(res, tokens.access_token, tokens.refresh_token)
  }

  /** Runs the get me operation. */
  @AuthMeSwagger()
  @UserAuth()
  @Get('me')
  async getMe(@Req() req: Request) {
    const user = req.user as UserEntity
    return await this.userService.findSelfById(user.id)
  }

  /** Runs the forgot password operation. */
  @AuthForgotPasswordSwagger()
  @HttpCode(200)
  @Post('forgot-password')
  async forgotPassword(
    @Body(new ZodValidationPipe(ForgotPasswordSchema)) dto: UserForgotPasswordDto,
  ) {
    await this.authService.forgotPassword(dto.email)
  }

  /** Runs the reset password operation. */
  @AuthResetPasswordSwagger()
  @HttpCode(200)
  @Post('reset-password')
  async resetPassword(@Body(new ZodValidationPipe(ResetPasswordSchema)) dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password)
  }

  /** Confirms a newly registered user's email address. */
  @HttpCode(200)
  @Post('verify-email')
  async verifyEmail(@Body(new ZodValidationPipe(VerifyEmailSchema)) dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto.token)
  }

  /** Reissues a verification email without exposing account existence. */
  @HttpCode(200)
  @Post('verify-email/resend')
  async resendEmailVerification(
    @Body(new ZodValidationPipe(ResendEmailVerificationSchema)) dto: ResendEmailVerificationDto,
  ) {
    await this.authService.resendEmailVerification(dto.email)
  }

  /** Lists the current user's active sessions. */
  @UserAuth()
  @Get('sessions')
  getSessions(@Req() req: UserAuthRequest) {
    const accessToken = req[this.tokenService.getTokenName('access')] as string | undefined
    return this.authService.getSessions(req.user.id, accessToken)
  }

  /** Revokes an individual session owned by the current user. */
  @UserAuth()
  @Delete('sessions/:id')
  async revokeSession(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: string) {
    await this.authService.revokeSession(req.user.id, id)
  }

  /** Revokes every session except the current browser session. */
  @UserAuth()
  @Delete('sessions')
  async revokeOtherSessions(@Req() req: UserAuthRequest) {
    const accessToken = req[this.tokenService.getTokenName('access')] as string
    await this.authService.revokeOtherSessions(req.user.id, accessToken)
  }

  /** Runs the two factor setup operation. */
  @TwoFactorSetupSwagger()
  @UserAuth()
  @Post('2fa/setup')
  async twoFactorSetup(@Req() req: UserAuthRequest) {
    return await this.twoFactorService.setupTwoFactor(req.user.id)
  }

  /** Runs the two factor enable operation. */
  @TwoFactorEnableSwagger()
  @UserAuth()
  @HttpCode(200)
  @Post('2fa/enable')
  async twoFactorEnable(
    @Req() req: UserAuthRequest,
    @Body(new ZodValidationPipe(TwoFactorCodeSchema)) dto: TwoFactorCodeDto,
  ) {
    await this.twoFactorService.enableTwoFactor(req.user.id, dto.code)
  }

  /** Runs the two factor disable operation. */
  @TwoFactorDisableSwagger()
  @UserAuth()
  @HttpCode(200)
  @Delete('2fa/disable')
  async twoFactorDisable(
    @Req() req: UserAuthRequest,
    @Body(new ZodValidationPipe(TwoFactorCodeSchema)) dto: TwoFactorCodeDto,
  ) {
    await this.twoFactorService.disableTwoFactor(req.user.id, dto.code)
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
    const user = await this.twoFactorService.verifyLoginCode(pendingToken, dto.code)
    const { access_token, refresh_token } = await this.authService.completeTwoFactorLogin(user.id)
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
      return res.redirect(
        `${this.config.getOrThrow('web').userHost}/login?error=oauth_state_mismatch`,
      )
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
      return res.redirect(
        `${this.config.getOrThrow('web').userHost}/login?error=oauth_state_mismatch`,
      )
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
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 10 * 60 * 1000,
      })
      return res.redirect(`${this.config.getOrThrow('web').userHost}/login/2fa`)
    }
    this.tokenService.setAuthCookies(res, result.access_token, result.refresh_token)
    return res.redirect(this.config.getOrThrow('web').userHost)
  }
}
