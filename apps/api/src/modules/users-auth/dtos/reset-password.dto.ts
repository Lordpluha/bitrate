import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(32, { message: 'Password must not exceed 32 characters' }),
})

export class ResetPasswordDto {
  @ApiProperty({ example: 'a3f2c1...' })
  token: string

  @ApiProperty({ example: 'newSecurePassword123' })
  password: string
}
