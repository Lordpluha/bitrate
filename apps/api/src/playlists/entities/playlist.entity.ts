import { Playlist } from '@prisma/client'
import { ApiProperty } from '@nestjs/swagger'

export class PlaylistEntity implements Playlist {
  @ApiProperty()
  id: string

  @ApiProperty()
  title: string

  @ApiProperty()
  cover: string

  @ApiProperty()
  description: string | null

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  userId: string
}
