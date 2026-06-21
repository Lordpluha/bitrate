import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The create playlist schema value. */
export const CreatePlaylistSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
})

/** Defines the create playlist dto. */
export type CreatePlaylistDto = {
  title: string
  description?: string
  isPublic?: boolean
}

/** Represents the create playlist dto class. */
export class CreatePlaylistDtoClass {
  /** The title value. */
  @ApiProperty({ description: 'Playlist title' })
  title: string

  /** The description value. */
  @ApiProperty({ description: 'Playlist description', required: false })
  description?: string

  /** The is public value. */
  @ApiProperty({ description: 'Whether the playlist is public', required: false, default: false })
  isPublic?: boolean
}
