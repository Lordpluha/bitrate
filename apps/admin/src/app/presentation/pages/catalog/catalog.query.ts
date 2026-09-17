import { coveringTuple, type Sort } from '@domain/shared'
import type { TrackProcessingStatus, TrackSortField } from '@domain/track'
import {
  createQueryCodec,
  enumParam,
  intParam,
  sortParam,
  stringParam,
  type QueryCodec,
} from '@presentation/state'

/** Problem-first, which is not the union's order — `coveringTuple` only requires it be covered. */
export const CATALOG_STATUSES = coveringTuple<TrackProcessingStatus>()([
  'FAILED',
  'PROCESSING',
  'READY',
])

/** Not the wire's declared order — only what `coveringTuple` requires: every member present. */
export const CATALOG_SORT_FIELDS = coveringTuple<TrackSortField>()([
  'createdAt',
  'title',
  'processingStatus',
])

export type CatalogQuery = {
  query: string
  status: TrackProcessingStatus | null
  sort: Sort<TrackSortField> | null
  page: number
}

export const catalogQueryCodec: QueryCodec<CatalogQuery> = createQueryCodec<CatalogQuery>({
  defaults: { query: '', status: null, sort: null, page: 1 },
  fields: {
    query: { param: 'q', codec: stringParam() },
    status: { param: 'status', codec: enumParam({ members: CATALOG_STATUSES, default: null }) },
    sort: sortParam({ members: CATALOG_SORT_FIELDS }),
    page: { param: 'page', codec: intParam(1) },
  },
})
