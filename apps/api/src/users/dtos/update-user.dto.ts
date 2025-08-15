import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const UpdateUserSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' }),
  email: z.string().email({ message: 'Invalid email format' }),
  description: z
    .string()
    .max(500, { message: 'Description must not exceed 500 characters' })
    .optional()
})

export class UpdateUserDto implements z.infer<typeof UpdateUserSchema> {
  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe'
  })
  username: string

  @ApiProperty({
    description: 'Email of the user',
    example: 'example@gmail.com'
  })
  email: string

  @ApiProperty({
    description: 'Description of the user',
    example: 'This is a sample description',
    required: false
  })
  description?: string
}
