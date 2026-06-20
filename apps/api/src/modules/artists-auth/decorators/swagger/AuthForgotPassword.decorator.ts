import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { ForgotPasswordDto } from '../../dtos'

export function AuthForgotPasswordSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Send artist password reset email' }),
    ApiConsumes('application/json'),
    ApiBody({ type: ForgotPasswordDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Reset email sent if account exists (no-op otherwise)',
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' }),
  )
}
