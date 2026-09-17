import { DatePipe } from '@angular/common'
import { Component, computed, effect, inject, signal } from '@angular/core'
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop'
import { RouterLink } from '@angular/router'
import { ListTracksUseCase, ReprocessTrackUseCase } from '@application/catalog'
import { SessionStore } from '@application/session'
import type { ResourceStatus, Sort } from '@domain/shared'
import {
  canReprocess as trackCanBeReprocessed,
  isTrackStuck,
  type Track,
  trackNeedsAttention,
  type TrackProcessingStatus,
  type TrackSortField,
} from '@domain/track'
import {
  CollectionStatus,
  Paginator,
  SortHeader,
  sortHeaderAriaSort,
} from '@presentation/components'
import { bindQueryState, createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { debounceTime, skip } from 'rxjs'
import { CATALOG_STATUSES, catalogQueryCodec } from './catalog.query'

/** How long to wait after the last keystroke before a text filter reaches the URL. */
const SEARCH_DEBOUNCE_MS = 300

@Component({
  selector: 'app-catalog',
  imports: [
    DatePipe,
    RouterLink,
    CollectionStatus,
    Paginator,
    SortHeader,
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

  protected readonly canReprocess = inject(SessionStore).can('tracks:reprocess')

  protected readonly statuses = CATALOG_STATUSES
  protected readonly ariaSort = sortHeaderAriaSort<TrackSortField>
  protected readonly query = bindQueryState({ codec: catalogQueryCodec })
  protected readonly draft = signal(this.query.state().query)
  protected readonly busyId = signal<string | null>(null)

  protected readonly collection = createCollection<Track>({
    errorMessage: 'Could not load the catalog.',
    load: (page) =>
      this.listTracks.execute({
        page,
        filter: {
          query: this.query.state().query || undefined,
          processingStatus: this.query.state().status ?? undefined,
          status: this.query.state().resourceStatus,
          sort: this.query.state().sort ?? undefined,
        },
      }),
  })

  /** Surfaced above the table so the number is visible without reading every row. */
  protected readonly needsAttention = computed(
    () => this.collection.items().filter((track) => trackNeedsAttention({ track })).length,
  )

  constructor() {
    effect(() => {
      const { page } = this.query.state()
      void this.collection.show(page)
    })

    /** Keeps the box in sync with the URL, e.g. after back/forward changes the filter. */
    effect(() => {
      const { query: urlQuery } = this.query.state()
      this.draft.set(urlQuery)
    })

    toObservable(this.draft)
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), skip(1), takeUntilDestroyed())
      .subscribe((value) => this.query.patch({ query: value, page: 1 }, { replaceUrl: true }))
  }

  protected isStuck(track: Track): boolean {
    return isTrackStuck({ track })
  }

  protected reprocessible(track: Track): boolean {
    return trackCanBeReprocessed(track)
  }

  protected setStatus(next: TrackProcessingStatus | null): void {
    this.query.patch({ status: next, page: 1 })
  }

  protected setResourceStatus(next: ResourceStatus): void {
    this.query.patch({ resourceStatus: next, page: 1 })
  }

  protected setSort(next: Sort<TrackSortField> | null): void {
    this.query.patch({ sort: next, page: 1 })
  }

  protected applyFilters(): void {
    this.query.patch({ query: this.draft(), page: 1 })
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
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
