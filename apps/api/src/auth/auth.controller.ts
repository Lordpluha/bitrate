import { Request, Response } from 'express'
import { AuthService } from './auth.service'
import { User } from '@prisma/client'
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
import { LoginDto, RegistrationDto } from '@spotify/contracts'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @ApiConsumes('application/json')
  @ApiBody({ type: [LoginDto] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged in',
    content: {
      'application/json': { example: { status: 'ok' } }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: ['email must be an email'],
          error: 'Bad Request'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
    content: {
      'application/json': {
        example: { statusCode: 401, message: 'Invalid credentials' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Server error'
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: Pick<User, 'email' | 'password'>,
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
    return { status: 'ok' }
  }

  @ApiOperation({ summary: 'User registration' })
  @ApiConsumes('application/json')
  @ApiBody({ type: [RegistrationDto] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully registered',
    content: {
      'application/json': { example: { status: 200 } }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: ['email must be an email'],
          error: 'Bad Request'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already exists',
    content: {
      'application/json': {
        example: { statusCode: 409, message: 'User already exists' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Server error'
  })
  @HttpCode(HttpStatus.OK)
  @Post('registration')
  async registration(@Body() registrationDto: Omit<User, 'id' | 'createdAt'>) {
    await this.authService.registration(registrationDto)
    return { status: HttpStatus.OK }
  }

  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully logged out',
    content: {
      'application/json': { example: { status: 'logged out' } }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Server error'
  })
  @ApiCookieAuth('access_token')
  @ApiCookieAuth('refresh_token')
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    await this.authService.logout()
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    return { status: 'logged out' }
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed',
    content: {
      'application/json': { example: { status: 'token refreshed' } }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Refresh token not provided',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: 'refresh token is not provided, please login again'
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired refresh token',
    content: {
      'application/json': {
        example: {
          statusCode: 401,
          message: 'Invalid or expired refresh token'
        }
      }
    }
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
    const refresh_token = req.cookies[process.env.REFRESH_TOKEN_NAME!] as string
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
    return { status: 'token refreshed' }
  }
}
