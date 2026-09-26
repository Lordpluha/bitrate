import { inject, Injectable } from '@angular/core'
import { ModerationReportRepository, type ReportDetail } from '@domain/moderation'

@Injectable({ providedIn: 'root' })
export class GetReportUseCase {
  private readonly reports = inject(ModerationReportRepository)

  execute(id: string): Promise<ReportDetail> {
    return this.reports.getById(id)
  }
}
