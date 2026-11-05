import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The login schema value. */
export const LoginSchema = z.object({
  email: z.email({ error: 'Invalid email format' }),
  password: z
    .string()
    .min(6, { error: 'Password must be at least 6 characters long' })
    .max(32, { error: 'Password must not exceed 32 characters' }),
})

/** Represents the artist login dto. */
export class ArtistLoginDto {
  /** The email value. */
  @ApiProperty({ description: 'Artist email', example: 'artist@example.com' })
  email: string

  /** The password value. */
  @ApiProperty({ description: 'User password', example: 'password123' })
  password: string
}
