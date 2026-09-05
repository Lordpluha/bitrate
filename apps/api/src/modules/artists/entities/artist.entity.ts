import { ApiProperty } from '@nestjs/swagger'
import type { Artist, Prisma } from '@prisma/client'

/** Represents the artist entity. */
export class ArtistEntity implements Artist {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The username value. */
  @ApiProperty()
  username: string

  /** The password value. */
  @ApiProperty()
  password: string | null

  /** The email value. */
  @ApiProperty()
  email: string

  /** The bio value. */
  @ApiProperty()
  bio: string | null

  /** The avatar value. */
  @ApiProperty()
  avatar: string | null

  /** The background image value. */
  @ApiProperty()
  backgroundImage: string | null

  /** The two factor secret value. */
  @ApiProperty()
  twoFactorSecret: string | null

  /** The two factor enabled value. */
  @ApiProperty()
  twoFactorEnabled: boolean

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date

  /** Email verification timestamp. */
  @ApiProperty({ nullable: true })
  emailVerifiedAt: Date | null

  /** Consecutive failed login attempts. */
  @ApiProperty()
  failedLoginAttempts: number

  /** Account lock expiration timestamp. */
  @ApiProperty({ nullable: true })
  lockedUntil: Date | null

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

  /** Soft deletion timestamp. */
  @ApiProperty({ nullable: true })
  deletedAt: Date | null
}
