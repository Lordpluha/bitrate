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
  @ApiProperty({ nullable: true })
  cover: string | null

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

  /** 1 = legacy HLS pipeline, 2 = single-file CMAF + Range index (ADR-0020). */
  @ApiProperty()
  playbackVersion: number

  /** Fragment timescale shared by every CMAF rendition; null on legacy tracks. */
  @ApiProperty()
  fragmentTimescale: number | null

  /** Track duration in fragment ticks; null on legacy tracks. */
  @ApiProperty()
  durationTicks: number | null

  /** Whether the track contains explicit content. */
  @ApiProperty()
  explicit: boolean

  /** Popularity score used by discovery and charts. */
  @ApiProperty()
  popularity: number

  /** Number of recorded plays. */
  @ApiProperty()
  playCount: number

  /** International Standard Recording Code. */
  @ApiProperty({ nullable: true })
  isrc: string | null

  /** Optional short preview URL. */
  @ApiProperty({ nullable: true })
  previewUrl: string | null

  /** Position within an album disc. */
  @ApiProperty({ nullable: true })
  trackNumber: number | null

  /** Disc number within an album. */
  @ApiProperty()
  discNumber: number

  /** ISO language code when known. */
  @ApiProperty({ nullable: true })
  language: string | null

  /** Soft deletion timestamp. */
  @ApiProperty({ nullable: true })
  deletedAt: Date | null
}
