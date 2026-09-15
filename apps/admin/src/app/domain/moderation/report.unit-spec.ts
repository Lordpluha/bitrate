import { describe, expect, it } from 'vitest'
import { canAdvanceTo, isReportClosed, type ModerationReport } from './report'

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

describe('canAdvanceTo', () => {
  it('refuses the status the report already holds', () => {
    expect(canAdvanceTo({ report: report({ status: 'REVIEWING' }), status: 'REVIEWING' })).toBe(
      false,
    )
  })

  it('allows an operator to correct an earlier call', () => {
    expect(canAdvanceTo({ report: report({ status: 'REJECTED' }), status: 'RESOLVED' })).toBe(true)
  })
})

describe('isReportClosed', () => {
  it('counts both terminal statuses', () => {
    expect(isReportClosed(report({ status: 'RESOLVED' }))).toBe(true)
    expect(isReportClosed(report({ status: 'REJECTED' }))).toBe(true)
  })

  it('leaves an open or in-review report out', () => {
    expect(isReportClosed(report({ status: 'OPEN' }))).toBe(false)
    expect(isReportClosed(report({ status: 'REVIEWING' }))).toBe(false)
  })
})
