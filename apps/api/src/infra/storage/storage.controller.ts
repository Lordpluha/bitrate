import type { AppConfig } from '@common/config'
import { STORAGE_SERVICE } from '@infra/storage/storage.constants'
import type { StorageService } from '@infra/storage/storage.types'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiTags } from '@nestjs/swagger'
import type { Request, Response } from 'express'
import { StreamSignedStorageObjectSwagger } from './decorators'
import { LocalStorageService } from './local-storage.service'
import { verifySignedStorageToken } from './signed-storage-token'
import type { StorageObjectStream } from './storage.types'

const COVER_KEY_PATTERN = /^(tracks|albums|playlists)\/[^/]+\/cover\.(gif|jpe?g|png|webp)$/i
const PROFILE_IMAGE_KEY_PATTERN =
  /^(artists|users)\/[^/]+\/(avatar|background)\.(gif|jpe?g|png|webp)$/i

/** Serves local-storage objects through signed, time-limited tokens (the local presigned-URL route). */
@ApiTags('Storage')
@Controller({ path: 'storage', version: '1' })
export class StorageController {
  /** Creates a new instance. */
  constructor(
    private readonly localStorage: LocalStorageService,
    private readonly config: ConfigService<AppConfig>,
    @Inject(STORAGE_SERVICE) private readonly storage: StorageService,
  ) {}

  /** Returns a short-lived direct URL for a private cover or profile image. */
  @UserAuth()
  @Get('images/presigned-url')
  async getImageUrl(@Query('key') key?: string) {
    if (!(key && (COVER_KEY_PATTERN.test(key) || PROFILE_IMAGE_KEY_PATTERN.test(key)))) {
      throw new BadRequestException('Unsupported image storage key')
    }
    if (!(await this.storage.exists(key))) throw new NotFoundException('Image not found')

    const expiresIn = 900
    return { url: await this.storage.getPresignedUrl(key, expiresIn), expiresIn }
  }

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
