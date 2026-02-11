import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const StartTrackSchema = z.object({
  trackId: z.uuidv7(),
  userId: z.uuidv7(),
  currentTime: z.int().min(0).default(0),
})

export class StartTrackDto implements z.infer<typeof StartTrackSchema> {
  @ApiProperty({ description: 'Track ID to play' })
  trackId: string

  @ApiProperty({ description: 'User ID who is playing the track' })
  userId: string

  @ApiProperty({ description: 'Current playback time in seconds', default: 0 })
  currentTime: number
}
