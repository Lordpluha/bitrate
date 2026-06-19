import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const UpdateArtistSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  backgroundImage: z.string().url().optional(),
})

export class UpdateArtistDto implements z.infer<typeof UpdateArtistSchema> {
  @ApiProperty({ required: false })
  username?: string

  @ApiProperty({ required: false })
  bio?: string

  @ApiProperty({ required: false })
  avatar?: string

  @ApiProperty({ required: false })
  backgroundImage?: string
}
