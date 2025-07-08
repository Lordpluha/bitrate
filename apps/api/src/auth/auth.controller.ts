import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { Controller, Post, Body, Res, Req } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { LoginDto } from './login.dto'
import { RegistrationDto } from './registration.dto'
import {
  ApiAuthLogin,
  ApiAuthLogout,
  ApiAuthRefresh,
  ApiAuthRegistration
} from './decorators'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiAuthLogin()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { access_token, refresh_token } = await this.authService.login(
      loginDto.email,
      loginDto.password
    )
    res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })
    return res
  }

  @ApiAuthRegistration()
  @Post('registration')
  async registration(@Body() registrationDto: RegistrationDto) {
    await this.authService.registration(registrationDto)
  }

  @ApiAuthLogout()
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    await this.authService.logout()
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    return res
  }

  @ApiAuthRefresh()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refresh_token = req.cookies?.[
      process.env.REFRESH_TOKEN_NAME!
    ] as string
    if (!refresh_token) {
      throw new Error('refresh token is not provided, please login again')
    }
    const { access_token } = await this.authService.refresh(refresh_token)

    res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })
    return res
  }
}
