import { createHash } from 'node:crypto'
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import type { Request, Response } from 'express'
import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { HTTP_CACHEABLE_KEY } from './http-cacheable.decorator'

/** Adds conditional HTTP caching to routes marked `@HttpCacheable()`. */
@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()
    const handler = context.getHandler()
    const cacheable =
      request.method === 'GET' &&
      handler !== undefined &&
      Reflect.getMetadata(HTTP_CACHEABLE_KEY, handler) === true

    return next.handle().pipe(
      map((body: unknown) => {
        if (!cacheable || response.statusCode !== 200 || body === undefined) return body

        const etag = `"${createHash('sha256').update(JSON.stringify(body)).digest('base64url')}"`
        response.setHeader('ETag', etag)
        /**
         * `public` would let a CDN or corporate proxy serve one signed-in
         * user's response to another. Anything sent with credentials is
         * cacheable only by that user's own browser.
         */
        const isCredentialed = Boolean(request.headers.cookie || request.headers.authorization)
        response.setHeader(
          'Cache-Control',
          isCredentialed
            ? 'private, max-age=30, stale-while-revalidate=60'
            : 'public, max-age=30, stale-while-revalidate=60',
        )
        if (request.headers['if-none-match'] === etag) {
          response.status(304)
          return undefined
        }
        return body
      }),
    )
  }
}
