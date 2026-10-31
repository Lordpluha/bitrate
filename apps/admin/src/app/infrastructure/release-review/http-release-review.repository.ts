import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import {
  type ListReleaseSubmissionsQuery,
  type ReleaseChangesRequest,
  type ReleaseDecisionRequest,
  ReleaseReviewError,
  ReleaseReviewRepository,
  type ReleaseSubmission,
  type ReleaseSubmissionDetail,
  type SubmissionReview,
} from '@domain/release-review'
import type { Page } from '@domain/shared'
import { firstValueFrom } from 'rxjs'
import { ADMIN_API } from '../http/api.config'
import { toReadError } from '../http/to-read-error'
import { fetchPage } from '../http/wire-page'
import {
  type ApproveReleaseBody,
  type RequestReleaseChangesBody,
  releaseDecisionDto,
  retriedReleaseDto,
  releaseDetailDto,
  releasePageDto,
} from './release-review.dto'
import {
  toReleaseSubmission,
  toReleaseSubmissionDetail,
  toSubmissionReview,
  toWireQueueStatus,
} from './release-review.mapper'

/** The only place a decision's status code is read; presentation sees the reason. */
function toReleaseReviewError(error: unknown): ReleaseReviewError {
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
export class HttpReleaseReviewRepository extends ReleaseReviewRepository {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/releases`

  override list({
    page,
    limit,
    filter,
  }: ListReleaseSubmissionsQuery): Promise<Page<ReleaseSubmission>> {
    return fetchPage({
      http: this.http,
      url: this.base,
      page,
      limit,
      filters: {
        q: filter.query,
        status: filter.status === undefined ? undefined : toWireQueueStatus(filter.status),
      },
      schema: releasePageDto,
      toDomain: toReleaseSubmission,
    })
  }

  override async getById(id: string): Promise<ReleaseSubmissionDetail> {
    let response: unknown
    try {
      response = await firstValueFrom(this.http.get<unknown>(`${this.base}/${id}`))
    } catch (error) {
      throw toReadError(error)
    }

    return toReleaseSubmissionDetail(releaseDetailDto.parse(response))
  }

  override audioUrl(releaseId: string, trackId: string): string {
    return `${this.base}/${encodeURIComponent(releaseId)}/tracks/${encodeURIComponent(trackId)}/audio`
  }

  override async approve({
    id,
    expectedUpdatedAt,
    message,
  }: ReleaseDecisionRequest): Promise<SubmissionReview> {
    const body: ApproveReleaseBody = {
      expectedUpdatedAt: expectedUpdatedAt.toISOString(),
      ...(message ? { message } : {}),
    }
    return this.decide(`${this.base}/${id}/approve`, body)
  }

  override async requestChanges({
    id,
    expectedUpdatedAt,
    message,
  }: ReleaseChangesRequest): Promise<SubmissionReview> {
    const body: RequestReleaseChangesBody = {
      expectedUpdatedAt: expectedUpdatedAt.toISOString(),
      message,
    }
    return this.decide(`${this.base}/${id}/request-changes`, body)
  }

  override async retryPublishing(id: string): Promise<void> {
    await this.publicationAction(id, 'retry-publishing')
  }

  override async takeDown(id: string): Promise<void> {
    await this.publicationAction(id, 'unpublish')
  }

  /** Posts a body-less publication action; only the returned release's identity is checked. */
  private async publicationAction(id: string, action: 'retry-publishing' | 'unpublish') {
    let response: unknown
    try {
      response = await firstValueFrom(
        this.http.post<unknown>(`${this.base}/${encodeURIComponent(id)}/${action}`, {}),
      )
    } catch (error) {
      throw toReleaseReviewError(error)
    }
    retriedReleaseDto.parse(response)
  }

  private async decide(
    url: string,
    body: ApproveReleaseBody | RequestReleaseChangesBody,
  ): Promise<SubmissionReview> {
    let response: unknown
    try {
      response = await firstValueFrom(this.http.post<unknown>(url, body))
    } catch (error) {
      throw toReleaseReviewError(error)
    }
    return toSubmissionReview(releaseDecisionDto.parse(response).review)
  }
}
