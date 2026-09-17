import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type ListTracksQuery,
  type ProbeTrackAudioInput,
  type ProcessingAttempt,
  type Track,
  type TrackAudioSource,
  type TrackDetail,
  TrackRepository,
} from '@domain/track'
import { ActionNotAllowedError, type Page, type TakeDownInput } from '@domain/shared'
import { TakeDownTrackUseCase } from './take-down-track.use-case'

const takeDown = vi.fn<(input: TakeDownInput) => Promise<void>>()

class StubTrackRepository extends TrackRepository {
  override list(_query: ListTracksQuery): Promise<Page<Track>> {
    throw new Error('not used')
  }

  override getById(_id: string): Promise<TrackDetail> {
    throw new Error('not used')
  }

  override reprocess(_id: string): Promise<void> {
    throw new Error('not used')
  }

  override takeDown(input: TakeDownInput): Promise<void> {
    return takeDown(input)
  }

  override restore(_input: TakeDownInput): Promise<void> {
    throw new Error('not used')
  }

  override listProcessingAttempts(
    _trackId: string,
    _page: number,
  ): Promise<Page<ProcessingAttempt>> {
    throw new Error('not used')
  }

  override probeAudio(_input: ProbeTrackAudioInput): Promise<TrackAudioSource> {
    throw new Error('not used')
  }
}

function track(overrides: Partial<Track> = {}): Track {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Night Drive',
    artistUsername: 'dj-test',
    processingStatus: 'READY',
    processingError: null,
    processingAttempts: 0,
    processingStartedAt: null,
    processingFinishedAt: null,
    updatedAt: new Date('2026-09-01T09:59:00.000Z'),
    takenDownAt: null,
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    ...overrides,
  }
}

function create(): TakeDownTrackUseCase {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [{ provide: TrackRepository, useClass: StubTrackRepository }],
  })

  return TestBed.inject(TakeDownTrackUseCase)
}

describe('TakeDownTrackUseCase', () => {
  beforeEach(() => {
    takeDown.mockReset()
    takeDown.mockResolvedValue(undefined)
  })

  it('takes down a track that is not taken down', async () => {
    await create().execute({ track: track(), reason: 'rights claim' })

    expect(takeDown).toHaveBeenCalledWith({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      reason: 'rights claim',
    })
  })

  it('refuses a track that is already taken down, without calling the API', async () => {
    const already = track({ takenDownAt: new Date('2026-09-10T08:00:00.000Z') })

    await expect(create().execute({ track: already })).rejects.toThrow(ActionNotAllowedError)
    expect(takeDown).not.toHaveBeenCalled()
  })
})
