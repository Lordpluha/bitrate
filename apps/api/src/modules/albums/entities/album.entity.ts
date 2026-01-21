import { ApiProperty } from '@nestjs/swagger'
import { Album } from '@prisma/client'

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

  @ApiProperty()
  updatedAt: Date

  @ApiProperty()
  releaseDate: Date | null
}
