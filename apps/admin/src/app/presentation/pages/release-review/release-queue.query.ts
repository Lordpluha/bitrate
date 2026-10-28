import type { ReleaseQueueStatus } from '@domain/release-review'
import { coveringTuple } from '@domain/shared'
import {
  createQueryCodec,
  enumParam,
  intParam,
  type QueryCodec,
  stringParam,
} from '@presentation/state'

const QUEUE_STATUSES = coveringTuple<ReleaseQueueStatus>()([
  'SUBMITTED',
  'READY',
  'REJECTED',
  'PUBLISHING',
  'PUBLISH_FAILED',
  'RELEASED',
  'ALL',
])

export type ReleaseQueueQuery = {
  query: string
  /** `SUBMITTED` by default: the queue opens on what is waiting for a decision. */
  status: ReleaseQueueStatus | null
  page: number
}

export const releaseQueueQueryCodec: QueryCodec<ReleaseQueueQuery> =
  createQueryCodec<ReleaseQueueQuery>({
    defaults: { query: '', status: 'SUBMITTED', page: 1 },
    fields: {
      query: { param: 'q', codec: stringParam() },
      status: {
        param: 'status',
        codec: enumParam({ members: QUEUE_STATUSES, default: 'SUBMITTED' }),
      },
      page: { param: 'page', codec: intParam(1) },
    },
  })
