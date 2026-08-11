import { z } from 'zod'

export const searchResultTypeSchema = z.enum([
  'track',
  'artist',
  'album',
  'playlist',
])

export const searchResultSchema = z.object({
  id: z.string(),
  image: z.string().nullable(),
  rank: z.number(),
  subtitle: z.string().nullable(),
  title: z.string(),
  type: searchResultTypeSchema,
})

export const searchResponseSchema = z.object({
  data: z.object({
    albums: z.array(searchResultSchema),
    artists: z.array(searchResultSchema),
    playlists: z.array(searchResultSchema),
    tracks: z.array(searchResultSchema),
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
