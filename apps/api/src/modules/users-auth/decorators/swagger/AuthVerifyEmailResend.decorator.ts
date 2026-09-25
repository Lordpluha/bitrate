import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { ResendEmailVerificationDto } from '../../dtos'

/** Reissues a verification email. Always returns 200, whether or not the account exists. */
export function AuthVerifyEmailResendSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Resend the email verification message',
      description:
        'Never reveals whether the email belongs to an account, and is a no-op when the account is already verified.',
    }),
    ApiBody({ type: ResendEmailVerificationDto }),
    ApiResponse({ status: HttpStatus.OK, description: 'Verification email sent, if applicable' }),
  )
}
