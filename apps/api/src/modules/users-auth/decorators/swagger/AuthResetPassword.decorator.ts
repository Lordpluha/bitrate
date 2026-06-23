import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { ResetPasswordDto } from '../../dtos'

/** Runs the auth reset password swagger operation. */
export function AuthResetPasswordSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Reset password using a one-time token' }),
    ApiConsumes('application/json'),
    ApiBody({ type: ResetPasswordDto }),
    ApiResponse({ status: HttpStatus.OK, description: 'Password changed successfully' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid or expired token' }),
  )
}
