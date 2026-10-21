import { Component, effect, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { ListAlbumsUseCase } from '@application/albums'
import type { Album, AlbumSortField } from '@domain/album'
import type { ResourceStatus, Sort } from '@domain/shared'
import {
  CollectionStatus,
  Paginator,
  SortHeader,
  sortHeaderAriaSort,
} from '@presentation/components'
import { LocalizedDatePipe } from '@presentation/pipes'
import { bindQueryState, bindSearchDraft, createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { albumsQueryCodec } from './albums.query'

/** The take-down filter's buttons, in the order an operator reads them. */
const STATUS_OPTIONS: readonly { value: ResourceStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'deactivated', label: 'Taken down' },
  { value: 'all', label: 'All' },
]

@Component({
  selector: 'app-albums',
  imports: [
    LocalizedDatePipe,
    RouterLink,
    CollectionStatus,
    Paginator,
    SortHeader,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmTableImports,
  ],
  templateUrl: './albums.html',
})
export class AlbumsPage {
  private readonly listAlbums = inject(ListAlbumsUseCase)

  protected readonly statusOptions = STATUS_OPTIONS
  protected readonly ariaSort = sortHeaderAriaSort<AlbumSortField>
  protected readonly query = bindQueryState({ codec: albumsQueryCodec })
  protected readonly draft = bindSearchDraft({
    query: this.query,
    read: (state) => state.query,
    toPatch: (query) => ({ query, page: 1 }),
  })

  protected readonly collection = createCollection<Album>({
    errorMessage: 'Could not load albums.',
    load: (page) =>
      this.listAlbums.execute({
        page,
        filter: {
          query: this.query.state().query || undefined,
          status: this.query.state().resourceStatus,
          artistId: this.query.state().artistId || undefined,
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

  protected clearArtist(): void {
    this.query.patch({ artistId: '', page: 1 })
  }

  protected setSort(next: Sort<AlbumSortField> | null): void {
    this.query.patch({ sort: next, page: 1 })
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
  }
}
