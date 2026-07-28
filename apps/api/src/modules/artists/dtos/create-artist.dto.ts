import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The create artist schema value. */
export const CreateArtistSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(32, { message: 'Password must not exceed 32 characters' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters long' }),
})

/** Represents the create artist dto. */
export class CreateArtistDto {
  /** The email value. */
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string

  /** The password value. */
  @ApiProperty({ description: 'User password', example: 'password123' })
  password: string

  /** The username value. */
  @ApiProperty({ description: 'User username', example: 'user123' })
  username: string
}
