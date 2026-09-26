import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** An artist as seen by the operator surface — never includes secrets. */
export class AdminArtistEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The username value. */
  @ApiProperty()
  username: string

  /** The email value. */
  @ApiProperty()
  email: string

  /** The artist bio. */
  @ApiPropertyOptional({ nullable: true })
  bio: string | null

  /** The avatar URL. */
  @ApiPropertyOptional({ nullable: true })
  avatar: string | null

  /** The profile background image URL. */
  @ApiPropertyOptional({ nullable: true })
  backgroundImage: string | null

  /** Whether the artist account is verified. */
  @ApiProperty()
  verified: boolean

  /** Recorded monthly listener count. */
  @ApiProperty()
  monthlyListeners: number

  /** The artist's declared country. */
  @ApiPropertyOptional({ nullable: true })
  country: string | null

  /** Whether two-factor authentication is enabled. */
  @ApiProperty()
  twoFactorEnabled: boolean

  /** Email verification timestamp. */
  @ApiPropertyOptional({ nullable: true })
  emailVerifiedAt: Date | null

  /** Consecutive failed login attempts. */
  @ApiProperty()
  failedLoginAttempts: number

  /** Account lock expiration timestamp. */
  @ApiPropertyOptional({ nullable: true })
  lockedUntil: Date | null

  /** Soft-delete timestamp. */
  @ApiPropertyOptional({ nullable: true })
  deletedAt: Date | null

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date
}
