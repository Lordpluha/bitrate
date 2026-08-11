import { createHash } from 'node:crypto'
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import type { Request, Response } from 'express'
import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

const CACHEABLE_RESOURCE = /^\/api\/v1\/(albums|artists|playlists|browse|charts)(\/|\?|$)/

/** Adds conditional HTTP caching to public read-only resource responses. */
@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()
    const cacheable = request.method === 'GET' && CACHEABLE_RESOURCE.test(request.originalUrl)

    return next.handle().pipe(
      map((body: unknown) => {
        if (!cacheable || response.statusCode !== 200 || body === undefined) return body

        const etag = `"${createHash('sha256').update(JSON.stringify(body)).digest('base64url')}"`
        response.setHeader('ETag', etag)
        response.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')
        if (request.headers['if-none-match'] === etag) {
          response.status(304)
          return undefined
        }
        return body
      }),
    )
  }
}
