import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import {
  type ListReportsQuery,
  type ModerationReport,
  ModerationReportRepository,
  type SetReportStatusInput,
} from '@domain/moderation'
import type { Page } from '@domain/shared'
import { ADMIN_API } from '../http/api.config'
import { fetchPage } from '../http/wire-page'
import { reportDto, reportPageDto } from './report.dto'
import { toModerationReport, toWireModerationStatus } from './report.mapper'

@Injectable()
export class HttpModerationReportRepository extends ModerationReportRepository {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/moderation/reports`

  override list({ page, limit, filter }: ListReportsQuery): Promise<Page<ModerationReport>> {
    return fetchPage({
      http: this.http,
      url: this.base,
      page,
      limit,
      filters: {
        status: filter.status === undefined ? undefined : toWireModerationStatus(filter.status),
      },
      schema: reportPageDto,
      toDomain: toModerationReport,
    })
  }

  override async setStatus({ id, status }: SetReportStatusInput): Promise<ModerationReport> {
    const response = await firstValueFrom(
      this.http.patch<unknown>(`${this.base}/${id}`, {
        status: toWireModerationStatus(status),
      }),
    )

    return toModerationReport(reportDto.parse(response))
  }
}
