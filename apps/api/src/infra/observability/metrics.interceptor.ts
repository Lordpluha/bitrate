import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import type { Request, Response } from 'express'
import type { Observable } from 'rxjs'
import { finalize } from 'rxjs/operators'
// biome-ignore lint/style/useImportType: Nest needs this class in emitted constructor metadata.
import { MetricsService } from './metrics.service'

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = performance.now()
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()
    return next.handle().pipe(
      finalize(() => {
        const route = request.route?.path ?? request.path
        this.metrics.record(
          request.method,
          route,
          response.statusCode,
          performance.now() - startedAt,
        )
      }),
    )
  }
}
