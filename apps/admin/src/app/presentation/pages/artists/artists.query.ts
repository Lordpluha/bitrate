import { coveringTuple, type ResourceStatus, type Sort } from '@domain/shared'
import type { ArtistSortField } from '@domain/artist'
import {
  createQueryCodec,
  intParam,
  resourceStatusParam,
  sortParam,
  stringParam,
  triStateParam,
  type QueryCodec,
  type TriState,
} from '@presentation/state'

export const ARTISTS_SORT_FIELDS = coveringTuple<ArtistSortField>()([
  'username',
  'email',
  'createdAt',
  'monthlyListeners',
])

export type ArtistsQuery = {
  query: string
  verified: TriState
  status: ResourceStatus
  sort: Sort<ArtistSortField> | null
  page: number
}

/** `status` defaults to `active` and is omitted from a clean URL, same convention as `page`. */
export const artistsQueryCodec: QueryCodec<ArtistsQuery> = createQueryCodec<ArtistsQuery>({
  defaults: { query: '', verified: 'all', status: 'active', sort: null, page: 1 },
  fields: {
    query: { param: 'q', codec: stringParam() },
    verified: { param: 'verified', codec: triStateParam() },
    status: { param: 'status', codec: resourceStatusParam() },
    sort: sortParam({ members: ARTISTS_SORT_FIELDS }),
    page: { param: 'page', codec: intParam(1) },
  },
})
