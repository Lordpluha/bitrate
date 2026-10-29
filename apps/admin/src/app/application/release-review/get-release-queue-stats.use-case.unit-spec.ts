import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type ListReleaseSubmissionsQuery,
  type ReleaseChangesRequest,
  type ReleaseDecisionRequest,
  ReleaseReviewRepository,
  type ReleaseSubmission,
  type ReleaseSubmissionDetail,
  type SubmissionReview,
} from '@domain/release-review'
import type { Page } from '@domain/shared'
import { GetReleaseQueueStatsUseCase } from './get-release-queue-stats.use-case'

const list = vi.fn<(query: ListReleaseSubmissionsQuery) => Promise<Page<ReleaseSubmission>>>()

class StubReleaseRepository extends ReleaseReviewRepository {
  override list(query: ListReleaseSubmissionsQuery): Promise<Page<ReleaseSubmission>> {
    return list(query)
  }

  override getById(_id: string): Promise<ReleaseSubmissionDetail> {
    throw new Error('not used')
  }

  override audioUrl(_releaseId: string, _trackId: string): string {
    throw new Error('not used')
  }

  override approve(_input: ReleaseDecisionRequest): Promise<SubmissionReview> {
    throw new Error('not used')
  }

  override requestChanges(_input: ReleaseChangesRequest): Promise<SubmissionReview> {
    throw new Error('not used')
  }
  override retryPublishing(_id: string): Promise<void> {
    throw new Error('not used')
  }
  override takeDown(_id: string): Promise<void> {
    throw new Error('not used')
  }
}

function submission(overrides: Partial<ReleaseSubmission> = {}): ReleaseSubmission {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    title: 'Static Lines',
    kind: 'EP',
    status: 'SUBMITTED',
    coverUrl: null,
    submittedAt: new Date('2026-10-20T09:00:00.000Z'),
    updatedAt: new Date('2026-10-20T09:00:00.000Z'),
    artistId: '3f2504e0-4f89-41d3-9a0c-0305e82c3302',
    artistUsername: 'kite.harbor',
    trackCount: 5,
    ...overrides,
  }
}

function page(total: number, items: ReleaseSubmission[] = []): Page<ReleaseSubmission> {
  return { items, total, page: 1, limit: 1 }
}

function create(): GetReleaseQueueStatsUseCase {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [{ provide: ReleaseReviewRepository, useClass: StubReleaseRepository }],
  })
  return TestBed.inject(GetReleaseQueueStatsUseCase)
}

describe('GetReleaseQueueStatsUseCase', () => {
  beforeEach(() => {
    list.mockReset()
  })

  it('counts what awaits review and what waits on artists, dating the oldest submission', async () => {
    list.mockImplementation(({ filter }) =>
      Promise.resolve(filter.status === 'SUBMITTED' ? page(7, [submission()]) : page(3)),
    )

    expect(await create().execute()).toEqual({
      awaiting: 7,
      changesRequested: 3,
      oldestAwaitingAt: new Date('2026-10-20T09:00:00.000Z'),
    })
  })

  it('asks the queue for one row of each status', async () => {
    list.mockResolvedValue(page(0))

    await create().execute()

    expect(list).toHaveBeenCalledWith({ page: 1, limit: 1, filter: { status: 'SUBMITTED' } })
    expect(list).toHaveBeenCalledWith({ page: 1, limit: 1, filter: { status: 'REJECTED' } })
  })

  it('has no oldest date when nothing awaits review, or the row was never submitted', async () => {
    list.mockResolvedValue(page(0))
    expect((await create().execute()).oldestAwaitingAt).toBeNull()

    list.mockResolvedValue(page(1, [submission({ submittedAt: null })]))
    expect((await create().execute()).oldestAwaitingAt).toBeNull()
  })

  it('fails when either count fails', async () => {
    list.mockImplementation(({ filter }) =>
      filter.status === 'REJECTED' ? Promise.reject(new Error('down')) : Promise.resolve(page(1)),
    )

    await expect(create().execute()).rejects.toThrow('down')
  })
})
