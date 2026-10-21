import { pipeToResponse } from '@common/utils/stream'
import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import type { ArtistAuthRequest } from '@modules/artists-auth/types'
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Headers,
  HttpCode,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { ZodValidationPipe } from 'nestjs-zod'
import {
  ReleaseTrackAudioSwagger,
  RemoveReleaseCoverSwagger,
  RemoveReleaseTrackSwagger,
  ReorderReleaseTracksSwagger,
  ReplaceReleaseTrackAudioSwagger,
  UploadReleaseCoverSwagger,
  UploadReleaseTrackSwagger,
} from './decorators'
import {
  type ReleaseDraftVersionDto,
  ReleaseDraftVersionSchema,
  type ReorderReleaseTracksDto,
  ReorderReleaseTracksSchema,
  type UploadReleaseCoverDto,
  UploadReleaseCoverSchema,
  type UploadReleaseTrackDto,
  UploadReleaseTrackSchema,
} from './dtos/release-media.dto'
import { ReleaseCoverService } from './release-cover.service'
import { ReleaseAudioInterceptor, ReleaseCoverInterceptor } from './release-media.interceptors'
import { ReleaseMediaService } from './release-media.service'

const logger = new Logger('ReleaseMediaController')

/** Artwork and master audio of an owned draft; files stay private until a later delivery stage. */
@ApiTags('Releases')
@Controller({ path: 'releases', version: '1' })
export class ReleaseMediaController {
  constructor(
    private readonly media: ReleaseMediaService,
    private readonly covers: ReleaseCoverService,
  ) {}

  @UploadReleaseCoverSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @ReleaseCoverInterceptor()
  @Put(':id/cover')
  uploadCover(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body(new ZodValidationPipe(UploadReleaseCoverSchema)) input: UploadReleaseCoverDto,
  ) {
    return this.covers.uploadCover(request.artist.id, id, file, input)
  }

  @RemoveReleaseCoverSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Delete(':id/cover')
  removeCover(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReleaseDraftVersionSchema)) input: ReleaseDraftVersionDto,
  ) {
    return this.covers.removeCover(request.artist.id, id, input)
  }

  @UploadReleaseTrackSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @ReleaseAudioInterceptor()
  @Post(':id/tracks')
  addTrack(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body(new ZodValidationPipe(UploadReleaseTrackSchema)) input: UploadReleaseTrackDto,
  ) {
    return this.media.addTrack(request.artist.id, id, file, input)
  }

  @ReplaceReleaseTrackAudioSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @ReleaseAudioInterceptor()
  @Put(':id/tracks/:trackId/audio')
  replaceTrackAudio(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('trackId', ParseUUIDPipe) trackId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body(new ZodValidationPipe(ReleaseDraftVersionSchema)) input: ReleaseDraftVersionDto,
  ) {
    return this.media.replaceTrackAudio(request.artist.id, id, trackId, file, input)
  }

  @ReorderReleaseTracksSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Put(':id/tracks/order')
  reorderTracks(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReorderReleaseTracksSchema)) input: ReorderReleaseTracksDto,
  ) {
    return this.media.reorderTracks(request.artist.id, id, input)
  }

  @RemoveReleaseTrackSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Delete(':id/tracks/:trackId')
  removeTrack(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('trackId', ParseUUIDPipe) trackId: string,
    @Body(new ZodValidationPipe(ReleaseDraftVersionSchema)) input: ReleaseDraftVersionDto,
  ) {
    return this.media.removeTrack(request.artist.id, id, trackId, input)
  }

  @ReleaseTrackAudioSwagger()
  @ArtistAuth()
  @Get(':id/tracks/:trackId/audio')
  async trackAudio(
    @Req() request: ArtistAuthRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('trackId', ParseUUIDPipe) trackId: string,
    @Headers('range') range: string | undefined,
    @Res() response: Response,
  ) {
    const audio = await this.media.audioStream(request.artist.id, id, trackId, range)
    response.status(audio.contentRange ? 206 : 200)
    response.set({
      'Content-Type': audio.contentType ?? 'application/octet-stream',
      'Accept-Ranges': 'bytes',
      ...(audio.contentLength === undefined ? {} : { 'Content-Length': audio.contentLength }),
      ...(audio.contentRange ? { 'Content-Range': audio.contentRange } : {}),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    })
    pipeToResponse(audio.stream, response, logger, `Release ${id} audio`)
  }
}
