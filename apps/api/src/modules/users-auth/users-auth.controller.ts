import { UserEntity } from '@modules/users'
import { UsersService } from '@modules/users/users.service'
import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { ZodValidationPipe } from 'nestjs-zod'
import { TokenService } from '../tokens/token.service'
import {
  AuthLoginSwagger,
  AuthLogoutSwagger,
  AuthMeSwagger,
  AuthRefreshSwagger,
  AuthRegistrationSwagger,
} from './decorators'
import { LoginDto, LoginSchema, RegistrationDto, RegistrationSchema } from './dtos'
import { UserSessionEntity } from './entities'
import { UserAuthService } from './user-auth.service'
import { UserAuth } from './users-auth.guard'

@ApiExtraModels(UserSessionEntity)
@ApiTags('Users Auth')
@Controller('auth')
export class UsersAuthController {
  constructor(
    private authService: UserAuthService,
    private userService: UsersService,
    private tokenService: TokenService,
  ) {}

  @AuthLoginSwagger()
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } = await this.authService.loginUser(
      loginDto.email,
      loginDto.password,
    )

    this.tokenService.setAuthCookies(res, access_token, refresh_token)
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
}
