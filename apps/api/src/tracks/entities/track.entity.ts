import { Track } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'

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
