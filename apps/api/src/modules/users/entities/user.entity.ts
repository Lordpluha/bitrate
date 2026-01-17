import { ApiProperty } from '@nestjs/swagger'
import { User } from '@prisma/client'

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
