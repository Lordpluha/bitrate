import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const CreatePlaylistSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
})

export class CreatePlaylistDto implements z.infer<typeof CreatePlaylistSchema> {
  @ApiProperty({ description: 'Playlist title' })
  title: string

  @ApiProperty({ description: '', example: 'user123' })
  description?: string
}
