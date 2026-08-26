import { describe, expect, it } from 'vitest'
import type { SavedEpisode } from '@/entities/Podcast'
import { buildSavedPodcastLibraryItems } from './buildSavedPodcastLibraryItems'

const buildEpisode = (id: string): SavedEpisode => ({
  audioUrl: `${id}.mp3`,
  cover: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  description: null,
  duration: 60,
  explicit: false,
  id,
  podcast: {
    cover: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    description: null,
    explicit: false,
    id: 'podcast-1',
    language: null,
    publisher: 'Publisher',
    title: 'The Show',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  podcastId: 'podcast-1',
  releaseDate: null,
  savedAt: '2026-01-01T00:00:00.000Z',
  title: `Episode ${id}`,
  updatedAt: '2026-01-01T00:00:00.000Z',
})

describe('buildSavedPodcastLibraryItems', () => {
  it('uses the podcast id as the destination and deduplicates its episodes', () => {
    const items = buildSavedPodcastLibraryItems([
      buildEpisode('episode-1'),
      buildEpisode('episode-2'),
    ])

    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      id: 'podcast-1',
      title: 'The Show',
      type: 'podcast',
    })
  })
})
