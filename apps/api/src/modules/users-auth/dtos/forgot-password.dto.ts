import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The forgot password schema value. */
export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
})

/** Represents the forgot password dto. */
export class UserForgotPasswordDto {
  /** The email value. */
  @ApiProperty({ example: 'user@example.com' })
  email: string
}
