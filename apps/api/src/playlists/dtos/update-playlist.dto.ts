import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const UpdatePlaylistSchema = z.object({
  title: z.string(),
  description: z.string().optional()
})

export class UpdatePlaylistDto implements z.infer<typeof UpdatePlaylistSchema> {
  @ApiProperty({ description: 'Playlist title' })
  title: string

  @ApiProperty({ description: '', example: 'user123' })
  description?: string
}
