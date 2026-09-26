import { inject, Injectable } from '@angular/core'
import {
  canAdvanceTo,
  type ModerationReport,
  ModerationReportRepository,
  type ModerationStatus,
} from '@domain/moderation'

export type AdvanceReportInput = {
  report: ModerationReport
  status: ModerationStatus
}

@Injectable({ providedIn: 'root' })
export class AdvanceReportUseCase {
  private readonly reports = inject(ModerationReportRepository)

  /**
   * Returns the report untouched when it already holds the target status, so a double-click does
   * not write a second audit entry saying nothing changed.
   */
  execute({ report, status }: AdvanceReportInput): Promise<ModerationReport> {
    if (!canAdvanceTo({ report, status })) return Promise.resolve(report)

    return this.reports.setStatus({ id: report.id, status })
  }
}
