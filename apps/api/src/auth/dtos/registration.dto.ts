import { ApiProperty } from '@nestjs/swagger'
import { LoginSchema } from './login.dto'
import { UserEntity } from 'src/users/entities'

export const RegistrationSchema = LoginSchema

export class RegistrationDto {
  @ApiProperty({
    description: 'New user email',
    example: 'newuser@example.com'
  })
  email: UserEntity['email']

  @ApiProperty({ description: 'New user password', example: 'password123' })
  password: UserEntity['password']
}
