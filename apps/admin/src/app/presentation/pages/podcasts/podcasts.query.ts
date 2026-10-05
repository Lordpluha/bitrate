import type { PodcastSortField } from '@domain/podcast'
import { coveringTuple, type ResourceStatus, type Sort } from '@domain/shared'
import {
  createQueryCodec,
  intParam,
  type QueryCodec,
  resourceStatusParam,
  sortParam,
  stringParam,
} from '@presentation/state'

const PODCASTS_SORT_FIELDS = coveringTuple<PodcastSortField>()(['createdAt', 'title'])

type PodcastsQuery = {
  query: string
  /** Take-down state; the default `active` keeps taken-down podcasts out of a clean URL's list. */
  resourceStatus: ResourceStatus
  sort: Sort<PodcastSortField> | null
  page: number
}

export const podcastsQueryCodec: QueryCodec<PodcastsQuery> = createQueryCodec<PodcastsQuery>({
  defaults: { query: '', resourceStatus: 'active', sort: null, page: 1 },
  fields: {
    query: { param: 'q', codec: stringParam() },
    resourceStatus: { param: 'resourceStatus', codec: resourceStatusParam() },
    sort: sortParam({ members: PODCASTS_SORT_FIELDS }),
    page: { param: 'page', codec: intParam(1) },
  },
})
