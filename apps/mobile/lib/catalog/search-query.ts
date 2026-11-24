import type { ApiSchemas } from '@bitrate/contracts'
import { queryOptions } from '@tanstack/react-query'

import { api } from '@/lib/api/client'
import { ensureOk } from '@/lib/api/ensure-ok'

import { catalogKeys } from './query-keys'
import type { SearchFilter } from './search-filter'

export type SearchResponse = ApiSchemas['SearchResponseEntity']
export type SearchResult = ApiSchemas['SearchResultEntity']

const RESULTS_PER_TYPE = 20

/** `GET /search` for a trimmed, non-empty query; `all` asks for every result type. */
export const searchQuery = (query: string, filter: SearchFilter) =>
  queryOptions({
    queryKey: catalogKeys.search(query, filter),
    enabled: query.length > 0,
    queryFn: async ({ signal }): Promise<SearchResponse> => {
      const { data, response } = await api.GET('/api/v1/search', {
        params: {
          query: { q: query, limit: RESULTS_PER_TYPE, ...(filter === 'all' ? {} : { types: [filter] }) },
        },
        signal,
      })
      ensureOk(response, 'Search failed')
      if (!data) throw new Error('Search returned no body')
      return data
    },
    staleTime: 30 * 1000,
  })
