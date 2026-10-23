import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core'
import { ListAuditEntriesUseCase } from '@application/audit'
import type { AuditEntry, AuditSortField } from '@domain/audit'
import { DEFAULT_PAGE_SIZE, type Sort } from '@domain/shared'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideX } from '@ng-icons/lucide'
import {
  CollectionStatus,
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
import { auditQueryCodec } from './audit.query'

const LOAD_ERROR = 'audit.error.load'

@Component({
  selector: 'app-audit',
  imports: [
    CollectionStatus,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    LocalizedDatePipe,
    NgIcon,
    PageHeader,
    PanelBar,
    Paginator,
    SearchField,
    SortHeader,
    StateMessage,
    TablePanel,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideX })],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './audit.html',
})
export class AuditPage {
  private readonly listEntries = inject(ListAuditEntriesUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly ariaSort = sortHeaderAriaSort<AuditSortField>
  protected readonly query = bindQueryState({ codec: auditQueryCodec })
  protected readonly draft = bindSearchDraft({
    query: this.query,
    read: (state) => state.entityType,
    toPatch: (entityType) => ({ entityType, page: 1 }),
  })

  /** No mutations here on purpose: an audit trail an operator can edit is not an audit trail. */
  protected readonly collection = createCollection<AuditEntry>({
    errorMessage: LOAD_ERROR,
    load: (page) =>
      this.listEntries.execute({
        page,
        filter: {
          entityType: this.query.state().entityType || undefined,
          entityId: this.query.state().entityId || undefined,
          sort: this.query.state().sort ?? undefined,
        },
      }),
  })

  protected readonly failureText = computed(() =>
    this.collection.failure() === null
      ? null
      : this.transloco.translate(LOAD_ERROR, {}, this.locale()),
  )
  protected readonly filtered = computed(() => {
    const { entityType, entityId } = this.query.state()
    return entityType !== '' || entityId !== ''
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
  }

  protected setSort(next: Sort<AuditSortField> | null): void {
    this.query.patch({ sort: next, page: 1 })
  }

  protected clearEntity(): void {
    this.query.patch({ entityId: '', page: 1 })
  }

  protected clearFilters(): void {
    this.draft.set('')
    this.query.patch({ entityType: '', entityId: '', page: 1 })
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
  }
}
