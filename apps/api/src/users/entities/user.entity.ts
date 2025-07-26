import { User } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'

export class UserEntity implements User {
  @ApiProperty()
  id: string

  @ApiProperty()
  username: string

  @ApiProperty()
  email: string

  @ApiProperty()
  password: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  description: string | null
  @ApiProperty()
  avatar: string | null
}
