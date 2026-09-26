import { describe, expect, it } from 'vitest'
import { reportDetailDto } from './report.dto'

const baseReport = {
  id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
  reporterId: '3f2504e0-4f89-41d3-9a0c-0305e82c3302',
  entityType: 'track',
  entityId: '3f2504e0-4f89-41d3-9a0c-0305e82c3303',
  reason: 'Copyright',
  details: null,
  status: 'OPEN',
  resolvedAt: null,
  createdAt: '2026-09-14T12:00:00.000Z',
}

const detail = {
  ...baseReport,
  subject: {
    kind: 'track',
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3303',
    title: 'Night Drive',
    deletedAt: null,
    parentId: null,
  },
  siblingReports: [
    {
      ...baseReport,
      id: '3f2504e0-4f89-41d3-9a0c-0305e82c3304',
      updatedAt: '2026-09-14T12:00:00.000Z',
    },
  ],
}

describe('reportDetailDto', () => {
  it('accepts the detail shape with a resolved subject', () => {
    const parsed = reportDetailDto.parse(detail)

    expect(parsed.subject?.title).toBe('Night Drive')
    expect(parsed.siblingReports).toHaveLength(1)
  })

  it('accepts a null subject for an unrecognised or vanished entity', () => {
    const parsed = reportDetailDto.parse({ ...detail, subject: null })

    expect(parsed.subject).toBeNull()
  })

  it('rejects an unrecognised moderation status', () => {
    expect(() => reportDetailDto.parse({ ...detail, status: 'CLOSED' })).toThrow()
  })

  it('rejects a sibling report missing a required field', () => {
    const { reason: _reason, ...brokenSibling } = detail.siblingReports[0] ?? {}

    expect(() => reportDetailDto.parse({ ...detail, siblingReports: [brokenSibling] })).toThrow()
  })
})
