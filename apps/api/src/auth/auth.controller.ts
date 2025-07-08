import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Res,
  Req
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiCookieAuth
} from '@nestjs/swagger'
import { LoginDto } from './login.dto'
import { RegistrationDto } from './registration.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @ApiConsumes('application/json')
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged in',
    headers: {
      'Set-Cookie': {
        description: 'HttpOnly cookies: access_token и refresh_token',
        schema: {
          type: 'string',
          example:
            'access_token=<jwt>; HttpOnly; Path=/; SameSite=Lax;\nrefresh_token=<jwt>; HttpOnly; Path=/; SameSite=Lax;'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
    content: {
      'application/json': {
        example: {
          errors: [
            {
              field: 'email',
              message: 'email must be an email'
            }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials'
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Server error'
  })
  @HttpCode(HttpStatus.OK)
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
  }

  @ApiOperation({ summary: 'User registration' })
  @ApiConsumes('application/json')
  @ApiBody({ type: RegistrationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully registered'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
    content: {
      'application/json': {
        example: {
          errors: [{ field: 'email', message: 'email must be an email' }]
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already exists'
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Server error'
  })
  @HttpCode(HttpStatus.OK)
  @Post('registration')
  async registration(@Body() registrationDto: RegistrationDto) {
    await this.authService.registration(registrationDto)
  }

  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged out'
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Server error'
  })
  @ApiCookieAuth('access_token')
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    await this.authService.logout()
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    return res
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed',
    headers: {
      'Set-Cookie': {
        description: 'HttpOnly cookies: access_token',
        schema: {
          type: 'string',
          example: 'access_token=<jwt>; HttpOnly; Path=/; SameSite=Lax;'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Refresh token not provided'
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired refresh token'
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Server error'
  })
  @ApiCookieAuth('refresh_token')
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refresh_token = req.cookies?.[process.env.REFRESH_TOKEN_NAME!] as string
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
  }
}
