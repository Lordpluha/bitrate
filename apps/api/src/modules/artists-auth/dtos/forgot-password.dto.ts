import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'
import { ArtistEmailSchema } from './login.dto'

/** The forgot password schema value. */
export const ForgotPasswordSchema = z.object({
  email: ArtistEmailSchema,
})

/** Represents the forgot password dto. */
export class ArtistForgotPasswordDto {
  /** The email value. */
  @ApiProperty({ example: 'artist@example.com' })
  email: string
}
