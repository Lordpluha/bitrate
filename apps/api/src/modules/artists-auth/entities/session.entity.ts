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

  /** The browser the session signed in from. */
  @ApiProperty({ type: String, nullable: true })
  userAgent: string | null

  /** The last sign-in or refresh of the session. */
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  lastUsedAt: Date | null

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The expires at value. */
  @ApiProperty()
  expiresAt: Date
}
