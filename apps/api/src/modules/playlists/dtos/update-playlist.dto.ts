import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The update playlist schema value. */
export const UpdatePlaylistSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
})

/** Represents the update playlist dto. */
export class UpdatePlaylistDto implements z.infer<typeof UpdatePlaylistSchema> {
  /** The title value. */
  @ApiProperty({ description: 'Playlist title' })
  title: string

  /** The description value. */
  @ApiProperty({ description: '', example: 'user123' })
  description?: string
}
