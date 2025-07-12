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
  AuthRegistrationSwagger
} from './decorators'
import { SessionEntity } from './entities'
import { ZodValidationPipe } from 'nestjs-zod'
import { AuthGuard } from './auth.guard'
import { JWTPayload } from './types'
import { RefreshGuard } from './refresh.guard'
import { UsersService } from 'src/users/users.service'
import { AuthMeSwagger } from './decorators/swagger/AuthMe.decorator'
import { clearAuthCookies, setAuthCookies } from './jwt.utils'

@ApiExtraModels(SessionEntity)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService
  ) {}

  @AuthLoginSwagger()
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { access_token, refresh_token } = await this.authService.login(
      loginDto.email,
      loginDto.password
    )
    setAuthCookies(res, access_token, refresh_token)
  }

  @AuthRegistrationSwagger()
  @Post('registration')
  async registration(
    @Body(new ZodValidationPipe(RegistrationSchema))
    registrationDto: RegistrationDto
  ) {
    await this.authService.registration(registrationDto)
  }

  @AuthLogoutSwagger()
  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req['user'] as JWTPayload
    await this.authService.logout(user.sub, req[process.env.REFRESH_TOKEN_NAME!] as string)
    clearAuthCookies(res)
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
    setAuthCookies(res, access_token, refresh_token)
  }

  @AuthMeSwagger()
  @UseGuards(AuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const user = req['user'] as JWTPayload
    const me = await this.userService.findUserById(user.sub)
    return me
  }
}
