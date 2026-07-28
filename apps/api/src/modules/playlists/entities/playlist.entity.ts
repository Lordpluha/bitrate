import { ApiProperty } from '@nestjs/swagger'
import type { Playlist } from '@prisma/client'

/** Represents the playlist entity. */
export class PlaylistEntity implements Playlist {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The title value. */
  @ApiProperty()
  title: string

  /** The cover value. */
  @ApiProperty()
  cover: string

  /** The description value. */
  @ApiProperty()
  description: string | null

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The user id value. */
  @ApiProperty()
  userId: string

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date

  /** The is public value. */
  @ApiProperty()
  isPublic: boolean
}
