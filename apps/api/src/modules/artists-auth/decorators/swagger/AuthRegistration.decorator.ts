import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { ArtistRegistrationDto } from '../../dtos'
import { ArtistRegistrationEntity } from '../../entities'

/** Runs the auth registration swagger operation. */
export function AuthRegistrationSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Artist registration' }),
    ApiConsumes('application/json'),
    ApiBody({ type: ArtistRegistrationDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Successfully registered',
      type: ArtistRegistrationEntity,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Validation error',
      content: {
        'application/json': {
          example: {
            errors: [{ field: 'email', message: 'email must be an email' }],
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'User already exists',
    }),
    ApiResponse({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      description: 'Email verification cannot be delivered; no account was created',
    }),
  )
}
