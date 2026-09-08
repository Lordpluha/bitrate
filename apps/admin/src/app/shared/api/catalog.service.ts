import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { ADMIN_API, fetchPage } from './admin-http'
import { type AdminTrack, adminTrackPageSchema, type TrackProcessingStatus } from './schemas'
import type { Page } from '../lib/collection'

type ListTracksInput = {
  page: number
  q?: string
  processingStatus?: TrackProcessingStatus
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/tracks`

  /** The API sorts failed and long-running uploads first — this screen exists for those. */
  list({ page, q, processingStatus }: ListTracksInput): Promise<Page<AdminTrack>> {
    return fetchPage<Page<AdminTrack>>({
      http: this.http,
      url: this.base,
      page,
      filters: { q, processingStatus },
      schema: adminTrackPageSchema,
    })
  }

  async reprocess(id: string): Promise<void> {
    await firstValueFrom(this.http.post(`${this.base}/${id}/reprocess`, {}))
  }
}
