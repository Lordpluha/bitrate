import { paginationQuerySchema } from '@common/pagination'
import { RELEASE_VALIDATION } from '@modules/releases/errors'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { feedback } from './release-review.dto'

export const RELEASE_CHANGE_QUEUE_STATUSES = ['OPEN', 'CLOSED'] as const

export const ListReleaseChangeRequestsQuerySchema = z.strictObject({
  ...paginationQuerySchema.shape,
  status: z.enum(RELEASE_CHANGE_QUEUE_STATUSES).default('OPEN'),
})

/** A rejection always tells the artist why; an approval carries nothing else. */
const ReleaseChangeDecisionSchema = z.discriminatedUnion('decision', [
  z.strictObject({ changeId: z.uuid(), decision: z.literal('APPROVE') }),
  z.strictObject({
    changeId: z.uuid(),
    decision: z.literal('REJECT'),
    reason: feedback.describe('Why the change was rejected, in Markdown'),
  }),
])

export const DecideReleaseChangesSchema = z.strictObject({
  decisions: z
    .array(ReleaseChangeDecisionSchema)
    .min(1)
    .max(60)
    .refine(
      (items) => new Set(items.map((item) => item.changeId)).size === items.length,
      RELEASE_VALIDATION.DUPLICATE_ITEMS,
    )
    .describe('Outcomes for some or all pending changes of the request'),
  message: feedback.optional().describe('Optional comment on the whole request, in Markdown'),
})

export class ListReleaseChangeRequestsQueryDto extends createZodDto(
  ListReleaseChangeRequestsQuerySchema,
) {}
export class DecideReleaseChangesDto extends createZodDto(DecideReleaseChangesSchema) {}
