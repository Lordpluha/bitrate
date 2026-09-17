import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { LoginDto } from '../../dtos'

/** Runs the auth login swagger operation. */
export function AuthLoginSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Staff login' }),
    ApiConsumes('application/json'),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Logged in — sets access_token and refresh_token cookies, no body.',
      headers: {
        'Set-Cookie': {
          description: 'HttpOnly cookies: access_token and refresh_token',
          schema: {
            type: 'string',
            example:
              'access_token=<jwt>; HttpOnly; Path=/; SameSite=Lax;\nrefresh_token=<jwt>; HttpOnly; Path=/; SameSite=Lax;',
          },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' }),
    ApiResponse({
      status: HttpStatus.TOO_MANY_REQUESTS,
      description: 'Account is temporarily locked',
    }),
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
