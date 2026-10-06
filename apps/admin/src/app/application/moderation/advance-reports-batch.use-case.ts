import { inject, Injectable } from '@angular/core'
import { type ModerationReport, ModerationReportRepository } from '@domain/moderation'
import { ActionNotAllowedError, type BatchResult, MAX_BATCH_SIZE } from '@domain/shared'

/** The two batch outcomes: `resolve` marks reports resolved, `dismiss` marks them rejected. */
export type ReportBatchAction = 'resolve' | 'dismiss'

export type AdvanceReportsBatchInput = {
  reports: readonly ModerationReport[]
  action: ReportBatchAction
}

@Injectable({ providedIn: 'root' })
export class AdvanceReportsBatchUseCase {
  private readonly reports = inject(ModerationReportRepository)

  /**
   * @throws {ActionNotAllowedError} When nothing is selected or too many rows are.
   */
  execute({ reports, action }: AdvanceReportsBatchInput): Promise<BatchResult> {
    if (reports.length === 0 || reports.length > MAX_BATCH_SIZE) {
      throw new ActionNotAllowedError(`Select between 1 and ${MAX_BATCH_SIZE} reports.`)
    }
    const ids = reports.map((report) => report.id)

    return action === 'resolve' ? this.reports.resolveMany(ids) : this.reports.dismissMany(ids)
  }
}
