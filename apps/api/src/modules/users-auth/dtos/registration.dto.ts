import type { UserEntity } from '@modules/users'
import { ApiProperty } from '@nestjs/swagger'
import z from 'zod'
import { LoginSchema } from './login.dto'

/** The registration schema value. */
export const RegistrationSchema = LoginSchema.extend({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' })
    .max(20, { message: 'Username must not exceed 20 characters' }),
})

/** Represents the registration dto. */
export class RegistrationDto implements z.infer<typeof RegistrationSchema> {
  /** The email value. */
  @ApiProperty({
    description: 'New user email',
    example: 'newuser@example.com',
  })
  email: UserEntity['email']

  /** The password value. */
  @ApiProperty({ description: 'New user password', example: 'password123' })
  password: string

  /** The username value. */
  @ApiProperty({
    description: 'New user username',
    example: 'newuser123',
  })
  username: UserEntity['username']
}
