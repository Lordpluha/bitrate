import { Album } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'

export class AlbumEntity implements Album {
  @ApiProperty()
  id: string

  @ApiProperty()
  title: string

  @ApiProperty()
  cover: string

  @ApiProperty()
  artistId: string

  @ApiProperty()
  description: string | null

  @ApiProperty()
  createdAt: Date
}
