import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

export const AddTracksSchema = z.object({
  trackIds: z.array(z.string().uuid()).min(1),
})

export class AddTracksDto implements z.infer<typeof AddTracksSchema> {
  @ApiProperty({ description: 'Array of track IDs to add', type: [String], format: 'uuid' })
  trackIds: string[]
}
