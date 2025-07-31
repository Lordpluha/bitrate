import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger'

export function AuthLogoutSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'User logout' }),
    ApiCookieAuth(process.env.ACCESS_TOKEN_NAME),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Successfully logged out'
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized'
    })
  )
}
