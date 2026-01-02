import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const CreateAlbumSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
})

export class CreateAlbumDto implements z.infer<typeof CreateAlbumSchema> {
  @ApiProperty({ description: 'Playlist title' })
  title: string

  @ApiProperty({ description: '', example: 'user123' })
  description?: string
}
