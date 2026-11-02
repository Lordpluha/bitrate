import { pipeToResponse } from '@common/utils/stream'
import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import type { UserAuthRequest } from '@modules/users-auth/types'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFiles,
} from '@nestjs/common'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type { Request, Response } from 'express'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  GetTrackByIdSwagger,
  LikeTrackSwagger,
  OpenPlaySessionSwagger,
  PostTrackSwagger,
  StreamTrackRenditionSwagger,
  TracksGetAllSwagger,
  TracksGetLikedSwagger,
  UnlikeTrackSwagger,
  UpdateTrackByIdSwagger,
} from './decorators'
import {
  type CreateTrackDto,
  CreateTrackSchema,
  type UpdateTrackDto,
  UpdateTrackSchema,
} from './dtos/create-track.dto'
import { type OpenPlaySessionDto, OpenPlaySessionSchema } from './dtos/open-play-session.dto'
import {
  PlaySessionEntity,
  TrackEntity,
  TrackManifestEntity,
  TrackManifestRenditionEntity,
} from './entities'
import { PlaybackPacingError } from './playback-session.service'
import { TrackPlaybackService } from './track-playback.service'
import { UnsatisfiableRangeError } from './track-playback.types'
import { TrackFilesInterceptor } from './track-upload.interceptor'
import { TrackUploadService } from './track-upload.service'
import { TracksService } from './tracks.service'

/** The multipart parts accepted when creating or updating a track. */
type TrackUploadFiles = { audio?: Express.Multer.File[]; cover?: Express.Multer.File[] }

/** Rendition bytes never change, so they can be cached for a long time. */
const IMMUTABLE_CACHE_CONTROL = 'private, max-age=31536000, immutable, no-transform'

const logger = new Logger('TracksController')

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

/** Track catalogue, uploads, likes and audio delivery. */
@ApiExtraModels(TrackEntity, TrackManifestEntity, TrackManifestRenditionEntity, PlaySessionEntity)
@ApiTags('Tracks')
@Controller({ path: 'tracks', version: '1' })
export class TracksController {
  constructor(
    private tracksService: TracksService,
    private trackUploadService: TrackUploadService,
    private trackPlaybackService: TrackPlaybackService,
  ) {}

  @TracksGetAllSwagger()
  @Get('')
  getAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('title') title?: TrackEntity['title'],
    @Query('artistId', new ParseUUIDPipe({ optional: true })) artistId?: string,
  ) {
    return this.tracksService.findAll({ artistId, limit, page, title })
  }

  @PostTrackSwagger()
  @ArtistAuth()
  @Post('')
  @TrackFilesInterceptor()
  async postTrack(
    @Req() req: ArtistAuthRequest,
    @Body(new ZodValidationPipe(CreateTrackSchema))
    createTrackDto: CreateTrackDto,
    @UploadedFiles() files: TrackUploadFiles,
  ) {
    const audioFile = files?.audio?.[0]
    const coverFile = files?.cover?.[0]

    if (!audioFile) {
      throw new BadRequestException('Audio file is required')
    }

    return await this.trackUploadService.create(req.artist.id, createTrackDto, audioFile, coverFile)
  }

  @UpdateTrackByIdSwagger()
  @ArtistAuth()
  @Put(':id')
  @TrackFilesInterceptor()
  putTrack(
    @Req() req: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: TrackEntity['id'],
    @Body(new ZodValidationPipe(UpdateTrackSchema))
    updateTrackDto: UpdateTrackDto,
    @UploadedFiles() files: TrackUploadFiles,
  ) {
    return this.trackUploadService.update(
      req.artist.id,
      id,
      updateTrackDto,
      files?.audio?.[0],
      files?.cover?.[0],
    )
  }

  @TracksGetLikedSwagger()
  @UserAuth()
  @Get('liked')
  getLikedTracks(
    @Req() req: UserAuthRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.tracksService.findLikedTracks(req.user.id, { page, limit })
  }

  @GetTrackByIdSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: TrackEntity['id']) {
    return this.tracksService.findTrackById(id)
  }

  @OpenPlaySessionSwagger()
  @UserAuth()
  @Throttle({ default: { ttl: 60_000, limit: 120 } })
  @Post(':id/play-sessions')
  openPlaySession(
    @Param('id', ParseUUIDPipe) id: TrackEntity['id'],
    @Req() req: UserAuthRequest,
    @Body(new ZodValidationPipe(OpenPlaySessionSchema)) dto: OpenPlaySessionDto,
  ) {
    return this.trackPlaybackService.openSession({
      trackId: id,
      userId: req.user.id,
      ...(dto?.deviceId ? { deviceId: dto.deviceId } : {}),
    })
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
      'Cache-Control': IMMUTABLE_CACHE_CONTROL,
    })
  }

  @LikeTrackSwagger()
  @UserAuth()
  @Post(':id/like')
  likeTrack(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: TrackEntity['id']) {
    return this.tracksService.like(req.user.id, id)
  }

  @UnlikeTrackSwagger()
  @UserAuth()
  @HttpCode(200)
  @Delete(':id/like')
  unlikeTrack(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: TrackEntity['id']) {
    return this.tracksService.unlike(req.user.id, id)
  }
}
