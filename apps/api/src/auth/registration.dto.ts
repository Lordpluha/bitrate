import { ApiProperty } from '@nestjs/swagger'
import { User } from '@prisma/client'

export class RegistrationDto {
  @ApiProperty({
    description: 'New user email',
    example: 'newuser@example.com'
  })
  email: User['email']

  @ApiProperty({ description: 'New user password', example: 'password123' })
  password: User['password']
}
