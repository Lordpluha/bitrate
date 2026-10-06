import { TakeDownReasonSchema } from '@modules/admin/shared'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

/**
 * Body of `PATCH /admin/playlists/:id/visibility`. `isPublic: false` hides (forces private);
 * `isPublic: true` un-hides a playlist an operator previously hid. The optional `reason` lands
 * in the audit row, like every other operator action.
 */
export const SetPlaylistVisibilitySchema = TakeDownReasonSchema.extend({
  isPublic: z.boolean(),
})

export class SetPlaylistVisibilityDto extends createZodDto(SetPlaylistVisibilitySchema) {}
