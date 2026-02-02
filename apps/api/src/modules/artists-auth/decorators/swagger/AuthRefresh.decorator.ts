import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

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
            example: 'access_token=<jwt>; HttpOnly; Path=/; SameSite=Lax;',
          },
        },
      },
    }),
  )
}
