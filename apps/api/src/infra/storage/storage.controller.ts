import type { AppConfig } from '@common/config'
import { Controller, Get, NotFoundException, Param, Req, Res } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { StreamSignedStorageObjectSwagger } from './decorators'
import { LocalStorageService } from './local-storage.service'
import { verifySignedStorageToken } from './signed-storage-token'
import type { StorageObjectStream } from './storage.types'

/** Serves local-storage objects through signed, time-limited tokens (the local presigned-URL route). */
@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  /** Creates a new instance. */
  constructor(
    private readonly localStorage: LocalStorageService,
    private readonly config: ConfigService<AppConfig>,
  ) {}

  /** Streams a local object addressed by a signed token, honoring an HTTP Range. */
  @StreamSignedStorageObjectSwagger()
  @Get('objects/:token')
  async streamSignedObject(
    @Param('token') token: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const key = verifySignedStorageToken(token, this.config.getOrThrow('JWT_SECRET'))
    if (!key) throw new NotFoundException('Signed URL is invalid or expired')

    let data: StorageObjectStream
    try {
      data = await this.localStorage.getObjectStream(key, req.headers.range)
    } catch {
      throw new NotFoundException('Object not found')
    }

    res.status(data.contentRange ? 206 : 200)
    res.set({
      'Content-Type': data.contentType ?? 'application/octet-stream',
      'Accept-Ranges': 'bytes',
      ...(data.contentLength === undefined ? {} : { 'Content-Length': data.contentLength }),
      ...(data.contentRange ? { 'Content-Range': data.contentRange } : {}),
      'Cache-Control': 'private, max-age=3600, no-transform',
    })
    return data.stream.pipe(res)
  }
}
