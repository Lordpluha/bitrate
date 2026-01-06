import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const PauseTrackSchema = z.object({
  trackId: z.string().uuid(),
  userId: z.string().uuid(),
  currentTime: z.number().min(0),
})

export class PauseTrackDto implements z.infer<typeof PauseTrackSchema> {
  @ApiProperty({ description: 'Track ID to pause' })
  trackId: string

  @ApiProperty({ description: 'User ID who is pausing the track' })
  userId: string

  @ApiProperty({ description: 'Current playback time in seconds' })
  currentTime: number
}
