import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** One track on an album, as seen from the operator album detail page. */
export class AdminAlbumTrackEntity {
  /** The track's id. */
  @ApiProperty()
  id: string

  /** The track's title. */
  @ApiProperty()
  title: string

  /** The track's number within its disc. */
  @ApiProperty()
  trackNumber: number

  /** The disc number. */
  @ApiProperty()
  discNumber: number

  /** The track's audio processing status. */
  @ApiProperty({ enum: ['PROCESSING', 'READY', 'FAILED'] })
  processingStatus: 'PROCESSING' | 'READY' | 'FAILED'

  /** The track's own soft-delete timestamp — independent of the album's. */
  @ApiPropertyOptional({ nullable: true })
  deletedAt: Date | null
}
