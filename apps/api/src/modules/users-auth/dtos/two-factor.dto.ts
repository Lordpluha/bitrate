import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The two factor code schema value. */
export const TwoFactorCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be exactly 6 digits')
    .regex(/^\d+$/, 'Code must be numeric'),
})

/** Represents the two factor code dto. */
export class TwoFactorCodeDto {
  /** The code value. */
  @ApiProperty({ example: '123456', description: '6-digit TOTP code' })
  code: string
}

/** The two factor verify login schema value. */
export const TwoFactorVerifyLoginSchema = z.object({
  pendingToken: z.string().min(1),
  code: z.string().length(6).regex(/^\d+$/),
})

/** Represents the two factor verify login dto. */
export class TwoFactorVerifyLoginDto {
  /** The pending token value. */
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiJ9...',
    description: 'Pending 2FA session token from login',
  })
  pendingToken: string

  /** The code value. */
  @ApiProperty({ example: '123456', description: '6-digit TOTP code' })
  code: string
}
