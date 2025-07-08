import { ApiProperty } from '@nestjs/swagger'

export class RegistrationDto {
  @ApiProperty({
    description: 'New user email',
    example: 'newuser@example.com'
  })
  email: string

  @ApiProperty({ description: 'New user password', example: 'password123' })
  password: string
}
