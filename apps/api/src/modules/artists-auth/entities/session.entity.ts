import { ArtistEntity } from '@modules/artists'
import { ApiProperty } from '@nestjs/swagger'
import { ArtistSession } from '@prisma/client'

export class ArtistSessionEntity implements ArtistSession {
  @ApiProperty()
  id: string

  @ApiProperty()
  artistId: ArtistEntity['id']

  @ApiProperty()
  access_token: string

  @ApiProperty()
  refresh_token: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  expiresAt: Date | null
}
