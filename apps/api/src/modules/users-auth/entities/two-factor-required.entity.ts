import { ApiProperty } from '@nestjs/swagger'

/** Returned by login instead of setting session cookies when 2FA is enabled. */
export class TwoFactorRequiredEntity {
  /** Always true — signals the client must complete the 2FA challenge. */
  @ApiProperty({ example: true })
  requires2fa: true

  /** Short-lived token identifying the pending login, submitted with the 2FA code. */
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...' })
  pendingToken: string
}
