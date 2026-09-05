import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** Runs the email availability swagger operation. */
export function EmailAvailabilitySwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Check whether an artist email is already registered' }),
    ApiQuery({ name: 'email', type: 'string' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Whether the email is available',
      schema: { properties: { available: { type: 'boolean' } } },
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Email query param missing' }),
  )
}
