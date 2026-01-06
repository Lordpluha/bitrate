import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const UpdateStreamingSchema = z.object({
  trackId: z.string().uuid(),
  userId: z.string().uuid(),
  currentTime: z.number().min(0),
  isPlaying: z.boolean(),
})

export class UpdateStreamingDto implements z.infer<typeof UpdateStreamingSchema> {
  @ApiProperty({ description: 'Track ID being updated' })
  trackId: string

  @ApiProperty({ description: 'User ID who is updating the track' })
  userId: string

  @ApiProperty({ description: 'Current playback time in seconds' })
  currentTime: number

  @ApiProperty({ description: 'Whether the track is playing' })
  isPlaying: boolean
}
