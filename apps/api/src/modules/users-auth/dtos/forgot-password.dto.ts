import { EmailSchema } from '@common/email'
import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The forgot password schema value. */
export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
})

/** Represents the forgot password dto. */
export class UserForgotPasswordDto {
  /** The email value. */
  @ApiProperty({ example: 'user@example.com' })
  email: string
}
