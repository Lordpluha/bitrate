import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The update streaming schema value. */
export const UpdateStreamingSchema = z.object({
  trackId: z.uuidv7(),
  currentTime: z.number().min(0),
  isPlaying: z.boolean(),
})

/** Represents the update streaming dto. */
export class UpdateStreamingDto implements z.infer<typeof UpdateStreamingSchema> {
  /** The track id value. */
  @ApiProperty({ description: 'Track ID being updated' })
  trackId: string

  /** The current time value. */
  @ApiProperty({ description: 'Current playback time in seconds' })
  currentTime: number

  /** The is playing value. */
  @ApiProperty({ description: 'Whether the track is playing' })
  isPlaying: boolean
}
