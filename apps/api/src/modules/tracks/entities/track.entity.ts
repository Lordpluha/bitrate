import { ApiProperty } from '@nestjs/swagger'
import type { Track } from '@prisma/client'

/** Represents the track entity. */
export class TrackEntity implements Track {
  /** The id value. */
  @ApiProperty()
  id: string

  /** The title value. */
  @ApiProperty()
  title: string

  /** The audio url value. */
  @ApiProperty()
  audioUrl: string

  /** The cover value. */
  @ApiProperty()
  cover: string

  /** The created at value. */
  @ApiProperty()
  createdAt: Date

  /** The artist id value. */
  @ApiProperty()
  artistId: string

  /** The updated at value. */
  @ApiProperty()
  updatedAt: Date

  /** The duration value. */
  @ApiProperty()
  duration: number | null

  /** The release date value. */
  @ApiProperty()
  releaseDate: Date | null

  /** The lyrics value. */
  @ApiProperty()
  lyrics: string | null

  /** The processing status value. */
  @ApiProperty({ enum: ['PROCESSING', 'READY', 'FAILED'] })
  processingStatus: 'PROCESSING' | 'READY' | 'FAILED'

  /** The processing error value. */
  @ApiProperty()
  processingError: string | null

  /** The processing attempts value. */
  @ApiProperty()
  processingAttempts: number

  /** The processing started at value. */
  @ApiProperty()
  processingStartedAt: Date | null

  /** The processing finished at value. */
  @ApiProperty()
  processingFinishedAt: Date | null
}
