import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { RELEASE_VALIDATION } from '../errors'

const title = z.string().trim().min(1).max(255)

/** Multipart sends text parts only, so the recording list travels as a JSON string. */
const parseJson = (value: unknown) => {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

/** Text parts sent with an optional `cover` file; the service requires at least one change. */
export const SubmitReleaseChangesSchema = z.strictObject({
  title: title.optional().describe('Proposed release title'),
  recordings: z
    .preprocess(
      parseJson,
      z
        .array(z.strictObject({ id: z.uuid(), title }))
        .min(1)
        .max(50)
        .refine(
          (items) => new Set(items.map((item) => item.id)).size === items.length,
          RELEASE_VALIDATION.DUPLICATE_ITEMS,
        ),
    )
    .optional()
    .describe(
      'JSON array of { id, title } for recordings first published in this release; id is the recording id',
    ),
})

export class SubmitReleaseChangesDto extends createZodDto(SubmitReleaseChangesSchema) {}
