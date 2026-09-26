import { inject, Injectable } from '@angular/core'
import { type OverviewSeries, OverviewRepository } from '@domain/overview'

@Injectable({ providedIn: 'root' })
export class GetOverviewSeriesUseCase {
  private readonly overview = inject(OverviewRepository)

  execute(days: number): Promise<OverviewSeries> {
    return this.overview.getSeries(days)
  }
}
