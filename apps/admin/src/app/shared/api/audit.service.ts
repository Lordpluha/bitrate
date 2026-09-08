import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { ADMIN_API, fetchPage } from './admin-http'
import { type AuditEntry, auditEntryPageSchema } from './schemas'
import type { Page } from '../lib/collection'

type ListAuditInput = {
  page: number
  entityType?: string
}

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/audit`

  /** Read-only by design: an audit trail nobody can edit is the only kind worth having. */
  list({ page, entityType }: ListAuditInput): Promise<Page<AuditEntry>> {
    return fetchPage<Page<AuditEntry>>({
      http: this.http,
      url: this.base,
      page,
      filters: { entityType },
      schema: auditEntryPageSchema,
    })
  }
}
