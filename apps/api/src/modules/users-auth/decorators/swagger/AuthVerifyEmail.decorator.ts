import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { VerifyEmailDto } from '../../dtos'

/** Confirms a newly registered user's email address using the emailed token. */
export function AuthVerifyEmailSwagger() {
  return applyDecorators(
    ApiOperation({ summary: "Verify the caller's email address" }),
    ApiBody({ type: VerifyEmailDto }),
    ApiResponse({ status: HttpStatus.OK, description: 'Email verified' }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid or expired verification token',
    }),
  )
}
