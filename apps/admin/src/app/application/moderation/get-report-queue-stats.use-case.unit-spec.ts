import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type ListReportsQuery,
  type ModerationReport,
  ModerationReportRepository,
  type ReportDetail,
  type SetReportStatusInput,
} from '@domain/moderation'
import type { BatchResult, Page } from '@domain/shared'
import { GetReportQueueStatsUseCase } from './get-report-queue-stats.use-case'

const list = vi.fn<(query: ListReportsQuery) => Promise<Page<ModerationReport>>>()

class StubReportRepository extends ModerationReportRepository {
  override list(query: ListReportsQuery): Promise<Page<ModerationReport>> {
    return list(query)
  }

  override getById(_id: string): Promise<ReportDetail> {
    throw new Error('not used')
  }

  override setStatus(_input: SetReportStatusInput): Promise<ModerationReport> {
    throw new Error('not used')
  }

  override resolveMany(_ids: readonly string[]): Promise<BatchResult> {
    throw new Error('not used')
  }

  override dismissMany(_ids: readonly string[]): Promise<BatchResult> {
    throw new Error('not used')
  }
}

function report(overrides: Partial<ModerationReport> = {}): ModerationReport {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    reporterId: '3f2504e0-4f89-41d3-9a0c-0305e82c3302',
    entityType: 'track',
    entityId: '3f2504e0-4f89-41d3-9a0c-0305e82c3303',
    reason: 'Copyright',
    details: null,
    status: 'OPEN',
    resolvedAt: null,
    createdAt: new Date('2026-09-14T12:00:00.000Z'),
    ...overrides,
  }
}

function page(total: number, items: ModerationReport[] = []): Page<ModerationReport> {
  return { items, total, page: 1, limit: 1 }
}

function create(): GetReportQueueStatsUseCase {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [{ provide: ModerationReportRepository, useClass: StubReportRepository }],
  })
  return TestBed.inject(GetReportQueueStatsUseCase)
}

describe('GetReportQueueStatsUseCase', () => {
  beforeEach(() => {
    list.mockReset()
  })

  it('counts open and reviewing reports and dates the oldest open one', async () => {
    const oldest = report({ createdAt: new Date('2026-10-20T03:00:00.000Z') })
    list.mockImplementation(({ filter }) =>
      Promise.resolve(filter.status === 'OPEN' ? page(12, [oldest]) : page(4)),
    )

    const stats = await create().execute()

    expect(stats).toEqual({
      open: 12,
      reviewing: 4,
      oldestOpenAt: new Date('2026-10-20T03:00:00.000Z'),
    })
  })

  it('asks for one row of each, the open one oldest first', async () => {
    list.mockResolvedValue(page(0))

    await create().execute()

    expect(list).toHaveBeenCalledWith({
      page: 1,
      limit: 1,
      filter: { status: 'OPEN', sort: { field: 'createdAt', direction: 'asc' } },
    })
    expect(list).toHaveBeenCalledWith({ page: 1, limit: 1, filter: { status: 'REVIEWING' } })
  })

  it('has no oldest date when nothing is open', async () => {
    list.mockResolvedValue(page(0))

    expect((await create().execute()).oldestOpenAt).toBeNull()
  })

  it('fails when either count fails, rather than showing half the figures', async () => {
    list.mockImplementation(({ filter }) =>
      filter.status === 'REVIEWING' ? Promise.reject(new Error('down')) : Promise.resolve(page(3)),
    )

    await expect(create().execute()).rejects.toThrow('down')
  })
})
