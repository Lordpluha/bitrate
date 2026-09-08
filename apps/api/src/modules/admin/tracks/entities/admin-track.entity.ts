import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** A track as seen by the operator surface, including its processing pipeline state. */
export class AdminTrackEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The title value. */
  @ApiProperty()
  title: string

  /** The primary artist's id. */
  @ApiProperty()
  artistId: string

  /** The primary artist's display name — avoids an N+1 lookup on the operator screen. */
  @ApiProperty()
  artistUsername: string

  /** The processing status value. */
  @ApiProperty({ enum: ['PROCESSING', 'READY', 'FAILED'] })
  processingStatus: 'PROCESSING' | 'READY' | 'FAILED'

  /** The last recorded processing error, if any. */
  @ApiPropertyOptional({ nullable: true })
  processingError: string | null

  /** How many processing attempts have been made. */
  @ApiProperty()
  processingAttempts: number

  /** When the current/most-recent processing attempt started. */
  @ApiPropertyOptional({ nullable: true })
  processingStartedAt: Date | null

  /** When processing last finished (success or failure). */
  @ApiPropertyOptional({ nullable: true })
  processingFinishedAt: Date | null

  /** Soft-delete timestamp. */
  @ApiPropertyOptional({ nullable: true })
  deletedAt: Date | null

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date
}
