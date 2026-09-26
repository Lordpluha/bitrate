import type { Sort } from '../shared/sort'

/** See `TrackProcessingStatus` for why this union is declared here and not imported. */
export type ModerationStatus = 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'REJECTED'

/** The columns the moderation queue can be ordered by. */
export type ModerationSortField = 'createdAt' | 'status'

/**
 * The reported-entity kinds the API can filter the queue by. The report's own `entityType`
 * field stays a free string on the wire (never validated at write time) — only this filter
 * parameter is a closed set, bound to the contract in `infrastructure/moderation/report.mapper.ts`.
 */
export type ModerationEntityType =
  'track' | 'album' | 'playlist' | 'artist' | 'podcast' | 'episode' | 'user'

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
  entityType?: ModerationEntityType
  sort?: Sort<ModerationSortField>
}

/**
 * The reported entity, resolved to something a report-detail page can show and link to. `kind`
 * stays a free string (like `ModerationReport.entityType`) — an unrecognised or future kind still
 * renders, just without a link.
 */
export type ModerationSubject = {
  kind: string
  id: string
  title: string
  deletedAt: Date | null
  /** The subject's owning parent, when its kind has one — an episode's podcast id. */
  parentId: string | null
}

/** A report's full detail view — the queue row plus its resolved subject and sibling reports. */
export type ReportDetail = ModerationReport & {
  /** `null` for an unrecognised entity type or a subject that no longer resolves. */
  subject: ModerationSubject | null
  /** Other reports naming the same subject, newest first, bounded by the API. */
  siblingReports: ModerationReport[]
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
