import { inject, Injectable } from '@angular/core'
import { type AuditEntry, type AuditFilter, AuditRepository } from '@domain/audit'
import { DEFAULT_PAGE_SIZE, type Page } from '@domain/shared'

export type ListAuditEntriesInput = {
  page: number
  filter?: AuditFilter
}

@Injectable({ providedIn: 'root' })
export class ListAuditEntriesUseCase {
  private readonly audit = inject(AuditRepository)

  execute({ page, filter = {} }: ListAuditEntriesInput): Promise<Page<AuditEntry>> {
    return this.audit.list({ page, limit: DEFAULT_PAGE_SIZE, filter })
  }
}
