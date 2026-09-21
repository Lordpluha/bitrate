import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type OverviewSeries, OverviewRepository } from '@domain/overview'
import { GetOverviewSeriesUseCase } from './get-overview-series.use-case'

const getSeries = vi.fn<(days: number) => Promise<OverviewSeries>>()

class StubOverviewRepository extends OverviewRepository {
  override get(): Promise<never> {
    throw new Error('not used by this use case')
  }

  override getSeries(days: number): Promise<OverviewSeries> {
    return getSeries(days)
  }
}

function series(): OverviewSeries {
  return {
    from: new Date('2026-08-19T00:00:00.000Z'),
    to: new Date('2026-09-17T00:00:00.000Z'),
    days: 30,
    uploads: [],
    signups: [],
    listens: [],
    reports: [],
    reportsByStatus: { open: 0, reviewing: 0, resolved: 0, rejected: 0 },
  }
}

function create(): GetOverviewSeriesUseCase {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [{ provide: OverviewRepository, useClass: StubOverviewRepository }],
  })

  return TestBed.inject(GetOverviewSeriesUseCase)
}

describe('GetOverviewSeriesUseCase', () => {
  beforeEach(() => {
    getSeries.mockReset()
  })

  it('passes the requested window through to the repository', async () => {
    const result = series()
    getSeries.mockResolvedValue(result)

    const response = await create().execute(7)

    expect(getSeries).toHaveBeenCalledWith(7)
    expect(response).toBe(result)
  })

  it('propagates a repository rejection instead of swallowing it', async () => {
    getSeries.mockRejectedValue(new Error('network down'))

    await expect(create().execute(30)).rejects.toThrow('network down')
  })
})
