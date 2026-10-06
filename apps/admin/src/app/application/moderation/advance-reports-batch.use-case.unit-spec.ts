import { TestBed } from '@angular/core/testing'
import {
  type ListReportsQuery,
  type ModerationReport,
  ModerationReportRepository,
  type ReportDetail,
} from '@domain/moderation'
import { ActionNotAllowedError, type BatchResult, type Page } from '@domain/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AdvanceReportsBatchUseCase } from './advance-reports-batch.use-case'

const resolveMany = vi.fn<(ids: readonly string[]) => Promise<BatchResult>>()
const dismissMany = vi.fn<(ids: readonly string[]) => Promise<BatchResult>>()

class StubReportRepository extends ModerationReportRepository {
  override list(_query: ListReportsQuery): Promise<Page<ModerationReport>> {
    throw new Error('not used')
  }

  override getById(_id: string): Promise<ReportDetail> {
    throw new Error('not used')
  }

  override setStatus(): Promise<ModerationReport> {
    throw new Error('not used')
  }

  override resolveMany(ids: readonly string[]): Promise<BatchResult> {
    return resolveMany(ids)
  }

  override dismissMany(ids: readonly string[]): Promise<BatchResult> {
    return dismissMany(ids)
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

const RESULT: BatchResult = { items: [], succeeded: 0, failed: 0 }

describe('AdvanceReportsBatchUseCase', () => {
  let useCase: AdvanceReportsBatchUseCase

  beforeEach(() => {
    resolveMany.mockReset()
    dismissMany.mockReset()
    resolveMany.mockResolvedValue(RESULT)
    dismissMany.mockResolvedValue(RESULT)
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [{ provide: ModerationReportRepository, useClass: StubReportRepository }],
    })
    useCase = TestBed.inject(AdvanceReportsBatchUseCase)
  })

  it('resolves every selected report in one request', async () => {
    const result = await useCase.execute({
      reports: [report({ id: 'a' }), report({ id: 'b' })],
      action: 'resolve',
    })

    expect(resolveMany).toHaveBeenCalledWith(['a', 'b'])
    expect(dismissMany).not.toHaveBeenCalled()
    expect(result).toBe(RESULT)
  })

  it('dismisses every selected report in one request', async () => {
    await useCase.execute({ reports: [report({ id: 'a' })], action: 'dismiss' })

    expect(dismissMany).toHaveBeenCalledWith(['a'])
    expect(resolveMany).not.toHaveBeenCalled()
  })

  it('refuses an empty selection and more than 100 rows', () => {
    expect(() => useCase.execute({ reports: [], action: 'resolve' })).toThrow(ActionNotAllowedError)
    const many = Array.from({ length: 101 }, (_, i) => report({ id: `r${i}` }))
    expect(() => useCase.execute({ reports: many, action: 'dismiss' })).toThrow(
      ActionNotAllowedError,
    )
  })
})
