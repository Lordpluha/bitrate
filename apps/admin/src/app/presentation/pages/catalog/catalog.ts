import { DatePipe } from '@angular/common'
import { Component, computed, inject, signal } from '@angular/core'
import { ListTracksUseCase, ReprocessTrackUseCase } from '@application/catalog'
import { coveringTuple } from '@domain/shared'
import {
  isTrackStuck,
  type Track,
  trackNeedsAttention,
  type TrackProcessingStatus,
} from '@domain/track'
import { CollectionStatus, Paginator } from '@presentation/components'
import { createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmTableImports } from '@spartan-ng/helm/table'

/** Problem-first, which is not the union's order — `coveringTuple` only requires it be covered. */
const STATUSES = coveringTuple<TrackProcessingStatus>()(['FAILED', 'PROCESSING', 'READY'])

@Component({
  selector: 'app-catalog',
  imports: [
    DatePipe,
    CollectionStatus,
    Paginator,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmTableImports,
  ],
  templateUrl: './catalog.html',
})
export class CatalogPage {
  private readonly listTracks = inject(ListTracksUseCase)
  private readonly reprocessTrack = inject(ReprocessTrackUseCase)

  protected readonly statuses = STATUSES
  protected readonly query = signal('')
  protected readonly status = signal<TrackProcessingStatus | null>(null)
  protected readonly busyId = signal<string | null>(null)

  protected readonly collection = createCollection<Track>({
    errorMessage: 'Could not load the catalog.',
    load: (page) =>
      this.listTracks.execute({
        page,
        filter: {
          query: this.query() || undefined,
          processingStatus: this.status() ?? undefined,
        },
      }),
  })

  /** Surfaced above the table so the number is visible without reading every row. */
  protected readonly needsAttention = computed(
    () => this.collection.items().filter((track) => trackNeedsAttention({ track })).length,
  )

  constructor() {
    void this.collection.restart()
  }

  protected isStuck(track: Track): boolean {
    return isTrackStuck({ track })
  }

  protected async setStatus(next: TrackProcessingStatus | null): Promise<void> {
    this.status.set(next)
    await this.collection.restart()
  }

  protected async applyFilters(): Promise<void> {
    await this.collection.restart()
  }

  protected async reprocess(track: Track): Promise<void> {
    this.busyId.set(track.id)
    try {
      await this.reprocessTrack.execute(track)
      await this.collection.reload()
    } catch {
      this.collection.fail(`Could not queue "${track.title}" for reprocessing.`)
    } finally {
      this.busyId.set(null)
    }
  }
}
