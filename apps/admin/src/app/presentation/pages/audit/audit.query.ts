import { createQueryCodec, intParam, stringParam, type QueryCodec } from '@presentation/state'

export type AuditQuery = {
  entityType: string
  page: number
}

export const auditQueryCodec: QueryCodec<AuditQuery> = createQueryCodec({
  defaults: { entityType: '', page: 1 },
  fields: {
    entityType: { param: 'entityType', codec: stringParam() },
    page: { param: 'page', codec: intParam(1) },
  },
})
