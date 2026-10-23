import { z } from 'zod'

const paginatedSchema = z.object({
  limit: z.number(),
  page: z.number(),
  total: z.number(),
})

const podcastSchema = z.object({
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

const episodeSchema = z.object({
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

const savedEpisodeSchema = episodeSchema.extend({
  podcast: podcastSchema.omit({ _count: true }),
  savedAt: z.string(),
})

export const savedEpisodesSchema = paginatedSchema.extend({
  data: z.array(savedEpisodeSchema),
})

export type Episode = z.infer<typeof episodeSchema>
export type SavedEpisode = z.infer<typeof savedEpisodeSchema>
export type PodcastDetail = z.infer<typeof podcastDetailSchema>

type ToSavedEpisodeInput = {
  episode: Episode
  podcast: PodcastDetail
}

/** The saved-library entry for an episode saved just now, without the detail-only fields. */
export const toSavedEpisode = ({
  episode,
  podcast,
}: ToSavedEpisodeInput): SavedEpisode =>
  savedEpisodeSchema.parse({
    ...episode,
    podcast,
    savedAt: new Date().toISOString(),
  })
