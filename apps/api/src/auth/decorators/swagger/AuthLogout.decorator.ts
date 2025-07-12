import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger'

export function AuthLogoutSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'User logout' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Successfully logged out'
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized'
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Server error'
    }),
    ApiCookieAuth(process.env.ACCESS_TOKEN_NAME)
  )
}
