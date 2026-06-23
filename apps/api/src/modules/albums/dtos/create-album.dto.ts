import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The create album schema value. */
export const CreateAlbumSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
})

/** Represents the create album dto. */
export class CreateAlbumDto implements z.infer<typeof CreateAlbumSchema> {
  /** The title value. */
  @ApiProperty({ description: 'Playlist title' })
  title: string

  /** The description value. */
  @ApiProperty({ description: '', example: 'user123' })
  description?: string
}
