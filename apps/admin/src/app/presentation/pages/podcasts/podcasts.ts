import { Component, effect, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { ListPodcastsUseCase } from '@application/podcasts'
import type { Podcast, PodcastSortField } from '@domain/podcast'
import type { ResourceStatus, Sort } from '@domain/shared'
import {
  CollectionStatus,
  Paginator,
  SortHeader,
  sortHeaderAriaSort,
} from '@presentation/components'
import { bindQueryState, bindSearchDraft, createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { podcastsQueryCodec } from './podcasts.query'

/** The take-down filter's buttons, in the order an operator reads them. */
const STATUS_OPTIONS: readonly { value: ResourceStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'deactivated', label: 'Taken down' },
  { value: 'all', label: 'All' },
]

@Component({
  selector: 'app-podcasts',
  imports: [
    RouterLink,
    CollectionStatus,
    Paginator,
    SortHeader,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmTableImports,
  ],
  templateUrl: './podcasts.html',
})
export class PodcastsPage {
  private readonly listPodcasts = inject(ListPodcastsUseCase)

  protected readonly statusOptions = STATUS_OPTIONS
  protected readonly ariaSort = sortHeaderAriaSort<PodcastSortField>
  protected readonly query = bindQueryState({ codec: podcastsQueryCodec })
  protected readonly draft = bindSearchDraft({
    query: this.query,
    read: (state) => state.query,
    toPatch: (query) => ({ query, page: 1 }),
  })

  protected readonly collection = createCollection<Podcast>({
    errorMessage: 'Could not load podcasts.',
    load: (page) =>
      this.listPodcasts.execute({
        page,
        filter: {
          query: this.query.state().query || undefined,
          status: this.query.state().resourceStatus,
          sort: this.query.state().sort ?? undefined,
        },
      }),
  })

  constructor() {
    effect(() => {
      const { page } = this.query.state()
      void this.collection.show(page)
    })
  }

  protected applyFilters(): void {
    this.query.patch({ query: this.draft(), page: 1 })
  }

  protected setResourceStatus(next: ResourceStatus): void {
    this.query.patch({ resourceStatus: next, page: 1 })
  }

  protected setSort(next: Sort<PodcastSortField> | null): void {
    this.query.patch({ sort: next, page: 1 })
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
  }
}
