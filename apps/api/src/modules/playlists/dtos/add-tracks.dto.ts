import { ApiProperty } from '@nestjs/swagger'
import { z } from 'zod'

/** The add tracks schema value. */
export const AddTracksSchema = z.object({
  trackIds: z.array(z.string().uuid()).min(1),
})

/** Represents the add tracks dto. */
export class AddTracksDto implements z.infer<typeof AddTracksSchema> {
  /** The track ids value. */
  @ApiProperty({ description: 'Array of track IDs to add', type: [String], format: 'uuid' })
  trackIds: string[]
}
