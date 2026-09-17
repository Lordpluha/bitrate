import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { type Overview, OverviewRepository } from '@domain/overview'
import { firstValueFrom } from 'rxjs'
import { ADMIN_API } from '../http/api.config'
import { overviewDto } from './overview.dto'
import { toOverview } from './overview.mapper'

@Injectable()
export class HttpOverviewRepository extends OverviewRepository {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/overview`

  override async get(): Promise<Overview> {
    const response = await firstValueFrom(this.http.get<unknown>(this.base))

    return toOverview(overviewDto.parse(response))
  }
}
