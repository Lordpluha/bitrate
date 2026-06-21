import { ApiProperty } from '@nestjs/swagger'
import type { Album } from '@prisma/client'

/** Represents the album entity. */
export class AlbumEntity implements Album {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The title value. */
  @ApiProperty()
  title: string

  /** The cover value. */
  @ApiProperty()
  cover: string

  /** The artist id value. */
  @ApiProperty()
  artistId: string

  /** The description value. */
  @ApiProperty()
  description: string | null

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date

  /** The release date value. */
  @ApiProperty()
  releaseDate: Date | null
}
