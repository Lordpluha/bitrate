import { ApiProperty } from '@nestjs/swagger'

/** Activity counts shown on the artist detail page. */
export class AdminArtistCountsEntity {
  /** How many non-deleted tracks the artist is the primary artist on. */
  @ApiProperty()
  tracks: number

  /** How many non-deleted albums the artist owns. */
  @ApiProperty()
  albums: number

  /** How many of the artist's sessions have not yet expired. */
  @ApiProperty()
  activeSessions: number

  /** How many `OPEN` moderation reports name this artist. */
  @ApiProperty()
  openReports: number
}
