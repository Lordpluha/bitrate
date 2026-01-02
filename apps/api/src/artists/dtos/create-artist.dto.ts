import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const CreateArtistSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(32, { message: 'Password must not exceed 32 characters' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters long' }),
})

export class CreateArtistDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string

  @ApiProperty({ description: 'User password', example: 'password123' })
  password: string

  @ApiProperty({ description: 'User username', example: 'user123' })
  username: string
}
