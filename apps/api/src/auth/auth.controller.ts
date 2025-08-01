import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  Get
} from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import {
  LoginDto,
  LoginSchema,
  RegistrationDto,
  RegistrationSchema
} from './dtos'
import {
  AuthLoginSwagger,
  AuthLogoutSwagger,
  AuthRefreshSwagger,
  AuthRegistrationSwagger,
  AuthMeSwagger
} from './decorators'
import { SessionEntity } from './entities'
import { ZodValidationPipe } from 'nestjs-zod'
import { AuthGuard } from './auth.guard'
import { JWTPayload } from './types'
import { RefreshGuard } from './refresh.guard'
import { UsersService } from 'src/users/users.service'
import { TokenService } from './token.service'

@ApiExtraModels(SessionEntity)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private tokenService: TokenService
  ) {}

  @AuthLoginSwagger()
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { access_token, refresh_token } = await this.authService.loginUser(
      loginDto.email,
      loginDto.password
    )

    this.tokenService.setAuthCookies(res, access_token, refresh_token)
  }

  @AuthRegistrationSwagger()
  @Post('registration')
  async registration(
    @Body(new ZodValidationPipe(RegistrationSchema))
    registrationDto: RegistrationDto
  ) {
    await this.authService.registerUser(registrationDto)
  }

  @AuthLogoutSwagger()
  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req['user'] as JWTPayload
    await this.authService.logout(
      user.sub,
      req[process.env.REFRESH_TOKEN_NAME!] as string
    )
    this.tokenService.clearAuthCookies(res)
  }

  @AuthRefreshSwagger()
  @UseGuards(RefreshGuard)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refresh_token = req[process.env.REFRESH_TOKEN_NAME!] as string
    const { access_token } = await this.authService.refresh(refresh_token)
    this.tokenService.setAuthCookies(res, access_token, refresh_token)
  }

  @AuthMeSwagger()
  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const jwtUser = req['user'] as JWTPayload
    const user = await this.userService.findById(jwtUser.sub)
    return user
  }
}
