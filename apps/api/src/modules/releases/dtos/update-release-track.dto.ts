import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { RELEASE_VALIDATION } from '../errors'
import { normalizeIsrc } from '../release-identifiers'

const IsrcSchema = z.string().transform((value, context) => {
  const isrc = normalizeIsrc(value)
  if (isrc) return isrc
  context.addIssue({ code: 'custom', message: RELEASE_VALIDATION.ISRC_INVALID })
  return z.NEVER
})

export const UpdateReleaseTrackSchema = z.strictObject({
  isrc: IsrcSchema.nullable().describe(
    'ISO 3901 code, with or without hyphens; stored without them. null clears it. Optional for submission.',
  ),
  expectedUpdatedAt: z.iso
    .datetime({ offset: true })
    .describe('Release version read before editing'),
})

export class UpdateReleaseTrackDto extends createZodDto(UpdateReleaseTrackSchema) {}
