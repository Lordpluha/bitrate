import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { normalizeIsrc } from '../release-identifiers'

const IsrcSchema = z.string().transform((value, context) => {
  const isrc = normalizeIsrc(value)
  if (isrc) return isrc
  context.addIssue({ code: 'custom', message: 'Enter an ISRC such as US-RC1-76-07839' })
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
