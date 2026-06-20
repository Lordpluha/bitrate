import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const PauseTrackSchema = z.object({
  trackId: z.uuidv7(),
  currentTime: z.number().min(0),
})

export class PauseTrackDto implements z.infer<typeof PauseTrackSchema> {
  @ApiProperty({ description: 'Track ID to pause' })
  trackId: string

  @ApiProperty({ description: 'Current playback time in seconds' })
  currentTime: number
}
