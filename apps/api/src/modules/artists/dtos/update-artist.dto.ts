import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The update artist schema value. */
export const UpdateArtistSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  backgroundImage: z.string().url().optional(),
})

/** Represents the update artist dto. */
export class UpdateArtistDto implements z.infer<typeof UpdateArtistSchema> {
  /** The username value. */
  @ApiProperty({ required: false })
  username?: string

  /** The bio value. */
  @ApiProperty({ required: false })
  bio?: string

  /** The avatar value. */
  @ApiProperty({ required: false })
  avatar?: string

  /** The background image value. */
  @ApiProperty({ required: false })
  backgroundImage?: string
}
