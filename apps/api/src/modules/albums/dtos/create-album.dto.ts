import { RightsConfirmedSchema } from '@common/rights-confirmation'
import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The create album schema value. */
export const CreateAlbumSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  rightsConfirmed: RightsConfirmedSchema,
})

/** Represents the create album dto. */
export class CreateAlbumDto implements z.infer<typeof CreateAlbumSchema> {
  /** The title value. */
  @ApiProperty({ description: 'Playlist title' })
  title: string

  /** The description value. */
  @ApiProperty({ description: '', example: 'user123' })
  description?: string

  /** Confirms the artist holds the rights to the album content. Must be `true`. */
  @ApiProperty({
    description: 'Confirms you hold the rights to this album; must be true',
    example: true,
    enum: [true],
  })
  rightsConfirmed: true
}
