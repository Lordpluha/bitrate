import { TestBed } from '@angular/core/testing'
import { type OverviewReportsByType, OverviewRepository } from '@domain/overview'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetOverviewReportsByTypeUseCase } from './get-overview-reports-by-type.use-case'

const getReportsByType = vi.fn<(days: number) => Promise<OverviewReportsByType>>()

class StubOverviewRepository extends OverviewRepository {
  override get(): Promise<never> {
    throw new Error('not used by this use case')
  }

  override getSeries(): Promise<never> {
    throw new Error('not used by this use case')
  }

  override getReportsByType(days: number): Promise<OverviewReportsByType> {
    return getReportsByType(days)
  }
}

function reportsByType(): OverviewReportsByType {
  return {
    from: new Date('2026-09-11T00:00:00.000Z'),
    to: new Date('2026-09-17T00:00:00.000Z'),
    days: 7,
    dates: [],
    series: [],
    total: 0,
  }
}

function create(): GetOverviewReportsByTypeUseCase {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [{ provide: OverviewRepository, useClass: StubOverviewRepository }],
  })

  return TestBed.inject(GetOverviewReportsByTypeUseCase)
}

describe('GetOverviewReportsByTypeUseCase', () => {
  beforeEach(() => {
    getReportsByType.mockReset()
  })

  it('passes the requested window through to the repository', async () => {
    const result = reportsByType()
    getReportsByType.mockResolvedValue(result)

    const response = await create().execute(7)

    expect(getReportsByType).toHaveBeenCalledWith(7)
    expect(response).toBe(result)
  })

  it('propagates a repository rejection instead of swallowing it', async () => {
    getReportsByType.mockRejectedValue(new Error('network down'))

    await expect(create().execute(30)).rejects.toThrow('network down')
  })
})
