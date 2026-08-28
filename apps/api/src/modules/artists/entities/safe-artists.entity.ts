import { ApiProperty } from '@nestjs/swagger'
import type { Artist, Prisma } from '@prisma/client'

/** Represents the safe artist entity. */
export class SafeArtistEntity
  implements
    Pick<
      Artist,
      | 'id'
      | 'username'
      | 'bio'
      | 'avatar'
      | 'backgroundImage'
      | 'createdAt'
      | 'updatedAt'
      | 'verified'
      | 'monthlyListeners'
      | 'country'
      | 'socials'
    >
{
  /** The id value. */
  @ApiProperty()
  id: string

  /** The username value. */
  @ApiProperty()
  username: string

  /** The bio value. */
  @ApiProperty()
  bio: string | null

  /** The avatar value. */
  @ApiProperty()
  avatar: string | null

  /** The background image value. */
  @ApiProperty()
  backgroundImage: string | null

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date

  /** Whether the artist profile is verified. */
  @ApiProperty()
  verified: boolean

  /** Cached monthly listener count. */
  @ApiProperty()
  monthlyListeners: number

  /** Artist country code. */
  @ApiProperty({ nullable: true })
  country: string | null

  /** Social profile metadata. */
  @ApiProperty({ nullable: true, type: Object })
  socials: Prisma.JsonValue | null
}
