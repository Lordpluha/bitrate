import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { VerifyArtistEmailCodeDto } from '../../dtos'

export function AuthVerifyEmailCodeSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Verify the artist email with a six-digit code' }),
    ApiBody({ type: VerifyArtistEmailCodeDto }),
    ApiResponse({ status: HttpStatus.OK, description: 'Email verified' }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid, expired or exhausted code',
    }),
  )
}
