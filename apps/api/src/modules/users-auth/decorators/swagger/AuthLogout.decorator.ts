import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Runs the auth logout swagger operation. */
export function AuthLogoutSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'User logout' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Successfully logged out',
    }),
  )
}
