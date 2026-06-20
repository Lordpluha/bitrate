import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { TwoFactorVerifyLoginDto } from '../../dtos'

export function TwoFactorVerifyLoginSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Complete 2FA login',
      description:
        'Exchange the pending 2FA session token and a TOTP code for full session cookies.',
    }),
    ApiConsumes('application/json'),
    ApiBody({ type: TwoFactorVerifyLoginDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Authenticated — sets access_token and refresh_token cookies',
      headers: {
        'Set-Cookie': {
          description: 'HttpOnly cookies: access_token and refresh_token',
          schema: {
            type: 'string',
            example: 'access_token=<jwt>; HttpOnly; Path=/; SameSite=Lax;',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid or expired pending token / TOTP code',
    }),
  )
}
