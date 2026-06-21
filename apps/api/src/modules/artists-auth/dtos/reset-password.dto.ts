import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The reset password schema value. */
export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(32, { message: 'Password must not exceed 32 characters' }),
})

/** Represents the reset password dto. */
export class ResetPasswordDto {
  /** The token value. */
  @ApiProperty({ example: 'a3f2c1...' })
  token: string

  /** The password value. */
  @ApiProperty({ example: 'newSecurePassword123' })
  password: string
}
