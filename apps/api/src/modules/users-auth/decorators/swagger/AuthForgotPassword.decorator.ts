import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { UserForgotPasswordDto } from '../../dtos'

/** Runs the auth forgot password swagger operation. */
export function AuthForgotPasswordSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Send password reset email' }),
    ApiConsumes('application/json'),
    ApiBody({ type: UserForgotPasswordDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Reset email sent if account exists (no-op otherwise)',
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' }),
  )
}
