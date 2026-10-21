import type { Prisma } from '@prisma/client'

/** The columns the list, detail and take-down responses share, with the episode count joined. */
export const PODCAST_ROW_SELECT = {
  id: true,
  title: true,
  publisher: true,
  cover: true,
  language: true,
  explicit: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { episodes: true } },
} as const satisfies Prisma.PodcastSelect

/** The episode columns an operator sees — never the audio location. */
export const EPISODE_ROW_SELECT = {
  id: true,
  podcastId: true,
  title: true,
  duration: true,
  releaseDate: true,
  explicit: true,
  deletedAt: true,
} as const satisfies Prisma.EpisodeSelect

/** The row columns plus the description and every episode — only the detail page shows these. */
export const PODCAST_DETAIL_SELECT = {
  ...PODCAST_ROW_SELECT,
  description: true,
  episodes: {
    orderBy: [{ releaseDate: { sort: 'desc', nulls: 'last' } }, { id: 'desc' }],
    select: EPISODE_ROW_SELECT,
  },
} as const satisfies Prisma.PodcastSelect

export type PodcastRowRecord = Prisma.PodcastGetPayload<{ select: typeof PODCAST_ROW_SELECT }>
export type PodcastDetailRecord = Prisma.PodcastGetPayload<{ select: typeof PODCAST_DETAIL_SELECT }>
