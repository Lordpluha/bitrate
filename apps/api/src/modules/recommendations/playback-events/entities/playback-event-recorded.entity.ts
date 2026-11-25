import { ApiProperty } from '@nestjs/swagger'

/** Returned when a playback event is reported. */
export class PlaybackEventRecordedEntity {
  /** False during a private session: the play was not stored. A repeated report is still true. */
  @ApiProperty()
  recorded: boolean
}
