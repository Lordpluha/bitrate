import { Component, computed, effect, inject, signal, untracked } from '@angular/core'
import { RouterLink } from '@angular/router'
import {
  AdvanceReportsBatchUseCase,
  AdvanceReportUseCase,
  GetReportQueueStatsUseCase,
  ListReportsUseCase,
  type ReportBatchAction,
  type ReportQueueStats,
} from '@application/moderation'
import { ExportReportsCsvUseCase } from '@application/export'
import { SessionStore } from '@application/session'
import {
  type ModerationEntityType,
  type ModerationFilter,
  type ModerationReport,
  type ModerationSortField,
  type ModerationStatus,
} from '@domain/moderation'
import { DEFAULT_PAGE_SIZE, type BatchResult, MAX_BATCH_SIZE, type Sort } from '@domain/shared'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideChevronRight, lucideEye, lucideInbox } from '@ng-icons/lucide'
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
  SortHeader,
  sortHeaderAriaSort,
  StateMessage,
  TablePanel,
} from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
import { ElapsedPipe, LocalizedDatePipe } from '@presentation/pipes'
import { bindQueryState, createCollection, createSelection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmTableImports } from '@spartan-ng/helm/table'
import {
  MODERATION_ENTITY_TYPES,
  MODERATION_STATUSES,
  moderationQueryCodec,
} from './moderation.query'

/** The pill each report status wears. */
const STATUS_BADGE: Record<ModerationStatus, 'warning' | 'info' | 'success' | 'secondary'> = {
  OPEN: 'warning',
  REVIEWING: 'info',
  RESOLVED: 'success',
  REJECTED: 'secondary',
}

const STATUS_LABEL: Record<ModerationStatus, string> = {
  OPEN: 'moderation.status.OPEN',
  REVIEWING: 'moderation.status.REVIEWING',
  RESOLVED: 'moderation.status.RESOLVED',
  REJECTED: 'moderation.status.REJECTED',
}

const TYPE_LABEL: Record<ModerationEntityType, string> = {
  track: 'moderation.type.track',
  album: 'moderation.type.album',
  playlist: 'moderation.type.playlist',
  artist: 'moderation.type.artist',
  user: 'moderation.type.user',
}

/** The API keeps `entityType` a free string; only the known kinds have a translated name. */
function isKnownType(entityType: string): entityType is ModerationEntityType {
  return Object.hasOwn(TYPE_LABEL, entityType)
}

/** Collection failures are stored as keys and translated when shown. */
const ERROR: Record<'load' | 'advance' | 'batch', string> = {
  load: 'moderation.error.load',
  advance: 'moderation.error.advance',
  batch: 'moderation.error.batch',
}

