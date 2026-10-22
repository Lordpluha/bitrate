import { inject, Injectable } from '@angular/core'
import { TrackRepository, type TrackProcessingStatus } from '@domain/track'

/** The figures above the catalog: live tracks by pipeline state. */
export type CatalogStats = {
  ready: number
  processing: number
  failed: number
  /** When the longest-running track in the pipeline started (or was uploaded); `null` if none. */
  oldestProcessingAt: Date | null
}

/**
 * Reads the catalog's KPIs from the list endpoint — one row per pipeline state among live
 * (not taken down) tracks, using the page total; the processing row is the oldest upload, which
 * dates how long the pipeline has been working on it. "Stuck" is a client-side cut of
 * processing (`isTrackStuck`) the list cannot filter on, so it has no figure here.
 */
@Injectable({ providedIn: 'root' })
export class GetCatalogStatsUseCase {
  private readonly tracks = inject(TrackRepository)

  async execute(): Promise<CatalogStats> {
    const [ready, processing, failed] = await Promise.all([
      this.count('READY'),
      this.tracks.list({
        page: 1,
        limit: 1,
        filter: {
          processingStatus: 'PROCESSING',
          status: 'active',
          sort: { field: 'createdAt', direction: 'asc' },
        },
      }),
      this.count('FAILED'),
    ])
    const oldest = processing.items[0]
    return {
      ready: ready.total,
      processing: processing.total,
      failed: failed.total,
      oldestProcessingAt: oldest ? (oldest.processingStartedAt ?? oldest.createdAt) : null,
    }
  }

  private count(processingStatus: TrackProcessingStatus) {
    return this.tracks.list({ page: 1, limit: 1, filter: { processingStatus, status: 'active' } })
  }
}
