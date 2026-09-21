import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { type Overview, type OverviewSeries, OverviewRepository } from '@domain/overview'
import { firstValueFrom } from 'rxjs'
import { ADMIN_API } from '../http/api.config'
import { overviewDto } from './overview.dto'
import { overviewSeriesDto } from './overview-series.dto'
import { toOverview } from './overview.mapper'
import { toOverviewSeries } from './overview-series.mapper'

@Injectable()
export class HttpOverviewRepository extends OverviewRepository {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/overview`

  override async get(): Promise<Overview> {
    const response = await firstValueFrom(this.http.get<unknown>(this.base))

    return toOverview(overviewDto.parse(response))
  }

  override async getSeries(days: number): Promise<OverviewSeries> {
    const response = await firstValueFrom(
      this.http.get<unknown>(`${this.base}/series`, { params: { days: String(days) } }),
    )

    return toOverviewSeries(overviewSeriesDto.parse(response))
  }
}
