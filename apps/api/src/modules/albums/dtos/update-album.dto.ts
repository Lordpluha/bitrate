import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The update album schema value. */
export const UpdateAlbumSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
})

/** Represents the update album dto. */
export class UpdateAlbumDto implements z.infer<typeof UpdateAlbumSchema> {
  /** The title value. */
  @ApiProperty({ description: 'Playlist title' })
  title: string

  /** The description value. */
  @ApiProperty({ description: '', example: 'user123' })
  description?: string
}
