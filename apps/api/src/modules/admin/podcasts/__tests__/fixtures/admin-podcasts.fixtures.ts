import type { Episode, Podcast } from '@prisma/client'

/** Builds a full podcast record for tests (mirrors the Prisma model shape). */
export const buildPodcast = (overrides: Partial<Podcast> = {}): Podcast => ({
  id: 'podcast-1',
  title: 'Signal Hour',
  publisher: 'Bitrate FM',
  description: null,
  cover: null,
  language: 'en',
  explicit: false,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  deletedAt: null,
  ...overrides,
})

/** Builds a podcast as the admin list/take-down queries return it, episode count included. */
export const buildPodcastWithCount = (overrides: Partial<Podcast> = {}, episodes = 3) => ({
  ...buildPodcast(overrides),
  _count: { episodes },
})

/** Builds a full episode record for tests (mirrors the Prisma model shape). */
export const buildEpisode = (overrides: Partial<Episode> = {}): Episode => ({
  id: 'episode-1',
  podcastId: 'podcast-1',
  title: 'Episode 1',
  description: null,
  audioUrl: 'episode-1.mp3',
  cover: null,
  duration: 1800,
  releaseDate: new Date('2026-01-02T00:00:00Z'),
  explicit: false,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  deletedAt: null,
  ...overrides,
})

/** Builds the flattened operator row the service returns for one podcast. */
export const buildAdminPodcastRow = (overrides: Partial<Podcast> = {}) => {
  const { id, title, publisher, cover, language, explicit, deletedAt } = buildPodcast(overrides)
  return {
    id,
    title,
    publisher,
    cover,
    language,
    explicit,
    episodeCount: 3,
    deletedAt,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  }
}

/** Builds the operator row the service returns for one episode. */
export const buildAdminEpisodeRow = (overrides: Partial<Episode> = {}) => {
  const { id, podcastId, title, duration, releaseDate, explicit, deletedAt } =
    buildEpisode(overrides)
  return { id, podcastId, title, duration, releaseDate, explicit, deletedAt }
}
