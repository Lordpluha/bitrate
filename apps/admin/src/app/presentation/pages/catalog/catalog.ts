import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core'
import { RouterLink } from '@angular/router'
import {
  type CatalogStats,
  GetCatalogStatsUseCase,
  ListTracksUseCase,
  ReprocessTrackUseCase,
  TakeDownTracksBatchUseCase,
} from '@application/catalog'
import { ExportTracksCsvUseCase } from '@application/export'
import { SessionStore } from '@application/session'
import {
  type BatchResult,
  DEFAULT_PAGE_SIZE,
  MAX_BATCH_SIZE,
  type ResourceStatus,
  type Sort,
} from '@domain/shared'
import {
  canReprocess as trackCanBeReprocessed,
  canTakeDownTrack,
  isTrackStuck,
  type Track,
  trackNeedsAttention,
  type TrackFilter,
  type TrackProcessingStatus,
  type TrackSortField,
} from '@domain/track'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideChevronRight,
  lucideCircleAlert,
  lucideCircleCheck,
  lucideRefreshCw,
  lucideTriangleAlert,
} from '@ng-icons/lucide'
import {
  BatchActionBar,
  type BatchActionOption,
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
import { ElapsedPipe, LocalizedDatePipe } from '@presentation/pipes'
import {
  bindQueryState,
  bindSearchDraft,
  createCollection,
  createSelection,
} from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { PIPELINE_BADGE, PIPELINE_KEY } from './catalog-labels'
import { CATALOG_STATUSES, catalogQueryCodec } from './catalog.query'

const RESOURCE_KEY: Record<ResourceStatus, string> = {
  active: 'catalog.resource.active',
  deactivated: 'catalog.resource.deactivated',
  all: 'catalog.resource.all',
}

const RESOURCE_ORDER: readonly ResourceStatus[] = ['active', 'deactivated', 'all']

/** Collection failures are stored as keys and translated when shown. */
const ERROR: Record<'load' | 'batch', string> = {
  load: 'catalog.error.load',
  batch: 'catalog.error.batch',
}

@Component({
  selector: 'app-catalog',
  imports: [
    BatchActionBar,
    CollectionStatus,
    ElapsedPipe,
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
    provideIcons({
      lucideChevronRight,
      lucideCircleAlert,
      lucideCircleCheck,
      lucideRefreshCw,
      lucideTriangleAlert,
    }),
  ],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './catalog.html',
})
export class CatalogPage {
  private readonly listTracks = inject(ListTracksUseCase)
  private readonly reprocessTrack = inject(ReprocessTrackUseCase)
  private readonly takeDownTracks = inject(TakeDownTracksBatchUseCase)
  private readonly exportTracks = inject(ExportTracksCsvUseCase)
  private readonly getStats = inject(GetCatalogStatsUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  private readonly session = inject(SessionStore)
  protected readonly canReprocess = this.session.can('tracks:reprocess')
  protected readonly canTakeDown = this.session.can('tracks:delete')
  protected readonly canExport = this.session.can('tracks:export')

  protected readonly pipelineBadge = PIPELINE_BADGE
  protected readonly pipelineKey = PIPELINE_KEY
  protected readonly ariaSort = sortHeaderAriaSort<TrackSortField>
  protected readonly query = bindQueryState({ codec: catalogQueryCodec })
  protected readonly draft = bindSearchDraft({
    query: this.query,
    read: (state) => state.query,
    toPatch: (query) => ({ query, page: 1 }),
  })
  protected readonly busyId = signal<string | null>(null)
  /** A reprocess that failed, by title, until the next action. */
  protected readonly reprocessFailed = signal<string | null>(null)

  protected readonly stats = signal<CatalogStats | null>(null)
  protected readonly statsLoading = signal(true)

  /** The URL's filter and sort — what the list loads and the CSV export asks for. */
  private readonly filter = (): TrackFilter => ({
    query: this.query.state().query || undefined,
    processingStatus: this.query.state().status ?? undefined,
    status: this.query.state().resourceStatus,
    sort: this.query.state().sort ?? undefined,
  })

  protected readonly collection = createCollection<Track>({
    errorMessage: ERROR.load,
    load: (page) => this.listTracks.execute({ page, filter: this.filter() }),
  })

  protected readonly failureText = computed(() => {
    const key = this.collection.failure()
    return key === null ? null : this.t(key)
  })

  /** Downloads the server CSV for the filters and sort in the URL right now, not just this page. */
  protected readonly exportCsv = () => this.exportTracks.execute(this.filter())

  protected readonly pipelineOptions = computed<FilterOption<TrackProcessingStatus | null>[]>(
    () => [
      { value: null, label: this.t('catalog.pipeline.all') },
      ...CATALOG_STATUSES.map((status) => ({ value: status, label: this.t(PIPELINE_KEY[status]) })),
    ],
  )
  protected readonly resourceOptions = computed<FilterOption<ResourceStatus>[]>(() =>
    RESOURCE_ORDER.map((status) => ({ value: status, label: this.t(RESOURCE_KEY[status]) })),
  )

  /** Surfaced above the table so the number is visible without reading every row. */
  protected readonly needsAttention = computed(
    () => this.collection.items().filter((track) => trackNeedsAttention({ track })).length,
  )

  protected readonly narrowed = computed(() => {
    const { query, status, resourceStatus } = this.query.state()
    return query !== '' || status !== null || resourceStatus !== 'active'
  })

  protected readonly range = computed(() => {
    const total = this.collection.total()
    if (this.collection.loading() || this.collection.failure() || total === 0) return null
    const from = (this.collection.page() - 1) * DEFAULT_PAGE_SIZE + 1
    return { from, to: from + this.collection.items().length - 1, total }
  })

  protected readonly selection = createSelection({ limit: MAX_BATCH_SIZE })
  protected readonly batchPending = signal(false)
  protected readonly batchResult = signal<BatchResult | null>(null)

  /** Hidden entirely when the operator may not take tracks down. */
  protected readonly batchActions = computed<BatchActionOption[]>(() =>
    this.canTakeDown()
      ? [
          {
            key: 'take-down',
            label: this.t('catalog.batch.takeDown'),
            confirmLabel: this.t('catalog.batch.takeDownConfirm'),
            consequence: this.t('catalog.batch.takeDownConsequence'),
            destructive: true,
          },
        ]
      : [],
  )
  protected readonly selectableIds = computed(() =>
    this.collection
      .items()
      .filter((track) => canTakeDownTrack(track).allowed)
      .map((track) => track.id),
  )
  private readonly selectedTracks = computed(() =>
    this.collection.items().filter((track) => this.selection.has(track.id)),
  )
  protected readonly batchRows = computed(() =>
    this.selectedTracks().map((track) => ({ id: track.id, label: track.title })),
  )

  constructor() {
    effect(() => {
      const { page } = this.query.state()
      void this.collection.show(page)
    })

    /** The ticked rows belong to one page of one filter; any URL change drops them. */
    effect(() => {
      this.query.state()
      untracked(() => this.selection.clear())
    })

    void this.loadStats()
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

  protected clearFilters(): void {
    this.draft.set('')
    this.query.patch({ query: '', status: null, resourceStatus: 'active', page: 1 })
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
  }

  protected retry(): void {
    void this.collection.reload()
    void this.loadStats()
  }

  protected async reprocess(track: Track): Promise<void> {
    this.busyId.set(track.id)
    this.reprocessFailed.set(null)
    try {
      await this.reprocessTrack.execute(track)
      await this.collection.reload()
      void this.loadStats()
    } catch {
      this.reprocessFailed.set(track.title)
    } finally {
      this.busyId.set(null)
    }
  }

  protected async runBatch(): Promise<void> {
    this.batchPending.set(true)
    try {
      const result = await this.takeDownTracks.execute(this.selectedTracks())
      this.selection.clear()
      this.batchResult.set(result)
      await this.collection.reload()
      void this.loadStats()
    } catch {
      this.collection.fail(ERROR.batch)
    } finally {
      this.batchPending.set(false)
    }
  }

  protected closeBatch(): void {
    this.batchResult.set(null)
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

  private t(key: string): string {
    return this.transloco.translate(key, {}, this.locale())
  }
}
