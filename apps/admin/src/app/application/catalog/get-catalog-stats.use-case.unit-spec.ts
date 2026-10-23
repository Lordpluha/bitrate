import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type ListTracksQuery,
  type ProcessingAttempt,
  type Track,
  type TrackAudioSource,
  type TrackDetail,
  TrackRepository,
} from '@domain/track'
import type { BatchResult, Page } from '@domain/shared'
import { GetCatalogStatsUseCase } from './get-catalog-stats.use-case'

const list = vi.fn<(query: ListTracksQuery) => Promise<Page<Track>>>()

class StubTrackRepository extends TrackRepository {
  override list(query: ListTracksQuery): Promise<Page<Track>> {
    return list(query)
  }

  override getById(): Promise<TrackDetail> {
    throw new Error('not used')
  }

  override reprocess(): Promise<void> {
    throw new Error('not used')
  }

  override takeDown(): Promise<void> {
    throw new Error('not used')
  }

  override takeDownMany(): Promise<BatchResult> {
    throw new Error('not used')
  }

  override restore(): Promise<void> {
    throw new Error('not used')
  }

  override listProcessingAttempts(): Promise<Page<ProcessingAttempt>> {
    throw new Error('not used')
  }

  override probeAudio(): Promise<TrackAudioSource> {
    throw new Error('not used')
  }
}

function track(overrides: Partial<Track> = {}): Track {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Late Signal',
    artistUsername: 'outer.loop',
    coverUrl: null,
    processingStatus: 'PROCESSING',
    processingError: null,
    processingAttempts: 1,
    processingStartedAt: new Date('2026-10-22T11:18:00.000Z'),
    processingFinishedAt: null,
    updatedAt: new Date('2026-10-22T11:18:00.000Z'),
    takenDownAt: null,
    createdAt: new Date('2026-10-22T11:17:00.000Z'),
    ...overrides,
  }
}

const TOTALS = { READY: 1284, PROCESSING: 47, FAILED: 3 }

function create(): GetCatalogStatsUseCase {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [{ provide: TrackRepository, useClass: StubTrackRepository }],
  })
  return TestBed.inject(GetCatalogStatsUseCase)
}

describe('GetCatalogStatsUseCase', () => {
  beforeEach(() => {
    list.mockReset()
  })

  it('counts live tracks by where they are in the pipeline', async () => {
    list.mockImplementation(({ filter }) =>
      Promise.resolve({
        items: filter.processingStatus === 'PROCESSING' ? [track()] : [],
        total: filter.processingStatus ? TOTALS[filter.processingStatus] : 0,
        page: 1,
        limit: 1,
      }),
    )

    expect(await create().execute()).toEqual({
      ready: 1284,
      processing: 47,
      failed: 3,
      oldestProcessingAt: new Date('2026-10-22T11:18:00.000Z'),
    })
  })

  it('counts only live tracks, and dates the oldest one still processing', async () => {
    list.mockResolvedValue({ items: [], total: 0, page: 1, limit: 1 })

    await create().execute()

    expect(list).toHaveBeenCalledWith({
      page: 1,
      limit: 1,
      filter: {
        processingStatus: 'PROCESSING',
        status: 'active',
        sort: { field: 'createdAt', direction: 'asc' },
      },
    })
    expect(list).toHaveBeenCalledWith({
      page: 1,
      limit: 1,
      filter: { processingStatus: 'FAILED', status: 'active' },
    })
  })

  it('falls back to the upload time when processing never started', async () => {
    list.mockResolvedValue({
      items: [track({ processingStartedAt: null })],
      total: 1,
      page: 1,
      limit: 1,
    })

    expect((await create().execute()).oldestProcessingAt).toEqual(
      new Date('2026-10-22T11:17:00.000Z'),
    )
  })

  it('fails when any count fails', async () => {
    list.mockImplementation(({ filter }) =>
      filter.processingStatus === 'FAILED'
        ? Promise.reject(new Error('down'))
        : Promise.resolve({ items: [], total: 1, page: 1, limit: 1 }),
    )

    await expect(create().execute()).rejects.toThrow('down')
  })
})
