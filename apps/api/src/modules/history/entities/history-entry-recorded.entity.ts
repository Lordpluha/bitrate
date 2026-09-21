import { ApiProperty } from '@nestjs/swagger'

/** Returned when a track listen is recorded. */
export class HistoryEntryRecordedEntity {
  /** The id of the new listening history row. */
  @ApiProperty()
  id: string

  /** When the listen was recorded. */
  @ApiProperty()
  listenedAt: Date
}
