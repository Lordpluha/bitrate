import { ApiPropertyOptional } from '@nestjs/swagger'
import { z } from 'zod'

/** Body of `POST /tracks/:id/play-sessions`. */
export const OpenPlaySessionSchema = z.object({
  deviceId: z.string().uuid().optional(),
})

/** Opens a playback session; the Bitrate Connect device is recorded for later stages. */
export class OpenPlaySessionDto implements z.infer<typeof OpenPlaySessionSchema> {
  @ApiPropertyOptional({
    format: 'uuid',
    description: 'The Bitrate Connect device playing, as registered at `/me/player/devices`',
  })
  deviceId?: string
}
