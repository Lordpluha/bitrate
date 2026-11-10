import { pipeToResponse } from '@common/utils/stream'
import type { UserEntity } from '@modules/users/entities'
import { CurrentUser } from '@modules/users-auth/decorators/current-user.decorator'
import { UserThrottlerGuard } from '@modules/users-auth/user-throttler.guard'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type { Request, Response } from 'express'
import { ZodValidationPipe } from 'nestjs-zod'
import { OpenPlaySessionSwagger, StreamTrackRenditionSwagger } from '../decorators'
import { type OpenPlaySessionDto, OpenPlaySessionSchema } from '../dtos/open-play-session.dto'
import {
  PlaySessionEntity,
  type TrackEntity,
  TrackManifestEntity,
  TrackManifestRenditionEntity,
} from '../entities'
import { PLAYBACK_ERRORS } from '../errors'
import { PlaybackAbuseError } from './playback-abuse'
import { PlaybackPacingError } from './playback-session.service'
import { TrackPlaybackService } from './track-playback.service'
import { UnsatisfiableRangeError } from './track-playback.types'

/**
 * Rendition bytes are never stored by the browser or a proxy (#522 D3): a year-long cache kept
 * whole cleartext renditions on disk, a ready-made file outside any play session. The player
 * buffers what it needs in memory.
 */
const RENDITION_CACHE_CONTROL = 'private, no-store, no-transform'

const logger = new Logger('TrackPlaybackController')

/** A storage read answering an optional HTTP Range request. */
type RangeStream = {
  stream: NodeJS.ReadableStream
  contentType: string
  isPartial: boolean
  start?: number
  end?: number
  fileSize?: number
}

/**
 * Sends a ranged read as 206 (with `Content-Range`) or 200, plus the route's own `headers`,
 * then streams the body.
 */
function sendRangeStream(
  res: Response,
  data: RangeStream,
  headers: Record<string, string | number>,
): void {
  res.status(data.isPartial ? 206 : 200)
  res.set({
    'Content-Type': data.contentType,
    'Accept-Ranges': 'bytes',
    ...headers,
    ...(data.isPartial
      ? { 'Content-Range': `bytes ${data.start}-${data.end}/${data.fileSize}` }
      : {}),
  })
  pipeToResponse(data.stream, res, logger, 'Audio')
}

/** Audio delivery: play sessions and CMAF renditions under `/tracks/:id`. */
@ApiExtraModels(TrackManifestEntity, TrackManifestRenditionEntity, PlaySessionEntity)
@ApiTags('Tracks')
@Controller({ path: 'tracks', version: '1' })
export class TrackPlaybackController {
  constructor(private trackPlaybackService: TrackPlaybackService) {}

  @OpenPlaySessionSwagger()
  // Above @UserAuth: decorators apply bottom-up, so the auth guard runs first and sets req.user.
  @UseGuards(UserThrottlerGuard)
  @UserAuth()
  @Throttle({ default: { ttl: 60_000, limit: 120 } })
  @Post(':id/play-sessions')
  async openPlaySession(
    @Param('id', ParseUUIDPipe) id: TrackEntity['id'],
    @CurrentUser() user: UserEntity,
    @Body(new ZodValidationPipe(OpenPlaySessionSchema)) dto: OpenPlaySessionDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      return await this.trackPlaybackService.openSession({
        trackId: id,
        userId: user.id,
        ...(dto?.deviceId ? { deviceId: dto.deviceId } : {}),
      })
    } catch (error) {
      if (error instanceof PlaybackAbuseError) {
        res.set('Retry-After', String(error.retryAfterSeconds))
        throw new HttpException(PLAYBACK_ERRORS.TOO_MANY_TRACKS, HttpStatus.TOO_MANY_REQUESTS)
      }
      throw error
    }
  }

  /** Authorised by the session token alone (D9): a native `<audio>` cannot refresh a cookie. */
  @StreamTrackRenditionSwagger()
  @Throttle({ default: { ttl: 60_000, limit: 1_200 } })
  @Get(':id/cmaf/:bitrate')
  async streamRendition(
    @Param('id', ParseUUIDPipe) id: TrackEntity['id'],
    @Param('bitrate', ParseIntPipe) bitrate: number,
    @Query('t') token: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    let rendition: Awaited<ReturnType<TrackPlaybackService['getRenditionStream']>>
    try {
      rendition = await this.trackPlaybackService.getRenditionStream({
        trackId: id,
        bitrate,
        rangeHeader: req.headers.range,
        token,
      })
    } catch (error) {
      if (error instanceof UnsatisfiableRangeError) {
        res.set({ 'Accept-Ranges': 'bytes', 'Content-Range': `bytes */${error.fileSize}` })
        return res.status(416).send()
      }
      if (error instanceof PlaybackPacingError) {
        res.set({ 'Retry-After': String(error.retryAfterSeconds) })
        return res.status(429).send()
      }
      throw error
    }

    sendRangeStream(res, rendition, {
      'Content-Length': String(rendition.contentLength),
      'Cache-Control': RENDITION_CACHE_CONTROL,
    })
  }
}
