import type { AlbumSortField } from '@domain/album'
import { coveringTuple, type ResourceStatus, type Sort } from '@domain/shared'
import {
  createQueryCodec,
  intParam,
  type QueryCodec,
  resourceStatusParam,
  sortParam,
  stringParam,
} from '@presentation/state'

const ALBUMS_SORT_FIELDS = coveringTuple<AlbumSortField>()(['createdAt', 'title', 'releaseDate'])

export type AlbumsQuery = {
  query: string
  /** Take-down state; the default `active` keeps taken-down albums out of a clean URL's list. */
  resourceStatus: ResourceStatus
  /** Narrows to one artist's albums; empty means every artist. */
  artistId: string
  sort: Sort<AlbumSortField> | null
  page: number
}

export const albumsQueryCodec: QueryCodec<AlbumsQuery> = createQueryCodec<AlbumsQuery>({
  defaults: { query: '', resourceStatus: 'active', artistId: '', sort: null, page: 1 },
  fields: {
    query: { param: 'q', codec: stringParam() },
    resourceStatus: { param: 'resourceStatus', codec: resourceStatusParam() },
    artistId: { param: 'artistId', codec: stringParam() },
    sort: sortParam({ members: ALBUMS_SORT_FIELDS }),
    page: { param: 'page', codec: intParam(1) },
  },
})
