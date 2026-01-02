import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(32, { message: 'Password must not exceed 32 characters' }),
})

export class LoginDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string

  @ApiProperty({ description: 'User password', example: 'password123' })
  password: string
}
