import type { ArtistEntity } from '@modules/artists'
import { ApiProperty } from '@nestjs/swagger'
import type { ArtistSession } from '@prisma/client'

/** Represents the artist session entity. */
export class ArtistSessionEntity implements ArtistSession {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The artist id value. */
  @ApiProperty()
  artistId: ArtistEntity['id']

  /** The access token value. */
  @ApiProperty()
  access_token: string

  /** The refresh token value. */
  @ApiProperty()
  refresh_token: string

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The expires at value. */
  @ApiProperty()
  expiresAt: Date
}
