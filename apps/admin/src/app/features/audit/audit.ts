import { DatePipe } from '@angular/common'
import { Component, inject, signal } from '@angular/core'
import { type AuditEntry, AuditService } from '@shared/api'
import { CollectionStatus, Paginator } from '@shared/components'
import { createCollection } from '@shared/lib/collection'
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
  private readonly audit = inject(AuditService)

  protected readonly entityType = signal('')

  /** No mutations here on purpose: an audit trail an operator can edit is not an audit trail. */
  protected readonly collection = createCollection<AuditEntry>({
    errorMessage: 'Could not load the audit log.',
    load: (page) => this.audit.list({ page, entityType: this.entityType() || undefined }),
  })

  constructor() {
    void this.collection.restart()
  }

  protected async applyFilters(): Promise<void> {
    await this.collection.restart()
  }
}
