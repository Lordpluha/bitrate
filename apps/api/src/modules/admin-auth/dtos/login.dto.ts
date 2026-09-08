import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The login schema value. */
export const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(64, { message: 'Password must not exceed 64 characters' }),
})

/** Represents the staff login dto. */
export class LoginDto {
  /** The email value. */
  @ApiProperty({ description: 'Staff email', example: 'ops@bitrate.app' })
  email: string

  /** The password value. */
  @ApiProperty({ description: 'Staff password', example: 'password123' })
  password: string
}
