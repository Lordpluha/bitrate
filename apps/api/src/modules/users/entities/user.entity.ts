import { ApiProperty } from '@nestjs/swagger'
import type { User } from '@prisma/client'

export class UserEntity implements User {
  @ApiProperty()
  id: string

  @ApiProperty()
  username: string

  @ApiProperty()
  email: string

  @ApiProperty({ nullable: true })
  password: string | null

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  description: string | null

  @ApiProperty()
  avatar: string | null

  @ApiProperty()
  updatedAt: Date

  @ApiProperty({ nullable: true })
  twoFactorSecret: string | null

  @ApiProperty()
  twoFactorEnabled: boolean
}
