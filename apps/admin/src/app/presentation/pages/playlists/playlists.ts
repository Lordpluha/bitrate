import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { CountOpenReportsUseCase } from '@application/moderation'
import { GetPlaylistStatsUseCase, ListPlaylistsUseCase } from '@application/playlists'
import { SessionStore } from '@application/session'
import type { ResourceCounts } from '@application/shared'
import type { Playlist, PlaylistSortField } from '@domain/playlist'
import { DEFAULT_PAGE_SIZE, type ResourceStatus, type Sort } from '@domain/shared'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideChevronRight, lucideFlag, lucideListMusic, lucideX } from '@ng-icons/lucide'
import {
  CollectionStatus,
  type FilterOption,
  FilterMenu,
  MetricStrip,
  MetricTile,
  PageHeader,
  Paginator,
  PanelBar,
  SearchField,
  SortHeader,
  sortHeaderAriaSort,
  StateMessage,
  TablePanel,
} from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
import { LocalizedDatePipe } from '@presentation/pipes'
import { bindQueryState, bindSearchDraft, createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { playlistsQueryCodec } from './playlists.query'

const RESOURCE_KEY: Record<ResourceStatus, string> = {
  active: 'content.resource.active',
  deactivated: 'content.resource.deactivated',
  all: 'content.resource.all',
}

const RESOURCE_ORDER: readonly ResourceStatus[] = ['active', 'deactivated', 'all']

const LOAD_ERROR = 'playlists.error.load'

@Component({
  selector: 'app-playlists',
  imports: [
    CollectionStatus,
    FilterMenu,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    LocalizedDatePipe,
    MetricStrip,
    MetricTile,
    NgIcon,
    PageHeader,
    Paginator,
    PanelBar,
    RouterLink,
    SearchField,
    SortHeader,
    StateMessage,
    TablePanel,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideChevronRight, lucideFlag, lucideListMusic, lucideX })],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './playlists.html',
})
export class PlaylistsPage {
  private readonly listPlaylists = inject(ListPlaylistsUseCase)
  private readonly getStats = inject(GetPlaylistStatsUseCase)
  private readonly countReports = inject(CountOpenReportsUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  /** The "Reported" figure reads the moderation queue, so it follows that permission. */
  protected readonly canSeeReports = inject(SessionStore).can('reports:read')
  protected readonly ariaSort = sortHeaderAriaSort<PlaylistSortField>
  protected readonly query = bindQueryState({ codec: playlistsQueryCodec })
  protected readonly draft = bindSearchDraft({
    query: this.query,
    read: (state) => state.query,
    toPatch: (query) => ({ query, page: 1 }),
  })

  protected readonly stats = signal<ResourceCounts | null>(null)
  protected readonly reported = signal<number | null>(null)
  protected readonly statsLoading = signal(true)

  protected readonly collection = createCollection<Playlist>({
    errorMessage: LOAD_ERROR,
    load: (page) =>
      this.listPlaylists.execute({
        page,
        filter: {
          query: this.query.state().query || undefined,
          status: this.query.state().resourceStatus,
          ownerId: this.query.state().ownerId || undefined,
          sort: this.query.state().sort ?? undefined,
        },
      }),
  })

  protected readonly failureText = computed(() =>
    this.collection.failure() === null ? null : this.t(LOAD_ERROR),
  )

  protected readonly resourceOptions = computed<FilterOption<ResourceStatus>[]>(() =>
    RESOURCE_ORDER.map((status) => ({ value: status, label: this.t(RESOURCE_KEY[status]) })),
  )

  protected readonly narrowed = computed(() => {
    const { query, resourceStatus, ownerId } = this.query.state()
    return query !== '' || resourceStatus !== 'active' || ownerId !== ''
  })

  protected readonly range = computed(() => {
    const total = this.collection.total()
    if (this.collection.loading() || this.collection.failure() || total === 0) return null
    const from = (this.collection.page() - 1) * DEFAULT_PAGE_SIZE + 1
    return { from, to: from + this.collection.items().length - 1, total }
  })

  constructor() {
    effect(() => {
      const { page } = this.query.state()
      void this.collection.show(page)
    })
    void this.loadStats()
  }

  protected setResourceStatus(next: ResourceStatus): void {
    this.query.patch({ resourceStatus: next, page: 1 })
  }

  protected clearOwner(): void {
    this.query.patch({ ownerId: '', page: 1 })
  }

  protected clearFilters(): void {
    this.draft.set('')
    this.query.patch({ query: '', resourceStatus: 'active', ownerId: '', page: 1 })
  }

  protected setSort(next: Sort<PlaylistSortField> | null): void {
    this.query.patch({ sort: next, page: 1 })
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
  }

  protected retry(): void {
    void this.collection.reload()
    void this.loadStats()
  }

  private async loadStats(): Promise<void> {
    this.statsLoading.set(true)
    const [counts, reported] = await Promise.allSettled([
      this.getStats.execute(),
      this.canSeeReports() ? this.countReports.execute('playlist') : Promise.resolve(null),
    ])
    this.stats.set(counts.status === 'fulfilled' ? counts.value : null)
    this.reported.set(reported.status === 'fulfilled' ? reported.value : null)
    this.statsLoading.set(false)
  }

  private t(key: string): string {
    return this.transloco.translate(key, {}, this.locale())
  }
}
