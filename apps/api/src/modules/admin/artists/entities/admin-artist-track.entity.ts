import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/** One of an artist's published tracks, as seen from the artist detail page. */
export class AdminArtistTrackEntity {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The title value. */
  @ApiProperty()
  title: string

  /** The stored cover image's filename, or `null`. See `AdminTrackEntity.cover` for the URL
   * convention this follows. */
  @ApiPropertyOptional({ nullable: true })
  cover: string | null

  /** The processing status value. */
  @ApiProperty({ enum: ['PROCESSING', 'READY', 'FAILED'] })
  processingStatus: 'PROCESSING' | 'READY' | 'FAILED'

  /** Total play count. */
  @ApiProperty()
  playCount: number

  /** Soft-delete (take-down) timestamp. */
  @ApiPropertyOptional({ nullable: true })
  deletedAt: Date | null

  /** The created at value. */
  @ApiProperty()
  createdAt: Date
}
