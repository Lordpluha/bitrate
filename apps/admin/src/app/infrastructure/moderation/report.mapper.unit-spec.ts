import { describe, expect, it } from 'vitest'
import type { ReportDetailDto } from './report.dto'
import { toReportDetail, toWireModerationEntityType } from './report.mapper'

const baseReport = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  reporterId: '3f2504e0-4f89-41d3-9a0c-0305e82c3302',
  entityType: 'track',
  entityId: '3f2504e0-4f89-41d3-9a0c-0305e82c3303',
  reason: 'Copyright',
  details: null,
  status: 'OPEN' as const,
  resolvedAt: null,
  createdAt: '2026-09-14T12:00:00.000Z',
}

describe('toReportDetail', () => {
  it('resolves the subject and maps its timestamps', () => {
    const dto: ReportDetailDto = {
      ...baseReport,
      subject: {
        kind: 'track',
        id: baseReport.entityId,
        title: 'Night Drive',
        deletedAt: '2026-09-10T08:00:00.000Z',
        parentId: null,
      },
      siblingReports: [],
    }

    const detail = toReportDetail(dto)

    expect(detail.subject?.deletedAt?.toISOString()).toBe('2026-09-10T08:00:00.000Z')
  })

  it('carries a null subject through untouched', () => {
    const dto: ReportDetailDto = { ...baseReport, subject: null, siblingReports: [] }

    expect(toReportDetail(dto).subject).toBeNull()
  })

  it('maps sibling reports the same way the queue does', () => {
    const dto: ReportDetailDto = {
      ...baseReport,
      subject: null,
      siblingReports: [
        {
          ...baseReport,
          id: '3f2504e0-4f89-41d3-9a0c-0305e82c3304',
          updatedAt: '2026-09-14T12:00:00.000Z',
        },
      ],
    }

    expect(toReportDetail(dto).siblingReports).toHaveLength(1)
  })
})

describe('toWireModerationEntityType', () => {
  it('is a direct pass-through, stated explicitly so a dropped member fails to compile', () => {
    expect(toWireModerationEntityType('track')).toBe('track')
    expect(toWireModerationEntityType('episode')).toBe('episode')
    expect(toWireModerationEntityType('user')).toBe('user')
  })
})
