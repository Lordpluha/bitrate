import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The pause track schema value. */
export const PauseTrackSchema = z.object({
  trackId: z.uuidv7(),
  currentTime: z.number().min(0),
})

/** Represents the pause track dto. */
export class PauseTrackDto implements z.infer<typeof PauseTrackSchema> {
  /** The track id value. */
  @ApiProperty({ description: 'Track ID to pause' })
  trackId: string

  /** The current time value. */
  @ApiProperty({ description: 'Current playback time in seconds' })
  currentTime: number
}
