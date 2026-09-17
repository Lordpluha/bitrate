import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Overview, OverviewRepository } from '@domain/overview'
import { GetOverviewUseCase } from './get-overview.use-case'

const get = vi.fn<() => Promise<Overview>>()

class StubOverviewRepository extends OverviewRepository {
  override get(): Promise<Overview> {
    return get()
  }
}

function overview(overrides: Partial<Overview> = {}): Overview {
  return {
    reports: { open: 3, reviewing: 1 },
    tracks: { processing: 2, ready: 50, failed: 1, stuck: 1, stuckAfterMs: 1_800_000 },
    deactivated: { users: 2, artists: 0 },
    last7Days: { signups: 5, uploads: 12 },
    recentActivity: [],
    ...overrides,
  }
}

function create(): GetOverviewUseCase {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [{ provide: OverviewRepository, useClass: StubOverviewRepository }],
  })

  return TestBed.inject(GetOverviewUseCase)
}

describe('GetOverviewUseCase', () => {
  beforeEach(() => {
    get.mockReset()
  })

  it('returns the aggregate summary from the repository', async () => {
    const summary = overview()
    get.mockResolvedValue(summary)

    const result = await create().execute()

    expect(result).toBe(summary)
  })

  it('propagates a repository rejection instead of swallowing it', async () => {
    get.mockRejectedValue(new Error('network down'))

    await expect(create().execute()).rejects.toThrow('network down')
  })
})
