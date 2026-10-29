import type { ApiSchemas } from '@bitrate/contracts'
import { messageKey } from '@shared/i18n'
import { z } from 'zod'
import { releaseSummarySchema } from './release.schema'

export const contributorRoles = [
  'PERFORMER',
  'PRODUCER',
  'COMPOSER',
  'LYRICIST',
  'OTHER',
] as const satisfies readonly ApiSchemas['ReleaseCreditRole'][]

export const contributorSchema = z.strictObject({
  displayName: z
    .string()
    .trim()
    .min(1, messageKey('release.error.nameRequired'))
    .max(255, messageKey('release.error.nameTooLong')),
  roles: z
    .array(z.enum(contributorRoles))
    .min(1, messageKey('release.error.roleRequired'))
    .max(5)
    .refine(
      (roles) => new Set(roles).size === roles.length,
      messageKey('release.error.roleOnce'),
    ),
})
export type ContributorValues = z.infer<typeof contributorSchema>
export const participantSchema = contributorSchema.extend({ id: z.uuid() })
const participantReadSchema = z.object({
  id: z.uuid(),
  displayName: z.string(),
  roles: z.array(z.enum(contributorRoles)),
})
export const contributorResultSchema = z.object({
  release: releaseSummarySchema,
  participant: participantReadSchema,
}) satisfies z.ZodType<ApiSchemas['ReleaseContributorEntity']>
export type ReleaseContributor = ApiSchemas['ReleaseContributorEntity']
