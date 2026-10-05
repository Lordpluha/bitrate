import { describe, expect, it } from 'vitest'
import {
  canRestoreEpisode,
  canRestorePodcast,
  canTakeDownEpisode,
  canTakeDownPodcast,
  type Podcast,
  type PodcastEpisode,
} from './podcast'

function podcast(overrides: Partial<Podcast> = {}): Podcast {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Signal Hour',
    publisher: 'Bitrate FM',
    coverUrl: null,
    language: 'en',
    explicit: false,
    episodeCount: 3,
    takenDownAt: null,
    createdAt: new Date('2026-09-01T00:00:00.000Z'),
    updatedAt: new Date('2026-09-01T00:00:00.000Z'),
    ...overrides,
  }
}

function episode(overrides: Partial<PodcastEpisode> = {}): PodcastEpisode {
  return {
    id: '5f2504e0-4f89-41d3-9a0c-0305e82c3305',
    podcastId: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Episode 1',
    durationSeconds: 1800,
    releaseDate: null,
    explicit: false,
    takenDownAt: null,
    ...overrides,
  }
}

describe('podcast policy', () => {
  it('allows taking down an active podcast and refuses one already taken down', () => {
    expect(canTakeDownPodcast(podcast()).allowed).toBe(true)
    expect(canTakeDownPodcast(podcast({ takenDownAt: new Date() }))).toEqual({
      allowed: false,
      reason: '"Signal Hour" is already taken down.',
    })
  })

  it('allows restoring a taken-down podcast and refuses an active one', () => {
    expect(canRestorePodcast(podcast({ takenDownAt: new Date() })).allowed).toBe(true)
    expect(canRestorePodcast(podcast())).toEqual({
      allowed: false,
      reason: '"Signal Hour" is not taken down.',
    })
  })

  /** AC1/AC2: each level's policy reads only its own take-down state. */
  it('judges an episode by its own state, not its podcast', () => {
    expect(canTakeDownEpisode(episode()).allowed).toBe(true)
    expect(canTakeDownEpisode(episode({ takenDownAt: new Date() })).allowed).toBe(false)
    expect(canRestoreEpisode(episode({ takenDownAt: new Date() })).allowed).toBe(true)
    expect(canRestoreEpisode(episode())).toEqual({
      allowed: false,
      reason: '"Episode 1" is not taken down.',
    })
  })
})
