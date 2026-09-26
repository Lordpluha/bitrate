import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { type AuditEntry, AuditRepository, type ListAuditEntriesQuery } from '@domain/audit'
import type { Page } from '@domain/shared'
import { ADMIN_API } from '../http/api.config'
import { fetchPage } from '../http/wire-page'
import { auditEntryPageDto } from './audit.dto'
import { toAuditEntry, toWireAuditSort } from './audit.mapper'

@Injectable()
export class HttpAuditRepository extends AuditRepository {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/audit`

  override list({ page, limit, filter }: ListAuditEntriesQuery): Promise<Page<AuditEntry>> {
    return fetchPage({
      http: this.http,
      url: this.base,
      page,
      limit,
      filters: {
        entityType: filter.entityType,
        entityId: filter.entityId,
        sort: filter.sort ? toWireAuditSort(filter.sort.field) : undefined,
        order: filter.sort?.direction,
      },
      schema: auditEntryPageDto,
      toDomain: toAuditEntry,
    })
  }
}
