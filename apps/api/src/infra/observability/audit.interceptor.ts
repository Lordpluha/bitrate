// biome-ignore lint/style/useImportType: Nest needs this class in emitted constructor metadata.
import { PrismaService } from '@infra/prisma/prisma.service'
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import type { Request } from 'express'
import { from, type Observable } from 'rxjs'
import { concatMap, map } from 'rxjs/operators'
import { getRequestId } from '../../common/http/request-context'
import { resolveMetricRoute } from './metrics.interceptor'

const AUDITED_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

type AuditableRequest = Request & {
  user?: { id: string }
  artist?: { id: string }
}

const toEntityType = (controllerName: string) =>
  controllerName
    .replace(/Controller$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase() || 'application'

/** Records successful state-changing requests without affecting their response. */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name)

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuditableRequest>()
    if (!AUDITED_METHODS.has(request.method)) return next.handle()

    return next
      .handle()
      .pipe(concatMap((value) => from(this.record(context, request)).pipe(map(() => value))))
  }

  private async record(context: ExecutionContext, request: AuditableRequest) {
    try {
      const actor = request.user
        ? { type: 'user' as const, id: request.user.id }
        : request.artist
          ? { type: 'artist' as const, id: request.artist.id }
          : { type: 'anonymous' as const }
      const entityType = toEntityType(context.getClass()?.name ?? '')
      const handlerName = context.getHandler()?.name || 'unknown'
      const entityId = Object.values(request.params ?? {}).find(
        (value): value is string => typeof value === 'string' && this.isUuid(value),
      )
      const route = resolveMetricRoute(context, request)
      const requestId = getRequestId(request)

      await this.prisma.auditLog.create({
        data: {
          userId: actor.type === 'user' ? actor.id : undefined,
          action: `${entityType}.${handlerName}`,
          entityType,
          entityId,
          ipAddress: request.ip,
          metadata: {
            actorType: actor.type,
            ...('id' in actor ? { actorId: actor.id } : {}),
            ...(requestId ? { requestId } : {}),
            method: request.method,
            route,
          },
        },
      })
    } catch (error) {
      // Mutations have already succeeded at this point. Await persistence so a
      // response cannot race process shutdown, but fail open to avoid unsafe
      // client retries of a completed mutation when audit storage is degraded.
      this.logger.error('Failed to persist audit log', error)
    }
  }

  private isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  }
}
