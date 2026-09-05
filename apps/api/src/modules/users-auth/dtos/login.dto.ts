import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The login schema value. */
export const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(32, { message: 'Password must not exceed 32 characters' }),
})

/** Represents the login dto. */
export class LoginDto {
  /** The email value. */
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string

  /** The password value. */
  @ApiProperty({ description: 'User password', example: 'password123' })
  password: string
}
