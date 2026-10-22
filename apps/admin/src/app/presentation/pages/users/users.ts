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
import { ExportUsersCsvUseCase } from '@application/export'
import { SessionStore } from '@application/session'
import type { ResourceCounts } from '@application/shared'
import {
  DeactivateUserUseCase,
  DeactivateUsersBatchUseCase,
  GetUserStatsUseCase,
  ListUsersUseCase,
} from '@application/users'
import {
  type BatchResult,
  DEFAULT_PAGE_SIZE,
  MAX_BATCH_SIZE,
  type ResourceStatus,
  type Sort,
} from '@domain/shared'
import { canDeactivateUser, type User, type UserFilter, type UserSortField } from '@domain/user'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideChevronRight, lucideUsers, lucideX } from '@ng-icons/lucide'
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
import type { Notice } from '@presentation/pages/shared/resource-write-error.message'
import { LocalizedDatePipe } from '@presentation/pipes'
import {
  bindQueryState,
  bindSearchDraft,
  createCollection,
  createSelection,
} from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { usersQueryCodec } from './users.query'

const STATUS_KEY: Record<ResourceStatus, string> = {
  active: 'account.status.active',
  deactivated: 'account.status.deactivated',
  all: 'account.status.all',
}
const STATUS_ORDER: readonly ResourceStatus[] = ['active', 'deactivated', 'all']

const ERROR: Record<'load' | 'batch', string> = {
  load: 'users.error.load',
  batch: 'users.error.batch',
}

@Component({
  selector: 'app-users',
  imports: [
    BatchActionBar,
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
  providers: [provideIcons({ lucideChevronRight, lucideUsers, lucideX })],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './users.html',
})
export class UsersPage {
  private readonly listUsers = inject(ListUsersUseCase)
  private readonly deactivateUser = inject(DeactivateUserUseCase)
  private readonly deactivateUsers = inject(DeactivateUsersBatchUseCase)
  private readonly exportUsers = inject(ExportUsersCsvUseCase)
  private readonly getStats = inject(GetUserStatsUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly canDelete = inject(SessionStore).can('users:delete')
  protected readonly canExport = inject(SessionStore).can('users:export')
  protected readonly ariaSort = sortHeaderAriaSort<UserSortField>

  protected readonly query = bindQueryState({ codec: usersQueryCodec })
  protected readonly draft = bindSearchDraft({
    query: this.query,
    read: (state) => state.query,
    toPatch: (query) => ({ query, page: 1 }),
  })
  protected readonly busyId = signal<string | null>(null)
  protected readonly rowError = signal<Notice | null>(null)

  protected readonly stats = signal<ResourceCounts | null>(null)
  protected readonly statsLoading = signal(true)

  /** The URL's filter and sort — what the list loads and the CSV export asks for. */
  private readonly filter = (): UserFilter => ({
    query: this.query.state().query || undefined,
    status: this.query.state().status,
    sort: this.query.state().sort ?? undefined,
  })

  protected readonly collection = createCollection<User>({
    errorMessage: ERROR.load,
    load: (page) => this.listUsers.execute({ page, filter: this.filter() }),
  })

  /** Downloads the server CSV for the filters and sort in the URL right now, not just this page. */
  protected readonly exportCsv = () => this.exportUsers.execute(this.filter())

  protected readonly failureText = computed(() => {
    const key = this.collection.failure()
    return key === null ? null : this.t(key)
  })
  protected readonly rowErrorText = computed(() => {
    const notice = this.rowError()
    return notice === null ? null : this.t(notice.key, notice.params)
  })

  protected readonly statusOptions = computed<FilterOption<ResourceStatus>[]>(() =>
    STATUS_ORDER.map((status) => ({ value: status, label: this.t(STATUS_KEY[status]) })),
  )

  protected readonly narrowed = computed(() => {
    const { query, status } = this.query.state()
    return query !== '' || status !== 'active'
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

  /** Hidden entirely when the operator may not deactivate, same as the per-row button. */
  protected readonly batchActions = computed<BatchActionOption[]>(() =>
    this.canDelete()
      ? [
          {
            key: 'deactivate',
            label: this.t('users.batch.deactivate'),
            confirmLabel: this.t('users.batch.deactivateConfirm'),
            consequence: this.t('users.batch.deactivateConsequence'),
            destructive: true,
          },
        ]
      : [],
  )
  protected readonly selectableIds = computed(() =>
    this.collection
      .items()
      .filter((user) => canDeactivateUser(user).allowed)
      .map((user) => user.id),
  )
  private readonly selectedUsers = computed(() =>
    this.collection.items().filter((user) => this.selection.has(user.id)),
  )
  protected readonly batchRows = computed(() =>
    this.selectedUsers().map((user) => ({ id: user.id, label: user.username })),
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

  protected setStatus(status: ResourceStatus): void {
    this.query.patch({ status, page: 1 })
  }

  protected clearFilters(): void {
    this.draft.set('')
    this.query.patch({ query: '', status: 'active', page: 1 })
  }

  protected setSort(next: Sort<UserSortField> | null): void {
    this.query.patch({ sort: next, page: 1 })
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
  }

  protected retry(): void {
    void this.collection.reload()
    void this.loadStats()
  }

  protected async remove(user: User): Promise<void> {
    this.busyId.set(user.id)
    this.rowError.set(null)
    try {
      await this.deactivateUser.execute({ user })
      await this.collection.reload()
      void this.loadStats()
    } catch {
      this.rowError.set({ key: 'users.error.deactivate', params: { name: user.username } })
    } finally {
      this.busyId.set(null)
    }
  }

  protected async runBatch(): Promise<void> {
    this.batchPending.set(true)
    try {
      const result = await this.deactivateUsers.execute(this.selectedUsers())
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

  private t(key: string, params: Record<string, string | number> = {}): string {
    return this.transloco.translate(key, params, this.locale())
  }
}
