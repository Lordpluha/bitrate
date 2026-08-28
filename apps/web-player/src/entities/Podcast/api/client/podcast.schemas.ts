import { z } from 'zod'

const paginatedSchema = z.object({
  limit: z.number(),
  page: z.number(),
  total: z.number(),
})

export const podcastSchema = z.object({
  _count: z.object({ episodes: z.number() }).optional(),
  cover: z.string().nullable(),
  createdAt: z.string(),
  description: z.string().nullable(),
  explicit: z.boolean(),
  id: z.string(),
  language: z.string().nullable(),
  publisher: z.string(),
  title: z.string(),
  updatedAt: z.string(),
})

export const episodeSchema = z.object({
  audioUrl: z.string(),
  cover: z.string().nullable(),
  createdAt: z.string(),
  description: z.string().nullable(),
  duration: z.number().nullable(),
  explicit: z.boolean(),
  id: z.string(),
  podcastId: z.string(),
  releaseDate: z.string().nullable(),
  title: z.string(),
  updatedAt: z.string(),
})

export const podcastsSchema = paginatedSchema.extend({
  data: z.array(podcastSchema),
})

export const podcastDetailSchema = podcastSchema.extend({
  episodes: paginatedSchema.extend({ data: z.array(episodeSchema) }),
})

export const savedEpisodesSchema = paginatedSchema.extend({
  data: z.array(
    episodeSchema.extend({
      podcast: podcastSchema.omit({ _count: true }),
      savedAt: z.string(),
    }),
  ),
})

export type Episode = z.infer<typeof episodeSchema>
export type Podcast = z.infer<typeof podcastSchema>
export type SavedEpisode = z.infer<typeof savedEpisodesSchema>['data'][number]
