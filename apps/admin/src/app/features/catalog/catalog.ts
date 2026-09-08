import { DatePipe } from '@angular/common'
import { Component, computed, inject, signal } from '@angular/core'
import { type AdminTrack, CatalogService, type TrackProcessingStatus } from '@shared/api'
import { CollectionStatus, Paginator } from '@shared/components'
import { createCollection } from '@shared/lib/collection'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmTableImports } from '@spartan-ng/helm/table'

const STATUSES: readonly TrackProcessingStatus[] = ['FAILED', 'PROCESSING', 'READY']

/**
 * How long a track may sit in PROCESSING before it is worth an operator's attention. Not a
 * server rule — the pipeline has no timeout — so it is a display heuristic, kept here where it
 * is visible rather than buried in a template expression.
 */
const STUCK_AFTER_MS = 30 * 60 * 1000

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
  private readonly catalog = inject(CatalogService)

  protected readonly statuses = STATUSES
  protected readonly query = signal('')
  protected readonly status = signal<TrackProcessingStatus | null>(null)
  protected readonly busyId = signal<string | null>(null)

  protected readonly collection = createCollection<AdminTrack>({
    errorMessage: 'Could not load the catalog.',
    load: (page) =>
      this.catalog.list({
        page,
        q: this.query() || undefined,
        processingStatus: this.status() ?? undefined,
      }),
  })

  /** Surfaced above the table so the number is visible without reading every row. */
  protected readonly needsAttention = computed(
    () =>
      this.collection
        .items()
        .filter((track) => track.processingStatus === 'FAILED' || this.isStuck(track)).length,
  )

  constructor() {
    void this.collection.restart()
  }

  /** A track still PROCESSING long past when it should have finished. */
  protected isStuck(track: AdminTrack): boolean {
    if (track.processingStatus !== 'PROCESSING' || !track.processingStartedAt) return false

    return Date.now() - new Date(track.processingStartedAt).getTime() > STUCK_AFTER_MS
  }

  protected async setStatus(next: TrackProcessingStatus | null): Promise<void> {
    this.status.set(next)
    await this.collection.restart()
  }

  protected async applyFilters(): Promise<void> {
    await this.collection.restart()
  }

  protected async reprocess(track: AdminTrack): Promise<void> {
    this.busyId.set(track.id)
    try {
      await this.catalog.reprocess(track.id)
      await this.collection.reload()
    } catch {
      this.collection.fail(`Could not queue "${track.title}" for reprocessing.`)
    } finally {
      this.busyId.set(null)
    }
  }
}
