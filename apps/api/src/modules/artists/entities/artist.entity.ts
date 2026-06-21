import { ApiProperty } from '@nestjs/swagger'
import type { Artist } from '@prisma/client'

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
}
