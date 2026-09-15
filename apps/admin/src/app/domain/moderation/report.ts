/** See `TrackProcessingStatus` for why this union is declared here and not imported. */
export type ModerationStatus = 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'REJECTED'

/** A report a listener filed against some piece of content. */
export type ModerationReport = {
  id: string
  reporterId: string
  entityType: string
  entityId: string
  reason: string
  details: string | null
  status: ModerationStatus
  resolvedAt: Date | null
  createdAt: Date
}

export type ModerationFilter = {
  status?: ModerationStatus
}

type AdvanceInput = {
  report: ModerationReport
  status: ModerationStatus
}

/**
 * Moving a report to the status it already holds is a no-op, and issuing the request anyway
 * writes a meaningless audit entry. Every other transition stays open on purpose: an operator
 * correcting a colleague's call is a legitimate move, not a mistake to block.
 */
export function canAdvanceTo({ report, status }: AdvanceInput): boolean {
  return report.status !== status
}

export function isReportClosed(report: ModerationReport): boolean {
  return report.status === 'RESOLVED' || report.status === 'REJECTED'
}
