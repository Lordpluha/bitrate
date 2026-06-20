import { ApiProperty } from '@nestjs/swagger'
import type { Artist } from '@prisma/client'

export class SafeArtistEntity implements Omit<Artist, 'password' | 'email' | 'twoFactorSecret'> {
  @ApiProperty()
  id: string

  @ApiProperty()
  username: string

  @ApiProperty()
  bio: string | null

  @ApiProperty()
  avatar: string | null

  @ApiProperty()
  backgroundImage: string | null

  @ApiProperty()
  twoFactorEnabled: boolean

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
