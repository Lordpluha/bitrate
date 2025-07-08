import { ApiProperty } from '@nestjs/swagger'
import { UserEntity } from 'src/users/entities'

export class LoginDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: UserEntity['email']

  @ApiProperty({ description: 'User password', example: 'password123' })
  password: UserEntity['password']
}
