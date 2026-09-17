import { createQueryCodec, intParam, type QueryCodec } from '@presentation/state'

export type StaffQuery = { page: number }

/** No filter yet — sortable/filterable columns are a later stage, for every list at once. */
export const staffQueryCodec: QueryCodec<StaffQuery> = createQueryCodec({
  defaults: { page: 1 },
  fields: {
    page: { param: 'page', codec: intParam(1) },
  },
})
