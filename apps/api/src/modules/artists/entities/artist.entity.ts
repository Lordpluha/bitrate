import { ApiProperty } from '@nestjs/swagger'
import type { Artist } from '@prisma/client'

export class ArtistEntity implements Artist {
  @ApiProperty()
  id: string

  @ApiProperty()
  username: string

  @ApiProperty()
  password: string | null

  @ApiProperty()
  email: string

  @ApiProperty()
  bio: string | null

  @ApiProperty()
  avatar: string | null

  @ApiProperty()
  backgroundImage: string | null

  @ApiProperty()
  twoFactorSecret: string | null

  @ApiProperty()
  twoFactorEnabled: boolean

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
