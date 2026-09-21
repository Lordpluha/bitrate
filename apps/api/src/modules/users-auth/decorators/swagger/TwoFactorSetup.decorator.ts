import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'
import { UserTwoFactorSetupEntity } from '../../entities'

/** Runs the two factor setup swagger operation. */
export function TwoFactorSetupSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Start 2FA enrollment — returns QR code and manual secret' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'QR code data URL and manual TOTP secret',
      type: UserTwoFactorSetupEntity,
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '2FA is already enabled' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
  )
}
