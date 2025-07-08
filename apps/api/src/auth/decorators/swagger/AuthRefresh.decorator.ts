import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger'

export function AuthRefreshSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Refresh access token' }),
    ApiResponse({
      status: HttpStatus.CREATED,
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
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Refresh token not provided'
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid or expired refresh token'
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Server error'
    }),
    ApiCookieAuth(process.env.REFRESH_TOKEN_NAME)
  )
}
