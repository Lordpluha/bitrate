import { applyDecorators, HttpStatus } from '@nestjs/common'
import {
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse
} from '@nestjs/swagger'
import { RegistrationDto } from '../../dtos'

export function AuthRegistrationSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'User registration' }),
    ApiConsumes('application/json'),
    ApiBody({ type: RegistrationDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Successfully registered'
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      content: {
        'application/json': {
          example: {
            errors: [{ field: 'email', message: 'email must be an email' }]
          }
        }
      }
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'User already exists'
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Server error'
    })
  )
}
