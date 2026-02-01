import { UserEntity } from '@modules/users'
import { ApiProperty } from '@nestjs/swagger'
import { UserSession } from '@prisma/client'

export class UserSessionEntity implements UserSession {
  @ApiProperty()
  id: string

  @ApiProperty()
  userId: UserEntity['id']

  @ApiProperty()
  access_token: string

  @ApiProperty()
  refresh_token: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  expiresAt: Date | null
}
