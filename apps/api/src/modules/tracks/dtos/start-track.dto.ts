import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { z } from 'zod'

export const StartTrackSchema = z.object({
  trackId: z.uuidv7(),
  currentTime: z.number().min(0).default(0),
  bitrate: z.number().int().min(1).max(1000).optional(),
  format: z.string().min(1).max(16).default('opus'),
})

export class StartTrackDto implements z.input<typeof StartTrackSchema> {
  @ApiProperty({ description: 'Track ID to play' })
  trackId: string

  @ApiProperty({ description: 'Current playback time in seconds', default: 0 })
  currentTime?: number

  @ApiPropertyOptional({ description: 'Preferred audio bitrate in kbps' })
  bitrate?: number

  @ApiPropertyOptional({ description: 'Preferred audio format', default: 'opus' })
  format?: string
}
