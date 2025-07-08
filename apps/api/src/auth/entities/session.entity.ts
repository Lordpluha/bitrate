import { ApiProperty } from '@nestjs/swagger'
import { Session } from '@prisma/client'

export class SessionEntity implements Session {
  @ApiProperty()
  id: string

  @ApiProperty()
  userId: string

  @ApiProperty()
  access_token: string

  @ApiProperty()
  refresh_token: string
}
