import { DatePipe } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { ListAuditEntriesUseCase } from '@application/audit'
import { auditActorLabel, type AuditEntry } from '@domain/audit'
import { CollectionStatus, Paginator } from '@presentation/components'
import { createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmTableImports } from '@spartan-ng/helm/table'

@Component({
  selector: 'app-audit',
  imports: [
    DatePipe,
    CollectionStatus,
    Paginator,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmTableImports,
  ],
  templateUrl: './audit.html',
})
export class AuditPage {
  private readonly listEntries = inject(ListAuditEntriesUseCase)

  protected readonly entityType = signal('')
  protected readonly actorLabel = auditActorLabel

  /** No mutations here on purpose: an audit trail an operator can edit is not an audit trail. */
  protected readonly collection = createCollection<AuditEntry>({
    errorMessage: 'Could not load the audit log.',
    load: (page) =>
      this.listEntries.execute({ page, filter: { entityType: this.entityType() || undefined } }),
  })

  constructor() {
    void this.collection.restart()
  }

  protected async applyFilters(): Promise<void> {
    await this.collection.restart()
  }
}
