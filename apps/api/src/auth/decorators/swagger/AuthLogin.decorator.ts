import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse
} from '@nestjs/swagger'
import { LoginDto } from '../../dtos'

export function AuthLoginSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'User login' }),
    ApiConsumes('application/json'),
    ApiBody({ type: LoginDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
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
    }),
    ApiResponse({
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
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid credentials'
    })
  )
}
