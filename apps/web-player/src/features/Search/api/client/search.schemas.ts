import { z } from 'zod'

/** The type names the API labels results with. */
export type SearchResultType = 'albums' | 'artists' | 'playlists' | 'tracks'

/**
 * Accepts either the plural type name the API actually sends ("playlists") or
 * the singular form this schema used to require, and always yields the plural.
 *
 * The mismatch rejected the entire search response, and only when a result came
 * back — an empty result set had no item to validate. A search that found
 * something therefore rendered as "No results found", while one that found
 * nothing looked perfectly healthy.
 */
export const searchResultTypeSchema = z
  .enum([
    'album',
    'albums',
    'artist',
    'artists',
    'playlist',
    'playlists',
    'track',
    'tracks',
  ])
  .transform(
    (value): SearchResultType =>
      value.endsWith('s')
        ? (value as SearchResultType)
        : (`${value}s` as SearchResultType),
  )

export const searchResultSchema = z.object({
  id: z.string(),
  image: z.string().nullable(),
  rank: z.number(),
  subtitle: z.string().nullable(),
  title: z.string(),
  type: searchResultTypeSchema,
})

export const searchResponseSchema = z.object({
  /**
   * The API returns only the buckets that were asked for, so a search narrowed
   * to a few types omits the rest entirely. Requiring all four rejected those
   * responses outright.
   */
  data: z.object({
    albums: z.array(searchResultSchema).default([]),
    artists: z.array(searchResultSchema).default([]),
    playlists: z.array(searchResultSchema).default([]),
    tracks: z.array(searchResultSchema).default([]),
  }),
  limit: z.number(),
  page: z.number(),
  topResult: searchResultSchema.nullable(),
  total: z.number(),
})

export const searchHistoryItemSchema = z.object({
  entityId: z.string().nullable(),
  entityType: z.string().nullable(),
  id: z.string(),
  query: z.string(),
  searchedAt: z.string(),
  userId: z.string(),
})

export const searchHistorySchema = z.object({
  data: z.array(searchHistoryItemSchema),
  limit: z.number(),
  page: z.number(),
  total: z.number(),
})

export type SearchHistoryItem = z.infer<typeof searchHistoryItemSchema>
export type SearchResult = z.infer<typeof searchResultSchema>
