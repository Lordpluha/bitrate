import { getRequestId } from '@common/http/request-context'
import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'

/** The request-scoped fields an operator mutation's audit row links back to
 * `AuditInterceptor`'s generic row with — same correlation id, same source IP. */
export type AuditContextValue = {
  requestId?: string
  ipAddress?: string
}

/**
 * Extracts the correlation id and source IP for the current request, the same way
 * `AuditInterceptor` does, so a service-level `writeTakeDownAudit` row can be joined back to
 * the interceptor's generic row for the same mutation. Reads the request directly rather than
 * injecting `REQUEST`-scoped providers, which would force every provider in the chain into
 * request scope.
 */
export const AuditContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuditContextValue => {
    const request = ctx.switchToHttp().getRequest<Request>()
    return { requestId: getRequestId(request), ipAddress: request.ip }
  },
)
