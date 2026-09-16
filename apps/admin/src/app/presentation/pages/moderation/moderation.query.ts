import type { ModerationStatus } from '@domain/moderation'
import { coveringTuple } from '@domain/shared'
import { createQueryCodec, enumParam, intParam, type QueryCodec } from '@presentation/state'

/** Every status is filterable, and `coveringTuple` is what keeps that true as the union grows. */
export const MODERATION_STATUSES = coveringTuple<ModerationStatus>()([
  'OPEN',
  'REVIEWING',
  'RESOLVED',
  'REJECTED',
])

export type ModerationQuery = {
  status: ModerationStatus | null
  page: number
}

/**
 * `status` defaults to `OPEN`, not "no filter" — the queue exists to be emptied, not browsed.
 * A clean `/moderation` URL therefore shows OPEN, and "All" is only reachable through the
 * explicit `?status=all` token.
 */
export const moderationQueryCodec: QueryCodec<ModerationQuery> = createQueryCodec<ModerationQuery>({
  defaults: { status: 'OPEN', page: 1 },
  fields: {
    status: {
      param: 'status',
      codec: enumParam({ members: MODERATION_STATUSES, default: 'OPEN', nullToken: 'all' }),
    },
    page: { param: 'page', codec: intParam(1) },
  },
})
