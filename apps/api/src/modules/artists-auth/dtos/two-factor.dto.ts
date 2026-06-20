import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const TwoFactorCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be exactly 6 digits')
    .regex(/^\d+$/, 'Code must be numeric'),
})

export class TwoFactorCodeDto {
  @ApiProperty({ example: '123456', description: '6-digit TOTP code' })
  code: string
}

export const TwoFactorVerifyLoginSchema = z.object({
  pendingToken: z.string().min(1),
  code: z.string().length(6).regex(/^\d+$/),
})

export class TwoFactorVerifyLoginDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiJ9...',
    description: 'Pending 2FA session token from login',
  })
  pendingToken: string

  @ApiProperty({ example: '123456', description: '6-digit TOTP code' })
  code: string
}
