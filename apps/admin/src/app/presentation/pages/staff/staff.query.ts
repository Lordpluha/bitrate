import type { StaffSortField } from '@domain/staff'
import { coveringTuple, type Sort } from '@domain/shared'
import { createQueryCodec, intParam, sortParam, type QueryCodec } from '@presentation/state'

const STAFF_SORT_FIELDS = coveringTuple<StaffSortField>()(['username', 'email', 'createdAt'])

export type StaffQuery = {
  sort: Sort<StaffSortField> | null
  page: number
}

/** No text/status filter yet — sorting is what this stage adds. */
export const staffQueryCodec: QueryCodec<StaffQuery> = createQueryCodec<StaffQuery>({
  defaults: { sort: null, page: 1 },
  fields: {
    sort: sortParam({ members: STAFF_SORT_FIELDS }),
    page: { param: 'page', codec: intParam(1) },
  },
})
