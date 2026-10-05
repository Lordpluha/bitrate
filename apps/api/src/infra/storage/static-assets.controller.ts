import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Req,
  Res,
  VERSION_NEUTRAL,
} from '@nestjs/common'
import { ApiExcludeEndpoint } from '@nestjs/swagger'
import { SkipThrottle } from '@nestjs/throttler'
import type { Request, Response } from 'express'
import { isPublicAssetKey } from './public-images'

/**
 * Public images at `/static/<folder>/<file>`, read from STORAGE_SERVICE.
 *
 * Replaces the former filesystem `ServeStaticModule` mount at the same URL. The object store is
 * never published (ADR-0050): only keys matching the public image layout are reachable, and
 * everything else, including audio, answers 404 as if it did not exist. Excluded from the global
 * `/api` prefix in `main.ts` and from the OpenAPI document, like the mount it replaces.
 */
@SkipThrottle()
@Controller({ path: 'static', version: VERSION_NEUTRAL })
export class StaticAssetsController {
  /** Creates a new instance. */
  constructor(@Inject(STORAGE_SERVICE) private readonly storage: StorageService) {}

  /** Streams one public image, honoring an HTTP Range. */
  @ApiExcludeEndpoint()
  @Get('*path')
  async serve(@Req() req: Request, @Res() res: Response) {
    const segments = req.params.path
    const key = Array.isArray(segments) ? segments.join('/') : String(segments ?? '')
    if (!isPublicAssetKey(key)) throw new NotFoundException('Resource not found')

    let data: Awaited<ReturnType<StorageService['getObjectStream']>>
    try {
      data = await this.storage.getObjectStream(key, req.headers.range)
    } catch {
      throw new NotFoundException('Resource not found')
    }

    res.status(data.contentRange ? 206 : 200)
    res.set({
      'Content-Type': data.contentType ?? 'application/octet-stream',
      'Accept-Ranges': 'bytes',
      ...(data.contentLength === undefined ? {} : { 'Content-Length': data.contentLength }),
      ...(data.contentRange ? { 'Content-Range': data.contentRange } : {}),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    })
    data.stream.on('error', () => res.destroy())
    return data.stream.pipe(res)
  }
}
