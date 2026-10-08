import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const MasterOwnerSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('ARTIST') }),
  z.strictObject({ type: z.literal('OTHER'), name: z.string().trim().min(1).max(255) }),
])

/** The complete rights state; each confirmation describes the data saved with it. */
export const UpdateReleaseRightsSchema = z.strictObject({
  masterOwner: MasterOwnerSchema.nullable().describe('null clears the master owner'),
  writersConfirmed: z.boolean().describe('All songwriters and composers are credited'),
  accuracyConfirmed: z.boolean().describe('The rights information is accurate'),
  expectedUpdatedAt: z.iso
    .datetime({ offset: true })
    .describe('Release version read before editing'),
})

export class UpdateReleaseRightsDto extends createZodDto(UpdateReleaseRightsSchema) {}
