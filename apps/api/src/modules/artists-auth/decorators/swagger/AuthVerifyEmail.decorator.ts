import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { VerifyArtistEmailDto } from '../../dtos'

/** Confirms a newly registered artist's email address using the emailed token. */
export function AuthVerifyEmailSwagger() {
  return applyDecorators(
    ApiOperation({ summary: "Verify the artist's email address" }),
    ApiBody({ type: VerifyArtistEmailDto }),
    ApiResponse({ status: HttpStatus.OK, description: 'Email verified' }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid or expired verification token',
    }),
  )
}
