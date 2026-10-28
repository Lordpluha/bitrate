import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const MasterOwnerSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('ARTIST') }),
  z.strictObject({ type: z.literal('OTHER'), name: z.string().trim().min(1).max(255) }),
])

/**
 * The complete rights state; the confirmation describes the credits saved with it. Accuracy is
 * confirmed by submitting the release, not here.
 */
export const UpdateReleaseRightsSchema = z.strictObject({
  masterOwner: MasterOwnerSchema.nullable().describe('null clears the master owner'),
  writersConfirmed: z.boolean().describe('All songwriters and composers are credited'),
  expectedUpdatedAt: z.iso
    .datetime({ offset: true })
    .describe('Release version read before editing'),
})

export class UpdateReleaseRightsDto extends createZodDto(UpdateReleaseRightsSchema) {}
