import { ApiProperty } from '@nestjs/swagger'
import { User } from '@prisma/client'

export class LoginDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: User['email']

  @ApiProperty({ description: 'User password', example: 'password123' })
  password: User['password']
}
