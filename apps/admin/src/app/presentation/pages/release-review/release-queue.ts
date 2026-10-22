import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import {
  GetReleaseQueueStatsUseCase,
  ListReleaseSubmissionsUseCase,
  type ReleaseQueueStats,
} from '@application/release-review'
import type { ReleaseQueueStatus, ReleaseSubmission } from '@domain/release-review'
import { DEFAULT_PAGE_SIZE } from '@domain/shared'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideChevronRight, lucideClock, lucideDisc3, lucideInbox } from '@ng-icons/lucide'
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
  StateMessage,
  TablePanel,
} from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
import { ElapsedPipe, LocalizedDatePipe } from '@presentation/pipes'
import { bindQueryState, bindSearchDraft, createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { RELEASE_KIND_KEYS, RELEASE_STATUS_BADGES, RELEASE_STATUS_KEYS } from './release-labels'
import { releaseQueueQueryCodec } from './release-queue.query'

const QUEUE_STATUS_KEYS: Record<ReleaseQueueStatus, string> = {
  SUBMITTED: 'releases.queueStatus.SUBMITTED',
  REJECTED: 'releases.queueStatus.REJECTED',
  READY: 'releases.queueStatus.READY',
  ALL: 'releases.queueStatus.ALL',
}

/** Filter order: what needs a decision first, everything last. */
const QUEUE_STATUS_ORDER: readonly ReleaseQueueStatus[] = ['SUBMITTED', 'REJECTED', 'READY', 'ALL']

const LOAD_ERROR = 'releases.error.load'

/** Artist submissions waiting for Bitrate review, oldest first so the queue is fair. */
@Component({
  selector: 'app-release-queue',
  imports: [
    CollectionStatus,
    ElapsedPipe,
    FilterMenu,
    HlmBadgeImports,
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
    StateMessage,
    TablePanel,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideChevronRight, lucideClock, lucideDisc3, lucideInbox })],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './release-queue.html',
})
export class ReleaseQueuePage {
  private readonly listReleases = inject(ListReleaseSubmissionsUseCase)
  private readonly getStats = inject(GetReleaseQueueStatsUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly kindKeys = RELEASE_KIND_KEYS
  protected readonly statusKeys = RELEASE_STATUS_KEYS
  protected readonly statusBadges = RELEASE_STATUS_BADGES
  protected readonly query = bindQueryState({ codec: releaseQueueQueryCodec })
  protected readonly draft = bindSearchDraft({
    query: this.query,
    read: (state) => state.query,
    toPatch: (query) => ({ query, page: 1 }),
  })

  protected readonly stats = signal<ReleaseQueueStats | null>(null)
  protected readonly statsLoading = signal(true)

  protected readonly collection = createCollection<ReleaseSubmission>({
    errorMessage: LOAD_ERROR,
    load: (page) =>
      this.listReleases.execute({
        page,
        filter: {
          query: this.query.state().query || undefined,
          status: this.query.state().status ?? undefined,
        },
      }),
  })

  protected readonly failureText = computed(() => {
    const key = this.collection.failure()
    return key === null ? null : this.t(key)
  })

  protected readonly statusOptions = computed<FilterOption<ReleaseQueueStatus>[]>(() =>
    QUEUE_STATUS_ORDER.map((status) => ({
      value: status,
      label: this.t(QUEUE_STATUS_KEYS[status]),
    })),
  )

  /** True once the operator searched or moved off the default (awaiting review). */
  protected readonly narrowed = computed(() => {
    const { query, status } = this.query.state()
    return query !== '' || (status ?? 'SUBMITTED') !== 'SUBMITTED'
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

  protected setStatus(next: ReleaseQueueStatus): void {
    this.query.patch({ status: next, page: 1 })
  }

  protected clearFilters(): void {
    this.draft.set('')
    this.query.patch({ query: '', status: 'SUBMITTED', page: 1 })
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
