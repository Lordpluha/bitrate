import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { ResendArtistEmailDto } from '../../dtos'
import { ArtistEmailDeliveryEntity } from '../../entities'

/** Reissues a verification email without revealing whether the account exists. */
export function AuthVerifyEmailResendSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Resend the artist email verification message',
      description:
        'Never reveals whether the email belongs to an account, and is a no-op when the account is already verified.',
    }),
    ApiBody({ type: ResendArtistEmailDto }),
    ApiResponse({
      status: HttpStatus.OK,
      type: ArtistEmailDeliveryEntity,
      description: 'Mail transport mode, not a delivery receipt',
    }),
    ApiResponse({
      status: HttpStatus.TOO_MANY_REQUESTS,
      description: 'Wait 60 seconds before resending',
    }),
  )
}
