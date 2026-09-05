import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { LoginDto } from '../../dtos'

/** Runs the auth login swagger operation. */
export function AuthLoginSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Artist login' }),
    ApiConsumes('application/json'),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description:
        'Logged in. If 2FA is not enabled: sets access_token and refresh_token cookies, no body. If 2FA is enabled: returns JSON with requires2fa and pendingToken — no cookies yet.',
      headers: {
        'Set-Cookie': {
          description:
            'HttpOnly cookies: access_token and refresh_token (only when 2FA is not required)',
          schema: {
            type: 'string',
            example:
              'access_token=<jwt>; HttpOnly; Path=/; SameSite=Lax;\nrefresh_token=<jwt>; HttpOnly; Path=/; SameSite=Lax;',
          },
        },
      },
      content: {
        'application/json': {
          examples: {
            twoFactorRequired: {
              summary: '2FA required',
              value: { requires2fa: true, pendingToken: 'eyJhbGciOiJIUzI1NiJ9...' },
            },
          },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      content: {
        'application/json': {
          example: { errors: [{ field: 'email', message: 'email must be an email' }] },
        },
      },
    }),
  )
}
