import {
  createQueryCodec,
  intParam,
  stringParam,
  triStateParam,
  type QueryCodec,
  type TriState,
} from '@presentation/state'

export type ArtistsQuery = {
  query: string
  verified: TriState
  page: number
}

export const artistsQueryCodec: QueryCodec<ArtistsQuery> = createQueryCodec<ArtistsQuery>({
  defaults: { query: '', verified: 'all', page: 1 },
  fields: {
    query: { param: 'q', codec: stringParam() },
    verified: { param: 'verified', codec: triStateParam() },
    page: { param: 'page', codec: intParam(1) },
  },
})
