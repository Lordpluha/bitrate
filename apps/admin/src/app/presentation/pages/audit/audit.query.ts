import { coveringTuple, type Sort } from '@domain/shared'
import type { AuditSortField } from '@domain/audit'
import {
  createQueryCodec,
  intParam,
  sortParam,
  stringParam,
  type QueryCodec,
} from '@presentation/state'

export const AUDIT_SORT_FIELDS = coveringTuple<AuditSortField>()(['createdAt'])

export type AuditQuery = {
  entityType: string
  sort: Sort<AuditSortField> | null
  page: number
}

export const auditQueryCodec: QueryCodec<AuditQuery> = createQueryCodec<AuditQuery>({
  defaults: { entityType: '', sort: null, page: 1 },
  fields: {
    entityType: { param: 'entityType', codec: stringParam() },
    sort: sortParam({ members: AUDIT_SORT_FIELDS }),
    page: { param: 'page', codec: intParam(1) },
  },
})
