import { ApiProperty } from '@nestjs/swagger'

/** Returned when a track listen is recorded. */
export class HistoryEntryRecordedEntity {
  /** False during a private session: the listen was not stored. */
  @ApiProperty()
  recorded: boolean

  /** The id of the new listening history row, or null when nothing was recorded. */
  @ApiProperty({ type: String, nullable: true })
  id: string | null

  /** When the listen was recorded, or null when nothing was recorded. */
  @ApiProperty({ type: Date, nullable: true })
  listenedAt: Date | null
}
