import { Component, computed, effect, inject, signal, untracked } from '@angular/core'
import { RouterLink } from '@angular/router'
import {
  AdvanceReportsBatchUseCase,
  AdvanceReportUseCase,
  ListReportsUseCase,
  type ReportBatchAction,
} from '@application/moderation'
import { SessionStore } from '@application/session'
import {
  type ModerationEntityType,
  type ModerationReport,
  type ModerationSortField,
  type ModerationStatus,
} from '@domain/moderation'
import { ActionNotAllowedError, type BatchResult, MAX_BATCH_SIZE, type Sort } from '@domain/shared'
import {
  BatchActionBar,
  type BatchActionOption,
  CollectionStatus,
  Paginator,
  SortHeader,
  sortHeaderAriaSort,
} from '@presentation/components'
import { LocalizedDatePipe } from '@presentation/pipes'
import { bindQueryState, createCollection, createSelection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmTableImports } from '@spartan-ng/helm/table'
import {
  MODERATION_ENTITY_TYPES,
  MODERATION_STATUSES,
  moderationQueryCodec,
} from './moderation.query'

@Component({
  selector: 'app-moderation',
  imports: [
    LocalizedDatePipe,
    RouterLink,
    BatchActionBar,
    CollectionStatus,
    Paginator,
    SortHeader,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
  ],
  templateUrl: './moderation.html',
})
export class ModerationQueue {
  private readonly listReports = inject(ListReportsUseCase)
  private readonly advanceReport = inject(AdvanceReportUseCase)
  private readonly advanceReports = inject(AdvanceReportsBatchUseCase)

  protected readonly canAdvance = inject(SessionStore).can('reports:advance')

  protected readonly statuses = MODERATION_STATUSES
  protected readonly entityTypes = MODERATION_ENTITY_TYPES
  protected readonly ariaSort = sortHeaderAriaSort<ModerationSortField>
  protected readonly query = bindQueryState({ codec: moderationQueryCodec })
  protected readonly busyId = signal<string | null>(null)

  protected readonly collection = createCollection<ModerationReport>({
    errorMessage: 'Could not load the moderation queue.',
    load: (page) =>
      this.listReports.execute({
        page,
        filter: {
          status: this.query.state().status ?? undefined,
          entityType: this.query.state().entityType ?? undefined,
          sort: this.query.state().sort ?? undefined,
        },
      }),
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
            label: 'Resolve',
            confirmLabel: 'Resolve reports',
            consequence: 'Marks each report resolved and stamps its resolution time.',
          },
          {
            key: 'dismiss',
            label: 'Dismiss',
            confirmLabel: 'Dismiss reports',
            consequence: 'Marks each report rejected and stamps its resolution time.',
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
      label: `${report.entityType} ${report.entityId.slice(0, 8)} — ${report.reason}`,
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
  }

  protected setFilter(status: ModerationStatus | null): void {
    this.query.patch({ status, page: 1 })
  }

  protected setEntityType(entityType: ModerationEntityType | null): void {
    this.query.patch({ entityType, page: 1 })
  }

  protected setSort(next: Sort<ModerationSortField> | null): void {
    this.query.patch({ sort: next, page: 1 })
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
  }

  protected async advance(report: ModerationReport, status: ModerationStatus): Promise<void> {
    this.busyId.set(report.id)
    try {
      await this.advanceReport.execute({ report, status })
      await this.collection.reload()
    } catch {
      this.collection.fail(`Could not move that report to ${status}.`)
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
    } catch (error) {
      this.collection.fail(
        error instanceof ActionNotAllowedError
          ? error.message
          : 'Could not update the selected reports.',
      )
    } finally {
      this.batchPending.set(false)
    }
  }

  private toBatchAction(key: string): ReportBatchAction {
    return key === 'dismiss' ? 'dismiss' : 'resolve'
  }

  protected closeBatch(): void {
    this.batchResult.set(null)
  }
}
