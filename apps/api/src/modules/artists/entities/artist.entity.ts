import { ApiProperty } from '@nestjs/swagger'
import { Artist } from '@prisma/client'

export class ArtistEntity implements Artist {
  @ApiProperty()
  id: string

  @ApiProperty()
  username: string

  @ApiProperty()
  password: string

  @ApiProperty()
  email: string

  @ApiProperty()
  bio: string | null

  @ApiProperty()
  avatar: string | null

  @ApiProperty()
  backgroundImage: string | null

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
