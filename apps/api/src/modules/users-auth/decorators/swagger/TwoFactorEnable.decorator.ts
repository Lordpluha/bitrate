import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { TwoFactorCodeDto } from '../../dtos'

/** Runs the two factor enable swagger operation. */
export function TwoFactorEnableSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Confirm 2FA enrollment with a TOTP code' }),
    ApiConsumes('application/json'),
    ApiBody({ type: TwoFactorCodeDto }),
    ApiResponse({ status: HttpStatus.OK, description: '2FA enabled' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '2FA setup not started' }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Invalid TOTP code or not authenticated',
    }),
  )
}
