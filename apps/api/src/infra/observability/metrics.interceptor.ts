import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import type { Request, Response } from 'express'
import type { Observable } from 'rxjs'
import { finalize } from 'rxjs/operators'
// biome-ignore lint/style/useImportType: Nest needs this class in emitted constructor metadata.
import { MetricsService } from './metrics.service'

const UNKNOWN_ROUTE = 'unknown'

/** Returns only a registered route template, never a user-controlled request path. */
export const resolveMetricRoute = (context: ExecutionContext, request: Request): string => {
  const routePath = request.route?.path
  if (typeof routePath === 'string' && routePath.length > 0 && routePath.length <= 256) {
    return routePath
  }

  const controller = context.getClass()?.name
  const handler = context.getHandler()?.name
  return controller && handler ? `${controller}.${handler}` : UNKNOWN_ROUTE
}

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = performance.now()
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()
    return next.handle().pipe(
      finalize(() => {
        this.metrics.record(
          request.method,
          resolveMetricRoute(context, request),
          response.statusCode,
          performance.now() - startedAt,
        )
      }),
    )
  }
}
