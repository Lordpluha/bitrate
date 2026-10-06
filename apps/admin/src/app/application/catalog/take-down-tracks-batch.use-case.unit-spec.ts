import { TestBed } from '@angular/core/testing'
import { ActionNotAllowedError, type BatchResult, type Page } from '@domain/shared'
import { type ListTracksQuery, type Track, type TrackDetail, TrackRepository } from '@domain/track'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TakeDownTracksBatchUseCase } from './take-down-tracks-batch.use-case'

const takeDownMany = vi.fn<(ids: readonly string[]) => Promise<BatchResult>>()

class StubTrackRepository extends TrackRepository {
  override list(_query: ListTracksQuery): Promise<Page<Track>> {
    throw new Error('not used')
  }

  override getById(_id: string): Promise<TrackDetail> {
    throw new Error('not used')
  }

  override reprocess(): Promise<void> {
    throw new Error('not used')
  }

  override takeDown(): Promise<void> {
    throw new Error('not used')
  }

  override takeDownMany(ids: readonly string[]): Promise<BatchResult> {
    return takeDownMany(ids)
  }

  override restore(): Promise<void> {
    throw new Error('not used')
  }

  override listProcessingAttempts(): ReturnType<TrackRepository['listProcessingAttempts']> {
    throw new Error('not used')
  }

  override probeAudio(): ReturnType<TrackRepository['probeAudio']> {
    throw new Error('not used')
  }
}

function track(overrides: Partial<Track> = {}): Track {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Night Drive',
    artistUsername: 'dj-test',
    coverUrl: null,
    processingStatus: 'READY',
    processingError: null,
    processingAttempts: 1,
    processingStartedAt: null,
    processingFinishedAt: null,
    updatedAt: new Date('2026-09-01T09:59:00.000Z'),
    takenDownAt: null,
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    ...overrides,
  }
}

const RESULT: BatchResult = { items: [], succeeded: 0, failed: 0 }

describe('TakeDownTracksBatchUseCase', () => {
  let useCase: TakeDownTracksBatchUseCase

  beforeEach(() => {
    takeDownMany.mockReset()
    takeDownMany.mockResolvedValue(RESULT)
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [{ provide: TrackRepository, useClass: StubTrackRepository }],
    })
    useCase = TestBed.inject(TakeDownTracksBatchUseCase)
  })

  it('sends every selected id in one request and returns the per-row result', async () => {
    const result = await useCase.execute([track({ id: 'a' }), track({ id: 'b' })])

    expect(takeDownMany).toHaveBeenCalledWith(['a', 'b'])
    expect(result).toBe(RESULT)
  })

  it('refuses a selection that includes an already taken-down track', () => {
    const gone = track({ takenDownAt: new Date('2026-09-02T00:00:00.000Z') })

    expect(() => useCase.execute([track({ id: 'a' }), gone])).toThrow(ActionNotAllowedError)
    expect(takeDownMany).not.toHaveBeenCalled()
  })

  it('refuses an empty selection and more than 100 rows', () => {
    expect(() => useCase.execute([])).toThrow(ActionNotAllowedError)
    const many = Array.from({ length: 101 }, (_, i) => track({ id: `t${i}` }))
    expect(() => useCase.execute(many)).toThrow(ActionNotAllowedError)
    expect(takeDownMany).not.toHaveBeenCalled()
  })
})
