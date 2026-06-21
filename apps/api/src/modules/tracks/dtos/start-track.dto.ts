import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { z } from 'zod'

/** The start track schema value. */
export const StartTrackSchema = z.object({
  trackId: z.uuidv7(),
  currentTime: z.number().min(0).default(0),
  bitrate: z.number().int().min(1).max(1000).optional(),
  format: z.string().min(1).max(16).default('opus'),
})

/** Represents the start track dto. */
export class StartTrackDto implements z.input<typeof StartTrackSchema> {
  /** The track id value. */
  @ApiProperty({ description: 'Track ID to play' })
  trackId: string

  /** The current time value. */
  @ApiProperty({ description: 'Current playback time in seconds', default: 0 })
  currentTime?: number

  /** The bitrate value. */
  @ApiPropertyOptional({ description: 'Preferred audio bitrate in kbps' })
  bitrate?: number

  /** The format value. */
  @ApiPropertyOptional({ description: 'Preferred audio format', default: 'opus' })
  format?: string
}
