import { ApiProperty } from '@nestjs/swagger'

/** One signed-in device as the artist sees it; token hashes never leave the API. */
export class ArtistSessionDeviceEntity {
  @ApiProperty({ format: 'uuid' })
  id: string

  @ApiProperty({ type: String, nullable: true, description: 'Raw browser user agent' })
  userAgent: string | null

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date

  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
    description: 'Last sign-in or refresh; null before it was tracked',
  })
  lastUsedAt: Date | null

  @ApiProperty({ type: String, format: 'date-time' })
  expiresAt: Date

  @ApiProperty({ description: 'The session making this request' })
  current: boolean
}

export class RevokedArtistSessionsEntity {
  @ApiProperty({ minimum: 0 })
  revoked: number
}
