import { SelfUserEntity } from '@modules/users'
import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { LegalAcceptanceDto } from '../../dtos'

/** Runs the auth legal accept swagger operation. */
export function AuthLegalAcceptSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Accept the current legal documents',
      description:
        'Records the current Terms of Use, Community Guidelines and Privacy Policy revision for the signed-in account. Used when `legalAcceptanceRequired` is true on the account.',
    }),
    ApiBody({ type: LegalAcceptanceDto, required: true }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'The signed-in account with the acceptance recorded',
      type: SelfUserEntity,
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Acceptance was not given' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
  )
}
