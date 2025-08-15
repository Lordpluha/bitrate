import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const UpdateAlbumSchema = z.object({
  title: z.string(),
  description: z.string().optional()
})

export class UpdateAlbumDto implements z.infer<typeof UpdateAlbumSchema> {
  @ApiProperty({ description: 'Playlist title' })
  title: string

  @ApiProperty({ description: '', example: 'user123' })
  description?: string
}
