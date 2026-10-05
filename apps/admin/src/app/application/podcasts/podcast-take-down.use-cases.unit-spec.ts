import { TestBed } from '@angular/core/testing'
import {
  type EpisodeTakeDownInput,
  type ListPodcastsQuery,
  type Podcast,
  type PodcastDetail,
  type PodcastEpisode,
  PodcastRepository,
} from '@domain/podcast'
import { ActionNotAllowedError, type Page, type TakeDownInput } from '@domain/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RestorePodcastUseCase } from './restore-podcast.use-case'
import { RestorePodcastEpisodeUseCase } from './restore-podcast-episode.use-case'
import { TakeDownPodcastUseCase } from './take-down-podcast.use-case'
import { TakeDownPodcastEpisodeUseCase } from './take-down-podcast-episode.use-case'

const takeDown = vi.fn<(input: TakeDownInput) => Promise<void>>()
const restore = vi.fn<(input: TakeDownInput) => Promise<void>>()
const takeDownEpisode = vi.fn<(input: EpisodeTakeDownInput) => Promise<void>>()
const restoreEpisode = vi.fn<(input: EpisodeTakeDownInput) => Promise<void>>()

class StubPodcastRepository extends PodcastRepository {
  override list(_query: ListPodcastsQuery): Promise<Page<Podcast>> {
    throw new Error('not used')
  }

  override getById(_id: string): Promise<PodcastDetail> {
    throw new Error('not used')
  }

  override takeDown(input: TakeDownInput): Promise<void> {
    return takeDown(input)
  }

  override restore(input: TakeDownInput): Promise<void> {
    return restore(input)
  }

  override takeDownEpisode(input: EpisodeTakeDownInput): Promise<void> {
    return takeDownEpisode(input)
  }

  override restoreEpisode(input: EpisodeTakeDownInput): Promise<void> {
    return restoreEpisode(input)
  }
}

const PODCAST_ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
const EPISODE_ID = '5f2504e0-4f89-41d3-9a0c-0305e82c3305'
const TAKEN_DOWN = new Date('2026-09-10T08:00:00.000Z')

function podcast(overrides: Partial<Podcast> = {}): Podcast {
  return {
    id: PODCAST_ID,
    title: 'Signal Hour',
    publisher: 'Bitrate FM',
    coverUrl: null,
    language: 'en',
    explicit: false,
    episodeCount: 3,
    takenDownAt: null,
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    updatedAt: new Date('2026-09-01T09:59:00.000Z'),
    ...overrides,
  }
}

function episode(overrides: Partial<PodcastEpisode> = {}): PodcastEpisode {
  return {
    id: EPISODE_ID,
    podcastId: PODCAST_ID,
    title: 'Episode 1',
    durationSeconds: 1800,
    releaseDate: null,
    explicit: false,
    takenDownAt: null,
    ...overrides,
  }
}

describe('podcast take-down use cases', () => {
  beforeEach(() => {
    for (const mock of [takeDown, restore, takeDownEpisode, restoreEpisode]) {
      mock.mockReset()
      mock.mockResolvedValue(undefined)
    }
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [{ provide: PodcastRepository, useClass: StubPodcastRepository }],
    })
  })

  it('takes down an active podcast, forwarding the reason', async () => {
    await TestBed.inject(TakeDownPodcastUseCase).execute({
      podcast: podcast(),
      reason: 'rights claim',
    })

    expect(takeDown).toHaveBeenCalledWith({ id: PODCAST_ID, reason: 'rights claim' })
    expect(takeDownEpisode).not.toHaveBeenCalled()
  })

  it('refuses to take down a podcast already taken down, without calling the API', async () => {
    await expect(
      TestBed.inject(TakeDownPodcastUseCase).execute({
        podcast: podcast({ takenDownAt: TAKEN_DOWN }),
      }),
    ).rejects.toThrow(ActionNotAllowedError)
    expect(takeDown).not.toHaveBeenCalled()
  })

  it('restores a taken-down podcast and refuses an active one', async () => {
    await TestBed.inject(RestorePodcastUseCase).execute({
      podcast: podcast({ takenDownAt: TAKEN_DOWN }),
      reason: 'appeal upheld',
    })
    expect(restore).toHaveBeenCalledWith({ id: PODCAST_ID, reason: 'appeal upheld' })

    await expect(
      TestBed.inject(RestorePodcastUseCase).execute({ podcast: podcast() }),
    ).rejects.toThrow(ActionNotAllowedError)
    expect(restore).toHaveBeenCalledTimes(1)
  })

  /** AC1: an episode take-down addresses the episode through its own podcast id only. */
  it('takes down an active episode through its podcast, forwarding the reason', async () => {
    await TestBed.inject(TakeDownPodcastEpisodeUseCase).execute({
      episode: episode(),
      reason: 'dmca',
    })

    expect(takeDownEpisode).toHaveBeenCalledWith({
      podcastId: PODCAST_ID,
      episodeId: EPISODE_ID,
      reason: 'dmca',
    })
    expect(takeDown).not.toHaveBeenCalled()
  })

  it('refuses to take down an episode already taken down, without calling the API', async () => {
    await expect(
      TestBed.inject(TakeDownPodcastEpisodeUseCase).execute({
        episode: episode({ takenDownAt: TAKEN_DOWN }),
      }),
    ).rejects.toThrow(ActionNotAllowedError)
    expect(takeDownEpisode).not.toHaveBeenCalled()
  })

  it('restores a taken-down episode and refuses an active one', async () => {
    await TestBed.inject(RestorePodcastEpisodeUseCase).execute({
      episode: episode({ takenDownAt: TAKEN_DOWN }),
    })
    expect(restoreEpisode).toHaveBeenCalledWith({
      podcastId: PODCAST_ID,
      episodeId: EPISODE_ID,
      reason: undefined,
    })

    await expect(
      TestBed.inject(RestorePodcastEpisodeUseCase).execute({ episode: episode() }),
    ).rejects.toThrow(ActionNotAllowedError)
    expect(restoreEpisode).toHaveBeenCalledTimes(1)
  })
})
