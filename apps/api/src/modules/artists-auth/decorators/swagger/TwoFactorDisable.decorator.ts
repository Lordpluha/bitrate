import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { TwoFactorCodeDto } from '../../dtos'

/** Runs the two factor disable swagger operation. */
export function TwoFactorDisableSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Disable 2FA — requires current TOTP code to confirm' }),
    ApiConsumes('application/json'),
    ApiBody({ type: TwoFactorCodeDto }),
    ApiResponse({ status: HttpStatus.OK, description: '2FA disabled' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '2FA not enabled on this account' }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid TOTP code or not authenticated',
    }),
  )
}
