import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const MasterOwnerSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('ARTIST') }),
  z.strictObject({ type: z.literal('OTHER'), name: z.string().trim().min(1).max(255) }),
])

/**
 * Who owns the master. The songwriter confirmation is no longer asked for or required; older
 * clients may still send it. Accuracy is confirmed by submitting the release, not here.
 */
export const UpdateReleaseRightsSchema = z.strictObject({
  masterOwner: MasterOwnerSchema.nullable().describe('null clears the master owner'),
  writersConfirmed: z
    .boolean()
    .optional()
    .describe('Deprecated: no longer required; omit it to leave the stored value unchanged'),
  expectedUpdatedAt: z.iso
    .datetime({ offset: true })
    .describe('Release version read before editing'),
})

export class UpdateReleaseRightsDto extends createZodDto(UpdateReleaseRightsSchema) {}
