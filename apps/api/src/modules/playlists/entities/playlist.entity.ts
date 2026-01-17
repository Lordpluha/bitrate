import { ApiProperty } from '@nestjs/swagger'
import { Playlist } from '@prisma/client'

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

  @ApiProperty()
  updatedAt: Date

  @ApiProperty()
  isPublic: boolean
}
