import { EmailSchema } from '@common/email'
import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The forgot password schema value. */
export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
})

/** Represents the forgot password dto. */
export class ArtistForgotPasswordDto {
  /** The email value. */
  @ApiProperty({ example: 'artist@example.com' })
  email: string
}
