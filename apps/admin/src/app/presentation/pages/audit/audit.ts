import { DatePipe } from '@angular/common'
import { Component, effect, inject, signal } from '@angular/core'
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop'
import { ListAuditEntriesUseCase } from '@application/audit'
import { auditActorLabel, type AuditEntry, type AuditSortField } from '@domain/audit'
import type { Sort } from '@domain/shared'
import {
  CollectionStatus,
  Paginator,
  SortHeader,
  sortHeaderAriaSort,
} from '@presentation/components'
import { bindQueryState, createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { debounceTime, skip } from 'rxjs'
import { auditQueryCodec } from './audit.query'

/** How long to wait after the last keystroke before a text filter reaches the URL. */
const SEARCH_DEBOUNCE_MS = 300

@Component({
  selector: 'app-audit',
  imports: [
    DatePipe,
    CollectionStatus,
    Paginator,
    SortHeader,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmTableImports,
  ],
  templateUrl: './audit.html',
})
export class AuditPage {
  private readonly listEntries = inject(ListAuditEntriesUseCase)

  protected readonly actorLabel = auditActorLabel
  protected readonly ariaSort = sortHeaderAriaSort<AuditSortField>
  protected readonly query = bindQueryState({ codec: auditQueryCodec })
  protected readonly draft = signal(this.query.state().entityType)

  /** No mutations here on purpose: an audit trail an operator can edit is not an audit trail. */
  protected readonly collection = createCollection<AuditEntry>({
    errorMessage: 'Could not load the audit log.',
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

  constructor() {
    effect(() => {
      const { page } = this.query.state()
      void this.collection.show(page)
    })

    /** Keeps the box in sync with the URL, e.g. after back/forward changes the filter. */
    effect(() => {
      const { entityType } = this.query.state()
      this.draft.set(entityType)
    })

    toObservable(this.draft)
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), skip(1), takeUntilDestroyed())
      .subscribe((value) => this.query.patch({ entityType: value, page: 1 }, { replaceUrl: true }))
  }

  protected applyFilters(): void {
    this.query.patch({ entityType: this.draft(), page: 1 })
  }

  protected setSort(next: Sort<AuditSortField> | null): void {
    this.query.patch({ sort: next, page: 1 })
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
  }
}
