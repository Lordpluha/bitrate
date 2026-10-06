import type { GenreSortField } from '@domain/genre'
import { coveringTuple, type Sort } from '@domain/shared'
import {
  createQueryCodec,
  intParam,
  type QueryCodec,
  sortParam,
  stringParam,
} from '@presentation/state'

const GENRES_SORT_FIELDS = coveringTuple<GenreSortField>()(['name', 'slug', 'createdAt'])

export type GenresQuery = {
  query: string
  sort: Sort<GenreSortField> | null
  page: number
}

/** Defaults are omitted from a clean URL, same convention as the other lists. */
export const genresQueryCodec: QueryCodec<GenresQuery> = createQueryCodec<GenresQuery>({
  defaults: { query: '', sort: null, page: 1 },
  fields: {
    query: { param: 'q', codec: stringParam() },
    sort: sortParam({ members: GENRES_SORT_FIELDS }),
    page: { param: 'page', codec: intParam(1) },
  },
})
