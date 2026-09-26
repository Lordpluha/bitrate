import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { ResendArtistEmailDto } from '../../dtos'

/** Reissues an artist verification email. Always returns 200, whether or not the account exists. */
export function AuthVerifyEmailResendSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Resend the artist email verification message',
      description:
        'Never reveals whether the email belongs to an account, and is a no-op when the account is already verified.',
    }),
    ApiBody({ type: ResendArtistEmailDto }),
    ApiResponse({ status: HttpStatus.OK, description: 'Verification email sent, if applicable' }),
  )
}
