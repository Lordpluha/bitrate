import { ApiProperty } from '@nestjs/swagger'
import { User } from '@prisma/client'

export class SafeUserEntity implements Omit<User, 'password'> {
  @ApiProperty()
  id: string

  @ApiProperty()
  username: string

  @ApiProperty()
  email: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  description: string | null

  @ApiProperty()
  avatar: string | null

  @ApiProperty()
  updatedAt: Date
}
