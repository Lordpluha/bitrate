import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import {
  type ListReportsQuery,
  type ModerationReport,
  ModerationReportRepository,
  type ReportDetail,
  type SetReportStatusInput,
} from '@domain/moderation'
import type { BatchResult, Page } from '@domain/shared'
import { ADMIN_API } from '../http/api.config'
import { batchResultDto, buildBatchBody, toBatchResult } from '../http/batch-result.dto'
import { fetchPage } from '../http/wire-page'
import { reportDetailDto, reportDto, reportPageDto } from './report.dto'
import {
  toModerationReport,
  toReportDetail,
  toReportListFilters,
  toWireModerationStatus,
} from './report.mapper'

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
      filters: toReportListFilters(filter),
      schema: reportPageDto,
      toDomain: toModerationReport,
    })
  }

  override async getById(id: string): Promise<ReportDetail> {
    const response = await firstValueFrom(this.http.get<unknown>(`${this.base}/${id}`))

    return toReportDetail(reportDetailDto.parse(response))
  }

  override async setStatus({ id, status }: SetReportStatusInput): Promise<ModerationReport> {
    const response = await firstValueFrom(
      this.http.patch<unknown>(`${this.base}/${id}`, {
        status: toWireModerationStatus(status),
      }),
    )

    return toModerationReport(reportDto.parse(response))
  }

  override resolveMany(ids: readonly string[]): Promise<BatchResult> {
    return this.postBatch('resolve', ids)
  }

  override dismissMany(ids: readonly string[]): Promise<BatchResult> {
    return this.postBatch('dismiss', ids)
  }

  private async postBatch(action: 'resolve' | 'dismiss', ids: readonly string[]) {
    const response = await firstValueFrom(
      this.http.post<unknown>(`${this.base}/batch/${action}`, buildBatchBody(ids)),
    )

    return toBatchResult(batchResultDto.parse(response))
  }
}
