import type { PlaylistSortField } from '@domain/playlist'
import { coveringTuple, type ResourceStatus, type Sort } from '@domain/shared'
import {
  createQueryCodec,
  intParam,
  type QueryCodec,
  resourceStatusParam,
  sortParam,
  stringParam,
} from '@presentation/state'

const PLAYLISTS_SORT_FIELDS = coveringTuple<PlaylistSortField>()(['createdAt', 'title'])

export type PlaylistsQuery = {
  query: string
  /** Take-down state; the default `active` keeps taken-down playlists out of a clean URL's list. */
  resourceStatus: ResourceStatus
  /** Narrows to one owner's playlists; empty means every owner. */
  ownerId: string
  sort: Sort<PlaylistSortField> | null
  page: number
}

export const playlistsQueryCodec: QueryCodec<PlaylistsQuery> = createQueryCodec<PlaylistsQuery>({
  defaults: { query: '', resourceStatus: 'active', ownerId: '', sort: null, page: 1 },
  fields: {
    query: { param: 'q', codec: stringParam() },
    resourceStatus: { param: 'resourceStatus', codec: resourceStatusParam() },
    ownerId: { param: 'ownerId', codec: stringParam() },
    sort: sortParam({ members: PLAYLISTS_SORT_FIELDS }),
    page: { param: 'page', codec: intParam(1) },
  },
})
