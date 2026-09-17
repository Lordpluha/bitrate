import { AUTH_ROUTE_THROTTLE } from '@common/config'
import { TokenService } from '@modules/tokens/token.service'
import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type { Request, Response } from 'express'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminAuth, AdminRefreshAuth } from './admin-auth.guard'
import { AdminAuthService } from './admin-auth.service'
import {
  AuthLoginSwagger,
  AuthLogoutSwagger,
  AuthMeSwagger,
  AuthRefreshSwagger,
} from './decorators'
import { type LoginDto, LoginSchema } from './dtos'
import { StaffEntity, StaffSessionEntity } from './entities'
import type { AdminAuthRequest } from './types'

/** Represents the staff (operator) auth controller. There is no registration — accounts are provisioned manually. */
@ApiExtraModels(StaffEntity, StaffSessionEntity)
@ApiTags('Admin Auth')
@Throttle(AUTH_ROUTE_THROTTLE)
@Controller({ path: 'admin/auth', version: '1' })
export class AdminAuthController {
  constructor(
    private adminAuthService: AdminAuthService,
    private tokenService: TokenService,
  ) {}

  /** Runs the login operation. */
  @AuthLoginSwagger()
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.adminAuthService.loginStaff(loginDto.email, loginDto.password)
    this.tokenService.setAuthCookies(res, tokens.access_token, tokens.refresh_token)
  }

  /** Runs the logout operation. */
  @AuthLogoutSwagger()
  @AdminAuth()
  @Post('logout')
  async logout(@Req() req: AdminAuthRequest & Request, @Res({ passthrough: true }) res: Response) {
    const access_token = req[process.env.ACCESS_TOKEN_NAME!] as string
    await this.adminAuthService.logout(req.staff.id, access_token)
    this.tokenService.clearAuthCookies(res)
  }

  /** Runs the refresh operation. */
  @AuthRefreshSwagger()
  @AdminRefreshAuth()
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refresh_token = req[process.env.REFRESH_TOKEN_NAME!] as string
    const tokens = await this.adminAuthService.refresh(refresh_token)
    this.tokenService.setAuthCookies(res, tokens.access_token, tokens.refresh_token)
  }

  /** Runs the get me operation. */
  @AuthMeSwagger()
  @AdminAuth()
  @Get('me')
  async getMe(@Req() req: AdminAuthRequest) {
    return await this.adminAuthService.me(req.staff.id)
  }
}
