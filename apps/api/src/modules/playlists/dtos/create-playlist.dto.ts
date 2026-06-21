import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const CreatePlaylistSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
})

export type CreatePlaylistDto = {
  title: string
  description?: string
  isPublic?: boolean
}

export class CreatePlaylistDtoClass {
  @ApiProperty({ description: 'Playlist title' })
  title: string

  @ApiProperty({ description: 'Playlist description', required: false })
  description?: string

  @ApiProperty({ description: 'Whether the playlist is public', required: false, default: false })
  isPublic?: boolean
}
