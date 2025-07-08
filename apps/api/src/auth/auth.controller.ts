import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { Controller, Post, Body, Res, Req, BadRequestException } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { LoginDto, RegistrationDto } from './dtos'
import {
  AuthLoginSwagger,
  AuthLogoutSwagger,
  AuthRefreshSwagger,
  AuthRegistrationSwagger
} from './decorators'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @AuthLoginSwagger()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { access_token, refresh_token } = await this.authService.login(
      loginDto.email,
      loginDto.password
    )
    res.cookie(process.env.ACCESS_TOKEN_NAME!, access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })
    res.cookie(process.env.REFRESH_TOKEN_NAME!, refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })
  }

  @AuthRegistrationSwagger()
  @Post('registration')
  async registration(@Body() registrationDto: RegistrationDto) {
    await this.authService.registration(registrationDto)
  }

  @AuthLogoutSwagger()
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    await this.authService.logout()
    res.clearCookie(process.env.ACCESS_TOKEN_NAME!)
    res.clearCookie(process.env.REFRESH_TOKEN_NAME!)
    return res
  }

  @AuthRefreshSwagger()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refresh_token = req.cookies?.[
      process.env.REFRESH_TOKEN_NAME!
    ] as string
    if (!refresh_token) {
      throw new BadRequestException('Refresh token not provided, please login again')
    }
    const { access_token } = await this.authService.refresh(refresh_token)

    res.cookie(process.env.ACCESS_TOKEN_NAME!, access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })
    res.cookie(process.env.REFRESH_TOKEN_NAME!, refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })
    return res
  }
}
