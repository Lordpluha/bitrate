import { ApiProperty } from '@nestjs/swagger'

/** Returned when a user starts 2FA enrollment — the material needed to link an authenticator app. */
export class UserTwoFactorSetupEntity {
  /** Base64 data URL of a QR code encoding the TOTP enrollment URI, ready to render in an `<img>`. */
  @ApiProperty({ example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...' })
  qrCodeDataUrl: string

  /** The raw TOTP secret, for manual entry when the user cannot scan the QR code. */
  @ApiProperty({ example: 'JBSWY3DPEHPK3PXP' })
  manualCode: string
}
