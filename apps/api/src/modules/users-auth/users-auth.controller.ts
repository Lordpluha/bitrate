import { UserEntity } from '@modules/users'
import { UsersService } from '@modules/users/users.service'
import { Body, Controller, Delete, Get, HttpCode, Post, Query, Req, Res } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
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
  ForgotPasswordDto,
  ForgotPasswordSchema,
  LoginDto,
  LoginSchema,
  RegistrationDto,
  RegistrationSchema,
  ResetPasswordDto,
  ResetPasswordSchema,
  TwoFactorCodeDto,
  TwoFactorCodeSchema,
  TwoFactorVerifyLoginDto,
  TwoFactorVerifyLoginSchema,
} from './dtos'
import { UserSessionEntity } from './entities'
import { OAuthService } from './oauth.service'
import { TwoFactorService } from './two-factor.service'
import type { UserAuthRequest } from './types'
import { UserAuthService } from './user-auth.service'
import { UserAuth } from './users-auth.guard'

@ApiExtraModels(UserSessionEntity)
@ApiTags('Users Auth')
@Controller('auth')
export class UsersAuthController {
  constructor(
    private authService: UserAuthService,
    private oauthService: OAuthService,
    private twoFactorService: TwoFactorService,
    private userService: UsersService,
    private tokenService: TokenService,
  ) {}

  @AuthLoginSwagger()
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginUser(loginDto.email, loginDto.password)
    if ('requires2fa' in result) {
      return { requires2fa: true, pendingToken: result.pendingToken }
    }
    this.tokenService.setAuthCookies(res, result.access_token, result.refresh_token)
  }

  @AuthRegistrationSwagger()
  @Post('registration')
  async registration(
    @Body(new ZodValidationPipe(RegistrationSchema))
    registrationDto: RegistrationDto,
  ) {
    await this.authService.registerUser(registrationDto)
  }

  @AuthLogoutSwagger()
  @UserAuth()
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req['user'] as UserEntity
    const access_token = req[process.env.ACCESS_TOKEN_NAME!] as string
    await this.authService.logout(user.id, access_token)
    this.tokenService.clearAuthCookies(res)
  }

  @AuthRefreshSwagger()
  @UserAuth('refresh')
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refresh_token = req[process.env.REFRESH_TOKEN_NAME!] as string
    const { access_token } = await this.authService.refresh(refresh_token)
    this.tokenService.setAuthCookies(res, access_token, refresh_token)
  }

  @AuthMeSwagger()
  @UserAuth()
  @Get('me')
  async getMe(@Req() req: Request) {
    const user = req['user'] as UserEntity
    return await this.userService.findById(user.id)
  }

  @AuthForgotPasswordSwagger()
  @HttpCode(200)
  @Post('forgot-password')
  async forgotPassword(@Body(new ZodValidationPipe(ForgotPasswordSchema)) dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email)
  }

  @AuthResetPasswordSwagger()
  @HttpCode(200)
  @Post('reset-password')
  async resetPassword(@Body(new ZodValidationPipe(ResetPasswordSchema)) dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password)
  }

  @TwoFactorSetupSwagger()
  @UserAuth()
  @Post('2fa/setup')
  async twoFactorSetup(@Req() req: UserAuthRequest) {
    return await this.twoFactorService.setupTwoFactor(req.user.id)
  }

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

  @TwoFactorVerifyLoginSwagger()
  @HttpCode(200)
  @Post('2fa/verify-login')
  async twoFactorVerifyLogin(
    @Body(new ZodValidationPipe(TwoFactorVerifyLoginSchema)) dto: TwoFactorVerifyLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.twoFactorService.verifyLoginCode(dto.pendingToken, dto.code)
    const { access_token, refresh_token } = await this.authService.completeTwoFactorLogin(user.id)
    this.tokenService.setAuthCookies(res, access_token, refresh_token)
  }

  @OAuthGoogleSwagger()
  @Get('oauth/google')
  googleAuth(@Res() res: Response) {
    const state = this.oauthService.generateState()
    res.cookie('oauth_state', state, { httpOnly: true, sameSite: 'lax', maxAge: 5 * 60 * 1000 })
    return res.redirect(this.oauthService.getGoogleAuthUrl(state))
  }

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

  @OAuthFacebookSwagger()
  @Get('oauth/facebook')
  facebookAuth(@Res() res: Response) {
    const state = this.oauthService.generateState()
    res.cookie('oauth_state', state, { httpOnly: true, sameSite: 'lax', maxAge: 5 * 60 * 1000 })
    return res.redirect(this.oauthService.getFacebookAuthUrl(state))
  }

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

  private handleOAuthResult(
    result:
      | { access_token: string; refresh_token: string }
      | { requires2fa: true; pendingToken: string },
    res: Response,
  ) {
    if ('requires2fa' in result) {
      return res.redirect(
        `${process.env.WEB_HOST!}/login/2fa?pending_token=${encodeURIComponent(result.pendingToken)}`,
      )
    }
    this.tokenService.setAuthCookies(res, result.access_token, result.refresh_token)
    return res.redirect(process.env.WEB_HOST!)
  }
}