@Component({
  selector: 'app-moderation',
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
    SortHeader,
    StateMessage,
    TablePanel,
    TranslocoPipe,
  ],
  providers: [provideIcons({ lucideChevronRight, lucideEye, lucideInbox })],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './moderation.html',
})
export class ModerationQueue {
  private readonly listReports = inject(ListReportsUseCase)
  private readonly advanceReport = inject(AdvanceReportUseCase)
  private readonly advanceReports = inject(AdvanceReportsBatchUseCase)
  private readonly exportReports = inject(ExportReportsCsvUseCase)
  private readonly getStats = inject(GetReportQueueStatsUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly canAdvance = inject(SessionStore).can('reports:advance')
  protected readonly canExport = inject(SessionStore).can('reports:export')

  protected readonly statusBadge = STATUS_BADGE
  protected readonly statusLabel = STATUS_LABEL
  protected readonly typeLabel = TYPE_LABEL
  protected readonly ariaSort = sortHeaderAriaSort<ModerationSortField>
  protected readonly query = bindQueryState({ codec: moderationQueryCodec })
  protected readonly busyId = signal<string | null>(null)

  /** The queue's KPIs; `null` while loading or after a failure, so the tiles show a dash. */
  protected readonly stats = signal<ReportQueueStats | null>(null)
  protected readonly statsLoading = signal(true)

  /** The URL's filter and sort — what the queue loads and the CSV export asks for. */
  private readonly filter = (): ModerationFilter => ({
    status: this.query.state().status ?? undefined,
    entityType: this.query.state().entityType ?? undefined,
    sort: this.query.state().sort ?? undefined,
  })

  protected readonly collection = createCollection<ModerationReport>({
    errorMessage: ERROR.load,
    load: (page) => this.listReports.execute({ page, filter: this.filter() }),
  })

  protected readonly failureText = computed(() => {
    const key = this.collection.failure()
    return key === null ? null : this.t(key)
  })

  /** Downloads the server CSV for the filters and sort in the URL right now, not just this page. */
  protected readonly exportCsv = () => this.exportReports.execute(this.filter())

  protected readonly statusOptions = computed<FilterOption<ModerationStatus | null>[]>(() => [
    { value: null, label: this.t('moderation.status.all') },
    ...MODERATION_STATUSES.map((status) => ({
      value: status,
      label: this.t(STATUS_LABEL[status]),
    })),
  ])
  protected readonly typeOptions = computed<FilterOption<ModerationEntityType | null>[]>(() => [
    { value: null, label: this.t('moderation.type.all') },
    ...MODERATION_ENTITY_TYPES.map((type) => ({ value: type, label: this.t(TYPE_LABEL[type]) })),
  ])

  /** True once the operator moved off the default view (open reports of every type). */
  protected readonly narrowed = computed(() => {
    const { status, entityType } = this.query.state()
    return status !== 'OPEN' || entityType !== null
  })

  /** "1–20 of 64", or nothing while there is nothing to count. */
  protected readonly range = computed(() => {
    const total = this.collection.total()
    if (this.collection.loading() || this.collection.failure() || total === 0) return null
    const from = (this.collection.page() - 1) * DEFAULT_PAGE_SIZE + 1
    const to = from + this.collection.items().length - 1
    return { from, to, total }
  })

  protected readonly selection = createSelection({ limit: MAX_BATCH_SIZE })
  protected readonly batchPending = signal(false)
  protected readonly batchResult = signal<BatchResult | null>(null)

  /** Hidden entirely when the operator may not advance reports, same as the per-row buttons. */
  protected readonly batchActions = computed<BatchActionOption[]>(() =>
    this.canAdvance()
      ? [
          {
            key: 'resolve',
            label: this.t('moderation.batch.resolve'),
            confirmLabel: this.t('moderation.batch.resolveConfirm'),
            consequence: this.t('moderation.batch.resolveConsequence'),
          },
          {
            key: 'dismiss',
            label: this.t('moderation.batch.dismiss'),
            confirmLabel: this.t('moderation.batch.dismissConfirm'),
            consequence: this.t('moderation.batch.dismissConsequence'),
          },
        ]
      : [],
  )
  protected readonly selectableIds = computed(() =>
    this.collection.items().map((report) => report.id),
  )
  private readonly selectedReports = computed(() =>
    this.collection.items().filter((report) => this.selection.has(report.id)),
  )
  protected readonly batchRows = computed(() =>
    this.selectedReports().map((report) => ({
      id: report.id,
      label: `${this.typeName(report.entityType)} ${report.entityId.slice(0, 8)} — ${report.reason}`,
    })),
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

  /** A known entity type's translated name; an unknown one is shown as the API sent it. */
  protected typeName(entityType: string): string {
    return isKnownType(entityType) ? this.t(TYPE_LABEL[entityType]) : entityType
  }

  protected setFilter(status: ModerationStatus | null): void {
    this.query.patch({ status, page: 1 })
  }

  protected setEntityType(entityType: ModerationEntityType | null): void {
    this.query.patch({ entityType, page: 1 })
  }

  protected clearFilters(): void {
    this.query.patch({ status: 'OPEN', entityType: null, page: 1 })
  }

  protected setSort(next: Sort<ModerationSortField> | null): void {
    this.query.patch({ sort: next, page: 1 })
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
  }

  protected retry(): void {
    void this.collection.reload()
    void this.loadStats()
  }

  protected async advance(report: ModerationReport, status: ModerationStatus): Promise<void> {
    this.busyId.set(report.id)
    try {
      await this.advanceReport.execute({ report, status })
      await this.collection.reload()
      void this.loadStats()
    } catch {
      this.collection.fail(ERROR.advance)
    } finally {
      this.busyId.set(null)
    }
  }

  protected async runBatch(action: string): Promise<void> {
    this.batchPending.set(true)
    try {
      const result = await this.advanceReports.execute({
        reports: this.selectedReports(),
        action: this.toBatchAction(action),
      })
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

  private toBatchAction(key: string): ReportBatchAction {
    return key === 'dismiss' ? 'dismiss' : 'resolve'
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

  /** Translates in the active language and re-runs any computed that called it on a switch. */
  private t(key: string): string {
    return this.transloco.translate(key, {}, this.locale())
  }
}
