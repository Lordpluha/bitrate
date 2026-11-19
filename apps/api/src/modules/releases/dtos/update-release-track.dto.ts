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

/** Artists tag each recording with a few catalogue genres; more would dilute genre browse. */
const MAX_RECORDING_GENRES = 3

export const UpdateReleaseTrackSchema = z
  .strictObject({
    title: z
      .string()
      .trim()
      .min(1)
      .max(255)
      .optional()
      .describe('Recording title shown in the release'),
    isrc: IsrcSchema.nullable()
      .optional()
      .describe(
        'ISO 3901 code, with or without hyphens; stored without them. null clears it. Optional for submission.',
      ),
    genreIds: z
      .array(z.uuid())
      .min(1)
      .max(MAX_RECORDING_GENRES)
      .refine((ids) => new Set(ids).size === ids.length, RELEASE_VALIDATION.DUPLICATE_ITEMS)
      .optional()
      .describe('Catalogue genre IDs; replaces the recording genres. Required for submission.'),
    expectedUpdatedAt: z.iso
      .datetime({ offset: true })
      .describe('Release version read before editing'),
  })
  .refine(
    (input) =>
      input.title !== undefined || input.isrc !== undefined || input.genreIds !== undefined,
    {
      error: RELEASE_VALIDATION.UPDATE_EMPTY,
    },
  )

export class UpdateReleaseTrackDto extends createZodDto(UpdateReleaseTrackSchema) {}
