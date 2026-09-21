import { ApiProperty } from '@nestjs/swagger'
import { HistoryTrackEntity } from './history-track.entity'

/** One deduplicated listening history entry. */
export class HistoryEntryEntity {
  /** The id of the most recent listen for this track. */
  @ApiProperty()
  id: string

  /** When the track was last listened to. */
  @ApiProperty()
  listenedAt: Date

  /** The listened track's id. */
  @ApiProperty()
  trackId: string

  /** The listened track's summary. */
  @ApiProperty({ type: HistoryTrackEntity })
  track: HistoryTrackEntity
}
