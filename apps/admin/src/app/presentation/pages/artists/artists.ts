import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import {
  type ArtistStats,
  DeactivateArtistUseCase,
  GetArtistStatsUseCase,
  ListArtistsUseCase,
  ToggleArtistVerificationUseCase,
} from '@application/artists'
import { ExportArtistsCsvUseCase } from '@application/export'
import { SessionStore } from '@application/session'
import type { Artist, ArtistFilter, ArtistSortField } from '@domain/artist'
import { DEFAULT_PAGE_SIZE, type ResourceStatus, type Sort } from '@domain/shared'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideBadgeCheck,
  lucideChevronRight,
  lucideClock,
  lucideMic,
  lucideX,
} from '@ng-icons/lucide'
import {
  CollectionStatus,
  ExportCsvButton,
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
import type { Notice } from '@presentation/pages/shared/resource-write-error.message'
import { LocalizedDatePipe } from '@presentation/pipes'
import {
  bindQueryState,
  bindSearchDraft,
  createCollection,
  type TriState,
} from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { artistsQueryCodec } from './artists.query'

const STATUS_KEY: Record<ResourceStatus, string> = {
  active: 'account.status.active',
  deactivated: 'account.status.deactivated',
  all: 'account.status.all',
}
const STATUS_ORDER: readonly ResourceStatus[] = ['active', 'deactivated', 'all']

const VERIFIED_KEY: Record<TriState, string> = {
  all: 'artists.verifiedFilter.all',
  verified: 'artists.verifiedFilter.verified',
  unverified: 'artists.verifiedFilter.unverified',
}
const VERIFIED_ORDER: readonly TriState[] = ['all', 'verified', 'unverified']

const LOAD_ERROR = 'artists.error.load'

@Component({
  selector: 'app-artists',
  imports: [
    CollectionStatus,
    ExportCsvButton,
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
  providers: [
    provideIcons({ lucideBadgeCheck, lucideChevronRight, lucideClock, lucideMic, lucideX }),
  ],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './artists.html',
})
export class ArtistsPage {
  private readonly listArtists = inject(ListArtistsUseCase)
  private readonly toggleVerificationUseCase = inject(ToggleArtistVerificationUseCase)
  private readonly deactivateArtist = inject(DeactivateArtistUseCase)
  private readonly exportArtists = inject(ExportArtistsCsvUseCase)
  private readonly getStats = inject(GetArtistStatsUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly canVerify = inject(SessionStore).can('artists:verify')
  protected readonly canDelete = inject(SessionStore).can('artists:delete')
  protected readonly canExport = inject(SessionStore).can('artists:export')
  protected readonly ariaSort = sortHeaderAriaSort<ArtistSortField>

  protected readonly query = bindQueryState({ codec: artistsQueryCodec })
  protected readonly draft = bindSearchDraft({
    query: this.query,
    read: (state) => state.query,
    toPatch: (query) => ({ query, page: 1 }),
  })
  protected readonly busyId = signal<string | null>(null)
  protected readonly rowError = signal<Notice | null>(null)

  protected readonly stats = signal<ArtistStats | null>(null)
  protected readonly statsLoading = signal(true)

  /** The URL's filter and sort — what the list loads and the CSV export asks for. */
  private readonly filter = (): ArtistFilter => ({
    query: this.query.state().query || undefined,
    verified:
      this.query.state().verified === 'all'
        ? undefined
        : this.query.state().verified === 'verified',
    status: this.query.state().status,
    sort: this.query.state().sort ?? undefined,
  })

  protected readonly collection = createCollection<Artist>({
    errorMessage: LOAD_ERROR,
    load: (page) => this.listArtists.execute({ page, filter: this.filter() }),
  })

  /** Downloads the server CSV for the filters and sort in the URL right now, not just this page. */
  protected readonly exportCsv = () => this.exportArtists.execute(this.filter())

  protected readonly failureText = computed(() =>
    this.collection.failure() === null ? null : this.t(LOAD_ERROR),
  )
  protected readonly rowErrorText = computed(() => {
    const notice = this.rowError()
    return notice === null ? null : this.t(notice.key, notice.params)
  })
  /** Verified active artists as a whole-number share of all active ones. */
  protected readonly verifiedShare = computed(() => {
    const stats = this.stats()
    if (!stats || stats.live === 0) return null
    return Math.round((stats.verified / stats.live) * 100)
  })

  protected readonly statusOptions = computed<FilterOption<ResourceStatus>[]>(() =>
    STATUS_ORDER.map((status) => ({ value: status, label: this.t(STATUS_KEY[status]) })),
  )
  protected readonly verifiedOptions = computed<FilterOption<TriState>[]>(() =>
    VERIFIED_ORDER.map((value) => ({ value, label: this.t(VERIFIED_KEY[value]) })),
  )

  protected readonly narrowed = computed(() => {
    const { query, verified, status } = this.query.state()
    return query !== '' || verified !== 'all' || status !== 'active'
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

  protected setVerifiedFilter(value: TriState): void {
    this.query.patch({ verified: value, page: 1 })
  }

  protected setStatus(status: ResourceStatus): void {
    this.query.patch({ status, page: 1 })
  }

  protected clearFilters(): void {
    this.draft.set('')
    this.query.patch({ query: '', verified: 'all', status: 'active', page: 1 })
  }

  protected setSort(next: Sort<ArtistSortField> | null): void {
    this.query.patch({ sort: next, page: 1 })
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
  }

  protected retry(): void {
    void this.collection.reload()
    void this.loadStats()
  }

  protected async toggleVerification(artist: Artist): Promise<void> {
    this.busyId.set(artist.id)
    this.rowError.set(null)
    try {
      await this.toggleVerificationUseCase.execute(artist)
      await this.collection.reload()
      void this.loadStats()
    } catch {
      this.rowError.set({ key: 'artists.error.verify', params: { name: artist.username } })
    } finally {
      this.busyId.set(null)
    }
  }

  protected async remove(artist: Artist): Promise<void> {
    this.busyId.set(artist.id)
    this.rowError.set(null)
    try {
      await this.deactivateArtist.execute({ artist })
      await this.collection.reload()
      void this.loadStats()
    } catch {
      this.rowError.set({ key: 'artists.error.deactivate', params: { name: artist.username } })
    } finally {
      this.busyId.set(null)
    }
  }

  private async loadStats(): Promise<void> {
    this.statsLoading.set(true)
    try {
      this.stats.set(await this.getStats.execute())
    } catch {
      this.stats.set(null)
    } finally {
      this.statsLoading.set(false)
    }
  }

  private t(key: string, params: Record<string, string | number> = {}): string {
    return this.transloco.translate(key, params, this.locale())
  }
}
