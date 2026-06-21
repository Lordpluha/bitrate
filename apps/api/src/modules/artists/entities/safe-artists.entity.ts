import { ApiProperty } from '@nestjs/swagger'
import type { Artist } from '@prisma/client'

/** Represents the safe artist entity. */
export class SafeArtistEntity implements Omit<Artist, 'password' | 'email' | 'twoFactorSecret'> {
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

  /** The two factor enabled value. */
  @ApiProperty()
  twoFactorEnabled: boolean

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date
}
