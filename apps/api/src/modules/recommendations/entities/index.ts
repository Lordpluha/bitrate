import { ApiProperty } from '@nestjs/swagger'
import { NotInterestedType, TasteExclusionType } from '@prisma/client'

/** Returned when a playback event is reported. */
export class PlaybackEventRecordedEntity {
  /** False during a private session: the play was not stored. A repeated report is still true. */
  @ApiProperty()
  recorded: boolean
}

/** One item the listener marked "Not interested". */
export class NotInterestedItemEntity {
  @ApiProperty({ enum: NotInterestedType, enumName: 'NotInterestedType' })
  entityType: NotInterestedType

  @ApiProperty({ format: 'uuid' })
  entityId: string

  @ApiProperty()
  createdAt: Date
}

/** One item the listener excluded from their taste profile. */
export class TasteExclusionItemEntity {
  @ApiProperty({ enum: TasteExclusionType, enumName: 'TasteExclusionType' })
  entityType: TasteExclusionType

  @ApiProperty({ format: 'uuid' })
  entityId: string

  @ApiProperty()
  createdAt: Date
}
