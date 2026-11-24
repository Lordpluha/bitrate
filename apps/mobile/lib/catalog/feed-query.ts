import { queryOptions } from '@tanstack/react-query'

import { api } from '@/lib/api/client'
import { ensureOk } from '@/lib/api/ensure-ok'

import type { FeedRow } from './feed-card'
import { mapFeedItem } from './map-feed-item'
import { catalogKeys } from './query-keys'
import { feedSchema } from './schemas/feed-schema'

/** `GET /recommendations/feed` as rows of cards; empty sections are dropped. */
export const feedQuery = queryOptions({
  queryKey: catalogKeys.feed,
  queryFn: async (): Promise<FeedRow[]> => {
    const { data, response } = await api.GET('/api/v1/recommendations/feed')
    ensureOk(response, 'Failed to load recommendations')
    return feedSchema
      .parse(data)
      .sections.filter((section) => section.items.length > 0)
      .map((section) => ({
        id: section.id,
        title: section.title,
        cards: section.items.map((item) => mapFeedItem(section.id, item)),
      }))
  },
})
