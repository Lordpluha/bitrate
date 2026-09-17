import type { ArtistSortField } from '@domain/artist'
import { coveringTuple, type Sort } from '@domain/shared'
import {
  createQueryCodec,
  intParam,
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
  sort: Sort<ArtistSortField> | null
  page: number
}

export const artistsQueryCodec: QueryCodec<ArtistsQuery> = createQueryCodec<ArtistsQuery>({
  defaults: { query: '', verified: 'all', sort: null, page: 1 },
  fields: {
    query: { param: 'q', codec: stringParam() },
    verified: { param: 'verified', codec: triStateParam() },
    sort: sortParam({ members: ARTISTS_SORT_FIELDS }),
    page: { param: 'page', codec: intParam(1) },
  },
})
