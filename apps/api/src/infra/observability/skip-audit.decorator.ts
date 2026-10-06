import { SetMetadata } from '@nestjs/common'

/** Metadata key `AuditInterceptor` reads to decide whether to record a request-level row. */
export const SKIP_AUDIT_KEY = 'audit:skip'

/**
 * Opts a route out of `AuditInterceptor`'s one-row-per-request audit entry. Use it only on a
 * route whose service already writes one explicit audit row per affected entity (the admin
 * batch routes) — an aggregate row on top of those would double-count the request.
 */
export const SkipAudit = () => SetMetadata(SKIP_AUDIT_KEY, true)
