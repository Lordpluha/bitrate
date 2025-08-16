import { ApiProperty } from '@nestjs/swagger'
import { LoginSchema } from './login.dto'
import { UserEntity } from 'src/users/entities'
import z from 'zod'

export const RegistrationSchema = LoginSchema.extend({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .max(20, { message: 'Username must not exceed 20 characters' })
})

export class RegistrationDto implements z.infer<typeof RegistrationSchema> {
  @ApiProperty({
    description: 'New user email',
    example: 'newuser@example.com'
  })
  email: UserEntity['email']

  @ApiProperty({ description: 'New user password', example: 'password123' })
  password: UserEntity['password']

  @ApiProperty({
    description: 'New user username',
    example: 'newuser123'
  })
  username: UserEntity['username']
}
