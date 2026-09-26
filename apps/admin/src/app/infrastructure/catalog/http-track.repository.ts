import type { ApiPaths } from '@bitrate/contracts'
import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import type { Page, TakeDownInput } from '@domain/shared'
import {
  type ListTracksQuery,
  PROCESSING_ATTEMPTS_PAGE_SIZE,
  type ProbeTrackAudioInput,
  type ProcessingAttempt,
  type Track,
  type TrackAudioSource,
  type TrackDetail,
  TrackRepository,
} from '@domain/track'
import { ADMIN_API } from '../http/api.config'
import { buildTakeDownBody } from '../http/take-down.dto'
import { toResourceWriteError } from '../http/to-resource-write-error'
import { fetchPage } from '../http/wire-page'
import { processingAttemptPageDto } from './processing-attempt.dto'
import { toProcessingAttempt } from './processing-attempt.mapper'
import { trackDetailDto, trackPageDto } from './track.dto'
import {
  toTrack,
  toTrackDetail,
  toWireProcessingStatus,
  toWireTrackSort,
  toWireTrackStatus,
} from './track.mapper'

/** Bound to the HEAD operation's own query type, so a renamed `bitrate` param is a compile error here. */
type ProbeAudioQuery = NonNullable<
  ApiPaths['/api/v1/admin/tracks/{id}/audio']['head']['parameters']['query']
>

@Injectable()
export class HttpTrackRepository extends TrackRepository {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/tracks`

  override list({ page, limit, filter }: ListTracksQuery): Promise<Page<Track>> {
    return fetchPage({
      http: this.http,
      url: this.base,
      page,
      limit,
      filters: {
        q: filter.query,
        processingStatus:
          filter.processingStatus === undefined
            ? undefined
            : toWireProcessingStatus(filter.processingStatus),
        status: filter.status === undefined ? undefined : toWireTrackStatus(filter.status),
        sort: filter.sort ? toWireTrackSort(filter.sort.field) : undefined,
        order: filter.sort?.direction,
      },
      schema: trackPageDto,
      toDomain: toTrack,
    })
  }

  override async getById(id: string): Promise<TrackDetail> {
    const response = await firstValueFrom(this.http.get<unknown>(`${this.base}/${id}`))

    return toTrackDetail(trackDetailDto.parse(response))
  }

  override async reprocess(id: string): Promise<void> {
    await firstValueFrom(this.http.post(`${this.base}/${id}/reprocess`, {}))
  }

  override async takeDown({ id, reason }: TakeDownInput): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.base}/${id}`, { body: buildTakeDownBody(reason) }),
      )
    } catch (error) {
      throw toResourceWriteError(error, 'deactivate')
    }
  }

  override async restore({ id, reason }: TakeDownInput): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.base}/${id}/restore`, buildTakeDownBody(reason)))
    } catch (error) {
      throw toResourceWriteError(error, 'restore')
    }
  }

  override listProcessingAttempts(trackId: string, page: number): Promise<Page<ProcessingAttempt>> {
    return fetchPage({
      http: this.http,
      url: `${this.base}/${trackId}/processing-attempts`,
      page,
      limit: PROCESSING_ATTEMPTS_PAGE_SIZE,
      schema: processingAttemptPageDto,
      toDomain: toProcessingAttempt,
    })
  }

  /**
   * Issues the `HEAD` probe first — through `HttpClient`, so the auth interceptor refreshes an
   * expired access token before anything is played — and only then hands back the `GET` URL the
   * `<audio>` element streams from.
   */
  override async probeAudio({ id, bitrate }: ProbeTrackAudioInput): Promise<TrackAudioSource> {
    const params: ProbeAudioQuery = { bitrate }
    const url = `${this.base}/${id}/audio`

    await firstValueFrom(this.http.head(url, { params }))

    return { url: `${url}?bitrate=${bitrate}`, bitrate }
  }
}
