import { RightsConfirmedSchema } from '@common/rights-confirmation'
import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The create track schema value. */
export const CreateTrackSchema = z.object({
  title: z.string().min(3).max(200),
  rightsConfirmed: RightsConfirmedSchema,
})

/**
 * Updating metadata needs no new confirmation; replacing the audio does, because it is a new
 * recording the artist must hold the rights to.
 */
export const UpdateTrackSchema = CreateTrackSchema.extend({
  rightsConfirmed: RightsConfirmedSchema.optional(),
})

/** Represents the create track dto. */
export class CreateTrackDto implements z.infer<typeof CreateTrackSchema> {
  /** The title value. */
  @ApiProperty({ description: 'Track title' })
  title: string

  /** Confirms the artist holds the rights to the uploaded content. Must be `true`. */
  @ApiProperty({
    description: 'Confirms you hold the rights to this recording; must be true',
    example: true,
    enum: [true],
  })
  rightsConfirmed: true

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

/** Represents the update track dto. */
export class UpdateTrackDto implements z.infer<typeof UpdateTrackSchema> {
  /** The title value. */
  @ApiProperty({ description: 'Track title' })
  title: string

  /** Required when the audio file is replaced; confirms the rights to the new recording. */
  @ApiProperty({
    description:
      'Confirms you hold the rights to the replacement recording; required with new audio',
    example: true,
    enum: [true],
    required: false,
  })
  rightsConfirmed?: true

  /** The audio value. */
  @ApiProperty({
    description: 'Replacement audio file',
    required: false,
    type: 'string',
    format: 'binary',
  })
  audio?: Express.Multer.File

  /** The cover value. */
  @ApiProperty({
    description: 'Cover image file',
    required: false,
    type: 'string',
    format: 'binary',
  })
  cover?: Express.Multer.File
}
