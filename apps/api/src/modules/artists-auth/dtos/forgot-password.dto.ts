import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The forgot password schema value. */
export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
})

/** Represents the forgot password dto. */
export class ForgotPasswordDto {
  /** The email value. */
  @ApiProperty({ example: 'artist@example.com' })
  email: string
}
