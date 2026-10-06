import { inject, Injectable } from '@angular/core'
import { OverviewRepository, type OverviewReportsByType } from '@domain/overview'

@Injectable({ providedIn: 'root' })
export class GetOverviewReportsByTypeUseCase {
  private readonly overview = inject(OverviewRepository)

  execute(days: number): Promise<OverviewReportsByType> {
    return this.overview.getReportsByType(days)
  }
}
