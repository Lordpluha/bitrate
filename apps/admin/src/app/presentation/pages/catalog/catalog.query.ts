import { coveringTuple } from '@domain/shared'
import type { TrackProcessingStatus } from '@domain/track'
import { createQueryCodec, enumParam, intParam, stringParam, type QueryCodec } from '@presentation/state'

/** Problem-first, which is not the union's order — `coveringTuple` only requires it be covered. */
export const CATALOG_STATUSES = coveringTuple<TrackProcessingStatus>()([
  'FAILED',
  'PROCESSING',
  'READY',
])

export type CatalogQuery = {
  query: string
  status: TrackProcessingStatus | null
  page: number
}

export const catalogQueryCodec: QueryCodec<CatalogQuery> = createQueryCodec<CatalogQuery>({
  defaults: { query: '', status: null, page: 1 },
  fields: {
    query: { param: 'q', codec: stringParam() },
    status: { param: 'status', codec: enumParam({ members: CATALOG_STATUSES, default: null }) },
    page: { param: 'page', codec: intParam(1) },
  },
})
