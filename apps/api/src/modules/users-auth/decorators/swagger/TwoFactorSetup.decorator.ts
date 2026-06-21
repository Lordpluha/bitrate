import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiResponse } from '@nestjs/swagger'

/** Runs the two factor setup swagger operation. */
export function TwoFactorSetupSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Start 2FA enrollment — returns QR code and manual secret' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'QR code data URL and manual TOTP secret',
      schema: {
        type: 'object',
        properties: {
          qrCodeDataUrl: { type: 'string', description: 'Base64 data URL of QR code image' },
          manualCode: {
            type: 'string',
            description: 'TOTP secret for manual entry into authenticator app',
          },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '2FA is already enabled' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' }),
  )
}
