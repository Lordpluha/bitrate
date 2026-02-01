import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const CreateTrackSchema = z.object({
  title: z.string().min(3).max(200),
})

export class CreateTrackDto implements z.infer<typeof CreateTrackSchema> {
  @ApiProperty({ description: 'Track title' })
  title: string

  @ApiProperty({ description: 'Audio file', type: 'string', format: 'binary' })
  audio: any

  @ApiProperty({
    description: 'Cover image file',
    required: false,
    type: 'string',
    format: 'binary',
  })
  cover?: any
}
