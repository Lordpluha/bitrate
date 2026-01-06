import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const CreateTrackSchema = z.object({
  title: z.string(),
  audioUrl: z.string(),
  cover: z.string().optional(),
})

export class CreateTrackDto implements z.infer<typeof CreateTrackSchema> {
  @ApiProperty({ description: 'Track title' })
  title: string

  @ApiProperty({ description: 'Url to audio' })
  audioUrl: string

  @ApiProperty({ description: 'Url to cover image', required: false })
  cover?: string
}
