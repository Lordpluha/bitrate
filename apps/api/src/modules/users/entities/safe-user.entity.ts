import { ApiProperty } from '@nestjs/swagger'
import type { User } from '@prisma/client'

export class SafeUserEntity implements Omit<User, 'password' | 'twoFactorSecret'> {
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

  @ApiProperty()
  twoFactorEnabled: boolean
}
