import { rm } from 'node:fs/promises'
import type { ArtistEntity } from '@modules/artists'
import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { UserEntity } from '@modules/users'
import type { UserAuthRequest } from '@modules/users-auth/types'
import { UserAuth } from '@modules/users-auth/users-auth.guard'
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseEnumPipe,
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
  GetTrackManifestSwagger,
  LikeTrackSwagger,
  PostTrackSwagger,
  StreamTrackRenditionSwagger,
  StreamTrackSwagger,
  TracksGetAllSwagger,
  TracksGetLikedSwagger,
  UnlikeTrackSwagger,
  UpdateTrackByIdSwagger,
} from './decorators'
import { type CreateTrackDto, CreateTrackSchema } from './dtos/create-track.dto'
import { TrackEntity, TrackManifestEntity, TrackManifestRenditionEntity } from './entities'
import { type AudioStreamFormat, SUPPORTED_AUDIO_STREAM_FORMATS } from './track-audio.helpers'
import { TrackPlaybackService } from './track-playback.service'
import { UnsatisfiableRangeError } from './track-playback.types'
import { TrackStreamingService } from './track-streaming.service'
import { TrackFilesInterceptor } from './track-upload.interceptor'
import { TrackUploadService } from './track-upload.service'
import { TracksService } from './tracks.service'

/** The multipart parts accepted when creating or updating a track. */
type TrackUploadFiles = { audio?: Express.Multer.File[]; cover?: Express.Multer.File[] }

/** Rendition bytes never change, so they can be cached for a long time. */
const IMMUTABLE_CACHE_CONTROL = 'private, max-age=31536000, immutable, no-transform'

/** Represents the tracks controller. */
@ApiExtraModels(TrackEntity, TrackManifestEntity, TrackManifestRenditionEntity)
@ApiTags('Tracks')
@Controller({ path: 'tracks', version: '1' })
export class TracksController {
  constructor(
    private tracksService: TracksService,
    private trackUploadService: TrackUploadService,
    private trackStreamingService: TrackStreamingService,
    private trackPlaybackService: TrackPlaybackService,
  ) {}

  /** Runs the get all operation. */
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

  /** Runs the get hls master playlist operation. */
  @UserAuth()
  @Throttle({ default: { ttl: 60_000, limit: 600 } })
  @Get('stream/:id/hls/master.m3u8')
  async getHlsMasterPlaylist(
    @Param('id', ParseUUIDPipe) id: TrackEntity['id'],
    @Res() res: Response,
  ) {
    const playlist = await this.trackStreamingService.getHlsMasterPlaylist(id)
    res.set({
      'Content-Type': 'application/vnd.apple.mpegurl',
      'Cache-Control': 'private, max-age=5, no-transform',
    })
    return res.send(playlist)
  }

  /** Runs the get hls asset operation. */
  @UserAuth()
  @Throttle({ default: { ttl: 60_000, limit: 1_200 } })
  @Get('stream/:id/hls/:bitrate/:asset')
  async getHlsAsset(
    @Param('id', ParseUUIDPipe) id: TrackEntity['id'],
    @Param('bitrate', ParseIntPipe) bitrate: number,
    @Param('asset') asset: string,
    @Res() res: Response,
  ) {
    const data = await this.trackStreamingService.getHlsAsset(id, bitrate, asset)
    res.set({
      'Content-Type': data.contentType,
      ...(data.contentLength === undefined ? {} : { 'Content-Length': data.contentLength }),
      'Cache-Control': data.immutable
        ? IMMUTABLE_CACHE_CONTROL
        : 'private, max-age=30, no-transform',
    })
    return data.stream.pipe(res)
  }

  /** Runs the stream track operation. */
  @StreamTrackSwagger()
  @UserAuth()
  @Throttle({ default: { ttl: 60_000, limit: 600 } })
  @Get('stream/:id')
  async streamTrack(
    @Param('id', ParseUUIDPipe) id: TrackEntity['id'],
    @Req() req: Request,
    @Res() res: Response,
    @Query('bitrate', new ParseIntPipe({ optional: true })) bitrate?: number,
    @Query('format', new ParseEnumPipe(SUPPORTED_AUDIO_STREAM_FORMATS, { optional: true }))
    format?: AudioStreamFormat,
  ) {
    const streamData = await this.trackStreamingService.getTrackStream(
      id,
      req.headers.range,
      bitrate,
      format,
    )

    res.status(streamData.isPartial ? 206 : 200)
    res.set({
      'Content-Type': streamData.contentType,
      'Accept-Ranges': 'bytes',
      ...(streamData.contentLength === undefined
        ? {}
        : { 'Content-Length': streamData.contentLength }),
      'Cache-Control': 'private, max-age=3600, no-transform',
      'X-Audio-Bitrate': streamData.bitrate,
      'X-Audio-Format': streamData.format,
      ...(streamData.isPartial
        ? { 'Content-Range': `bytes ${streamData.start}-${streamData.end}/${streamData.fileSize}` }
        : {}),
    })

    return streamData.stream.pipe(res)
  }

