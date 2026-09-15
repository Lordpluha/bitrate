import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import type { Page } from '@domain/shared'
import { type ListTracksQuery, type Track, TrackRepository } from '@domain/track'
import { ADMIN_API } from '../http/api.config'
import { fetchPage } from '../http/wire-page'
import { trackPageDto } from './track.dto'
import { toTrack, toWireProcessingStatus } from './track.mapper'

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
      },
      schema: trackPageDto,
      toDomain: toTrack,
    })
  }

  override async reprocess(id: string): Promise<void> {
    await firstValueFrom(this.http.post(`${this.base}/${id}/reprocess`, {}))
  }
}
