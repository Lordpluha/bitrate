import { TestBed } from '@angular/core/testing'
import { describe, expect, it, vi } from 'vitest'
import {
  type ListReportsQuery,
  type ModerationReport,
  ModerationReportRepository,
  type ReportDetail,
} from '@domain/moderation'
import type { BatchResult, Page } from '@domain/shared'
import { CountOpenReportsUseCase } from './count-open-reports.use-case'

const list = vi.fn<(query: ListReportsQuery) => Promise<Page<ModerationReport>>>()

class StubReportRepository extends ModerationReportRepository {
  override list(query: ListReportsQuery): Promise<Page<ModerationReport>> {
    return list(query)
  }

  override getById(): Promise<ReportDetail> {
    throw new Error('not used')
  }

  override setStatus(): Promise<ModerationReport> {
    throw new Error('not used')
  }

  override resolveMany(): Promise<BatchResult> {
    throw new Error('not used')
  }

  override dismissMany(): Promise<BatchResult> {
    throw new Error('not used')
  }
}

describe('CountOpenReportsUseCase', () => {
  it('counts the open reports naming one kind of content', async () => {
    list.mockReset().mockResolvedValue({ items: [], total: 2, page: 1, limit: 1 })
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [{ provide: ModerationReportRepository, useClass: StubReportRepository }],
    })

    expect(await TestBed.inject(CountOpenReportsUseCase).execute('album')).toBe(2)
    expect(list).toHaveBeenCalledWith({
      page: 1,
      limit: 1,
      filter: { status: 'OPEN', entityType: 'album' },
    })
  })
})