  /** Runs the post track operation. */
  @PostTrackSwagger()
  @ArtistAuth()
  @Post('')
  @TrackFilesInterceptor()
  async postTrack(
    @Req() req: Request,
    @Body(new ZodValidationPipe(CreateTrackSchema))
    createTrackDto: CreateTrackDto,
    @UploadedFiles() files: TrackUploadFiles,
  ) {
    const artist = req.artist as ArtistEntity
    const audioFile = files?.audio?.[0]
    const coverFile = files?.cover?.[0]

    if (!audioFile) {
      if (coverFile) await rm(coverFile.path, { force: true })
      throw new BadRequestException('Audio file is required')
    }

    return await this.trackUploadService.create(artist.id, createTrackDto, audioFile, coverFile)
  }

  /** Runs the put track operation. */
  @UpdateTrackByIdSwagger()
  @ArtistAuth()
  @Put(':id')
  @TrackFilesInterceptor()
  putTrack(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: TrackEntity['id'],
    @Body(new ZodValidationPipe(CreateTrackSchema))
    createTrackDto: CreateTrackDto,
    @UploadedFiles() files: TrackUploadFiles,
  ) {
    const artist = req.artist as ArtistEntity
    return this.trackUploadService.update(
      artist.id,
      id,
      createTrackDto,
      files?.audio?.[0],
      files?.cover?.[0],
    )
  }

  /** Runs the get liked tracks operation. */
  @TracksGetLikedSwagger()
  @UserAuth()
  @Get('liked')
  getLikedTracks(
    @Req() req: Request,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const artist = req.user as UserEntity
    return this.tracksService.findLikedTracks(artist.id, { page, limit })
  }

  /** Runs the get by id operation. */
  @GetTrackByIdSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: TrackEntity['id']) {
    return this.tracksService.findTrackById(id)
  }

  /** Runs the get manifest operation. */
  @GetTrackManifestSwagger()
  @UserAuth()
  @Get(':id/manifest')
  getManifest(@Param('id', ParseUUIDPipe) id: TrackEntity['id']) {
    return this.trackPlaybackService.getManifest(id)
  }

  /** Runs the stream rendition operation. */
  @StreamTrackRenditionSwagger()
  @UserAuth()
  @Throttle({ default: { ttl: 60_000, limit: 1_200 } })
  @Get(':id/cmaf/:bitrate')
  async streamRendition(
    @Param('id', ParseUUIDPipe) id: TrackEntity['id'],
    @Param('bitrate', ParseIntPipe) bitrate: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    let rendition: Awaited<ReturnType<TrackPlaybackService['getRenditionStream']>>
    try {
      rendition = await this.trackPlaybackService.getRenditionStream(id, bitrate, req.headers.range)
    } catch (error) {
      if (error instanceof UnsatisfiableRangeError) {
        res.set({ 'Accept-Ranges': 'bytes', 'Content-Range': `bytes */${error.fileSize}` })
        return res.status(416).send()
      }
      throw error
    }

    res.status(rendition.isPartial ? 206 : 200)
    res.set({
      'Content-Type': rendition.contentType,
      'Accept-Ranges': 'bytes',
      'Content-Length': String(rendition.contentLength),
      'Cache-Control': IMMUTABLE_CACHE_CONTROL,
      ...(rendition.isPartial
        ? { 'Content-Range': `bytes ${rendition.start}-${rendition.end}/${rendition.fileSize}` }
        : {}),
    })

    return rendition.stream.pipe(res)
  }

  /** Runs the like track operation. */
  @LikeTrackSwagger()
  @UserAuth()
  @Post(':id/like')
  likeTrack(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: TrackEntity['id']) {
    return this.tracksService.like(req.user.id, id)
  }

  /** Runs the unlike track operation. */
  @UnlikeTrackSwagger()
  @UserAuth()
  @HttpCode(200)
  @Delete(':id/like')
  unlikeTrack(@Req() req: UserAuthRequest, @Param('id', ParseUUIDPipe) id: TrackEntity['id']) {
    return this.tracksService.unlike(req.user.id, id)
  }
}
