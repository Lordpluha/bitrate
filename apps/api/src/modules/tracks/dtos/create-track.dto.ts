import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The create track schema value. */
export const CreateTrackSchema = z.object({
  title: z.string().min(3).max(200),
})

/** Represents the create track dto. */
export class CreateTrackDto implements z.infer<typeof CreateTrackSchema> {
  /** The title value. */
  @ApiProperty({ description: 'Track title' })
  title: string

  /** The audio value. */
  @ApiProperty({ description: 'Audio file', type: 'string', format: 'binary' })
  audio: Express.Multer.File

  /** The cover value. */
  @ApiProperty({
    description: 'Cover image file',
    required: false,
    type: 'string',
    format: 'binary',
  })
  cover?: Express.Multer.File
}
