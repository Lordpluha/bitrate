import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'
import type { Album, AlbumType } from '@prisma/client'

/** Represents the album entity. */
export class AlbumEntity implements Album {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The title value. */
  @ApiProperty()
  title: string

  /** The cover value. */
  @ApiProperty({ nullable: true })
  cover: string | null

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

  /** The release kind. */
  @ApiProperty({ enum: ['ALBUM', 'SINGLE', 'EP', 'COMPILATION'] })
  type: AlbumType

  /** The record label. */
  @ApiProperty({ nullable: true })
  label: string | null

  /** Cached number of tracks. */
  @ApiProperty()
  totalTracks: number

  /** Copyright information. */
  @ApiProperty({ nullable: true })
  copyright: string | null

  /** Soft deletion timestamp. */
  @ApiProperty({ nullable: true })
  deletedAt: Date | null

  /**
   * Artist Agreement revision the artist confirmed their rights under at creation, if recorded.
   * Kept out of the API schema: it is evidence for us, not data clients consume.
   */
  @ApiHideProperty()
  rightsConfirmedVersion: string | null

  /** When the artist confirmed their rights, if recorded. Hidden from the schema like the version. */
  @ApiHideProperty()
  rightsConfirmedAt: Date | null
}
