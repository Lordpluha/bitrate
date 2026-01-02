import { ApiProperty } from '@nestjs/swagger'
import { Track } from '@prisma/client'

export class TrackEntity implements Track {
  @ApiProperty()
  id: string

  @ApiProperty()
  title: string

  @ApiProperty()
  audioUrl: string

  @ApiProperty()
  cover: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  artistId: string
}
