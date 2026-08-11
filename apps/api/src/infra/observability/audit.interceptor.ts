// biome-ignore lint/style/useImportType: Nest needs this class in emitted constructor metadata.
import { PrismaService } from '@infra/prisma/prisma.service'
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import type { Request } from 'express'
import type { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

const AUDITED_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

type AuditableRequest = Request & {
  user?: { id: string }
  artist?: { id: string }
}

/** Records successful state-changing requests without affecting their response. */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name)

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuditableRequest>()
    if (!AUDITED_METHODS.has(request.method)) return next.handle()

    return next.handle().pipe(
      tap({
        next: () => void this.record(request),
      }),
    )
  }

  private async record(request: AuditableRequest) {
    try {
      const segments = request.path.split('/').filter(Boolean)
      const entityType = segments[0] ?? 'api'
      const routeId = request.params?.id
      const entityId = typeof routeId === 'string' && this.isUuid(routeId) ? routeId : undefined

      await this.prisma.auditLog.create({
        data: {
          userId: request.user?.id,
          action: `${request.method} ${request.route?.path ?? request.path}`,
          entityType,
          entityId,
          ipAddress: request.ip,
          metadata: {
            ...(request.artist ? { artistId: request.artist.id } : {}),
            path: request.path,
          },
        },
      })
    } catch (error) {
      this.logger.error('Failed to persist audit log', error)
    }
  }

  private isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  }
}
