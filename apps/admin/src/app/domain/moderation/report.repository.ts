import type { BatchResult } from '../shared/batch-result'
import type { Page, PageRequest } from '../shared/page'
import type { ModerationFilter, ModerationReport, ModerationStatus, ReportDetail } from './report'

export type ListReportsQuery = PageRequest & {
  filter: ModerationFilter
}

export type SetReportStatusInput = {
  id: string
  status: ModerationStatus
}

/** The port the moderation queue talks to. */
export abstract class ModerationReportRepository {
  abstract list(query: ListReportsQuery): Promise<Page<ModerationReport>>
  abstract getById(id: string): Promise<ReportDetail>
  abstract setStatus(input: SetReportStatusInput): Promise<ModerationReport>
  /** Marks every id resolved independently; a row that fails does not stop the others. */
  abstract resolveMany(ids: readonly string[]): Promise<BatchResult>
  /** Marks every id dismissed (rejected) independently; a row that fails does not stop the others. */
  abstract dismissMany(ids: readonly string[]): Promise<BatchResult>
}
