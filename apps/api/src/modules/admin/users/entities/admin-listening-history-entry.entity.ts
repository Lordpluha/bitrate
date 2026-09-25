import { ApiProperty } from '@nestjs/swagger'

/** One listening-history row, with enough track identity to link to the track page. */
export class AdminListeningHistoryEntryEntity {
  /** The listening-history row's id. */
  @ApiProperty()
  id: string

  /** When the listen was recorded. */
  @ApiProperty()
  listenedAt: Date

  /** The listened track's id. */
  @ApiProperty()
  trackId: string

  /** The listened track's title. */
  @ApiProperty()
  trackTitle: string

  /** The track's primary artist username. */
  @ApiProperty()
  artistUsername: string
}
