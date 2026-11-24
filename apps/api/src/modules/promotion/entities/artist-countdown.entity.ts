import { ApiProperty } from '@nestjs/swagger'

export class ArtistCountdownDetailsEntity {
  @ApiProperty({ format: 'uuid' })
  releaseId: string

  @ApiProperty()
  title: string

  @ApiProperty({ type: String, nullable: true, description: 'Stored cover, as on albums' })
  cover: string | null

  @ApiProperty({ type: String, format: 'date-time', description: 'When the release goes live' })
  releaseAt: Date
}

/** The countdown tile of an artist page, or null when there is none to show. */
export class ArtistCountdownEntity {
  @ApiProperty({ type: ArtistCountdownDetailsEntity, nullable: true })
  countdown: ArtistCountdownDetailsEntity | null
}
