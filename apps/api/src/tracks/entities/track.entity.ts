import { Track } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'

export class TrackEntity implements Track {
  @ApiProperty()
  id: string

  @ApiProperty()
  title: string

  @ApiProperty()
  artist: string

  @ApiProperty()
  audioUrl: string

  @ApiProperty()
  cover: string

  @ApiProperty()
  userId: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  artistId: string
}
