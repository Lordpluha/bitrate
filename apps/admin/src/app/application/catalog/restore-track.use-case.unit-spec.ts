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
import { RestoreTrackUseCase } from './restore-track.use-case'

const restore = vi.fn<(input: TakeDownInput) => Promise<void>>()

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

  override takeDown(_input: TakeDownInput): Promise<void> {
    throw new Error('not used')
  }

  override restore(input: TakeDownInput): Promise<void> {
    return restore(input)
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
    takenDownAt: new Date('2026-09-10T08:00:00.000Z'),
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    ...overrides,
  }
}

function create(): RestoreTrackUseCase {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [{ provide: TrackRepository, useClass: StubTrackRepository }],
  })

  return TestBed.inject(RestoreTrackUseCase)
}

describe('RestoreTrackUseCase', () => {
  beforeEach(() => {
    restore.mockReset()
    restore.mockResolvedValue(undefined)
  })

  it('restores a taken-down track', async () => {
    await create().execute({ track: track(), reason: 'appeal upheld' })

    expect(restore).toHaveBeenCalledWith({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      reason: 'appeal upheld',
    })
  })

  it('refuses a track that is not taken down, without calling the API', async () => {
    const active = track({ takenDownAt: null })

    await expect(create().execute({ track: active })).rejects.toThrow(ActionNotAllowedError)
    expect(restore).not.toHaveBeenCalled()
  })
})
