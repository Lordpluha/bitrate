import { TestBed } from '@angular/core/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  type ListReportsQuery,
  type ModerationReport,
  ModerationReportRepository,
  type SetReportStatusInput,
} from '@domain/moderation'
import type { Page } from '@domain/shared'
import { AdvanceReportUseCase } from './advance-report.use-case'

const setStatus = vi.fn<(input: SetReportStatusInput) => Promise<ModerationReport>>()

class StubReportRepository extends ModerationReportRepository {
  override list(_query: ListReportsQuery): Promise<Page<ModerationReport>> {
    throw new Error('not used')
  }

  override setStatus(input: SetReportStatusInput): Promise<ModerationReport> {
    return setStatus(input)
  }
}

function report(overrides: Partial<ModerationReport> = {}): ModerationReport {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    reporterId: '3f2504e0-4f89-41d3-9a0c-0305e82c3302',
    entityType: 'Track',
    entityId: '3f2504e0-4f89-41d3-9a0c-0305e82c3303',
    reason: 'Copyright',
    details: null,
    status: 'OPEN',
    resolvedAt: null,
    createdAt: new Date('2026-09-14T12:00:00.000Z'),
    ...overrides,
  }
}

function create(): AdvanceReportUseCase {
  TestBed.resetTestingModule()
  TestBed.configureTestingModule({
    providers: [{ provide: ModerationReportRepository, useClass: StubReportRepository }],
  })

  return TestBed.inject(AdvanceReportUseCase)
}

describe('AdvanceReportUseCase', () => {
  beforeEach(() => {
    setStatus.mockReset()
    setStatus.mockImplementation(({ status }) => Promise.resolve(report({ status })))
  })

  it('moves a report to a new status', async () => {
    const moved = await create().execute({ report: report(), status: 'REVIEWING' })

    expect(setStatus).toHaveBeenCalledWith({
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
      status: 'REVIEWING',
    })
    expect(moved.status).toBe('REVIEWING')
  })

  it('does nothing when the report already holds that status', async () => {
    const current = report({ status: 'RESOLVED' })

    const result = await create().execute({ report: current, status: 'RESOLVED' })

    expect(setStatus).not.toHaveBeenCalled()
    expect(result).toBe(current)
  })
})
