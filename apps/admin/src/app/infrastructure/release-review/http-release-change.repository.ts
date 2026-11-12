import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import {
  type DecideReleaseChangesRequest,
  type ListReleaseChangeRequestsQuery,
  ReleaseChangeRepository,
  type ReleaseChangeRequestDetail,
  type ReleaseChangeRequestRow,
  ReleaseReviewError,
} from '@domain/release-review'
import type { Page } from '@domain/shared'
import { firstValueFrom } from 'rxjs'
import { ADMIN_API } from '../http/api.config'
import { toReadError } from '../http/to-read-error'
import { fetchPage } from '../http/wire-page'
import {
  changePageDto,
  changeRequestDto,
  changeStatsDto,
  type DecideReleaseChangesBody,
} from './release-change.dto'
import { toReleaseChangeRequestDetail, toReleaseChangeRequestRow } from './release-change.mapper'

/** The only place a decision's status code is read; presentation sees the reason. */
function toDecisionError(error: unknown): ReleaseReviewError {
  if (!(error instanceof HttpErrorResponse)) return new ReleaseReviewError('unknown')
  switch (error.status) {
    case 400:
      return new ReleaseReviewError('invalid')
    case 404:
      return new ReleaseReviewError('not-found')
    case 409:
      return new ReleaseReviewError('stale')
    default:
      return new ReleaseReviewError('unknown')
  }
}

@Injectable()
export class HttpReleaseChangeRepository extends ReleaseChangeRepository {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/release-changes`

  override list({
    page,
    limit,
    status,
  }: ListReleaseChangeRequestsQuery): Promise<Page<ReleaseChangeRequestRow>> {
    return fetchPage({
      http: this.http,
      url: this.base,
      page,
      limit,
      filters: { status },
      schema: changePageDto,
      toDomain: toReleaseChangeRequestRow,
    })
  }

  override async openCount(): Promise<number> {
    try {
      const response = await firstValueFrom(this.http.get<unknown>(`${this.base}/stats`))
      return changeStatsDto.parse(response).open
    } catch (error) {
      throw toReadError(error)
    }
  }

  override async getById(id: string): Promise<ReleaseChangeRequestDetail> {
    let response: unknown
    try {
      response = await firstValueFrom(
        this.http.get<unknown>(`${this.base}/${encodeURIComponent(id)}`),
      )
    } catch (error) {
      throw toReadError(error)
    }
    return toReleaseChangeRequestDetail(changeRequestDto.parse(response))
  }

  override async decide({
    id,
    decisions,
    message,
  }: DecideReleaseChangesRequest): Promise<ReleaseChangeRequestDetail> {
    const body: DecideReleaseChangesBody = { decisions, ...(message ? { message } : {}) }
    let response: unknown
    try {
      response = await firstValueFrom(
        this.http.post<unknown>(`${this.base}/${encodeURIComponent(id)}/decide`, body),
      )
    } catch (error) {
      throw toDecisionError(error)
    }
    return toReleaseChangeRequestDetail(changeRequestDto.parse(response))
  }
}
