import { pipeToResponse } from '@common/utils/stream'
import type { ArtistEntity } from '@modules/artists/entities'
import { ArtistAuth } from '@modules/artists-auth/artists-auth.guard'
import { CurrentArtist } from '@modules/artists-auth/decorators/current-artist.decorator'
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
@Controller({ path: 'artists/me/releases', version: '1' })
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
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body(new ZodValidationPipe(UploadReleaseCoverSchema)) input: UploadReleaseCoverDto,
  ) {
    return this.covers.uploadCover(artist.id, id, file, input)
  }

  @RemoveReleaseCoverSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @Delete(':id/cover')
  removeCover(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReleaseDraftVersionSchema)) input: ReleaseDraftVersionDto,
  ) {
    return this.covers.removeCover(artist.id, id, input)
  }

  @UploadReleaseTrackSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @ReleaseAudioInterceptor()
  @Post(':id/tracks')
  addTrack(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body(new ZodValidationPipe(UploadReleaseTrackSchema)) input: UploadReleaseTrackDto,
  ) {
    return this.media.addTrack(artist.id, id, file, input)
  }

  @ReplaceReleaseTrackAudioSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @ReleaseAudioInterceptor()
  @Put(':id/tracks/:trackId/audio')
  replaceTrackAudio(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('trackId', ParseUUIDPipe) trackId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body(new ZodValidationPipe(ReleaseDraftVersionSchema)) input: ReleaseDraftVersionDto,
  ) {
    return this.media.replaceTrackAudio(artist.id, id, trackId, file, input)
  }

  @ReorderReleaseTracksSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Put(':id/tracks/order')
  reorderTracks(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(ReorderReleaseTracksSchema)) input: ReorderReleaseTracksDto,
  ) {
    return this.media.reorderTracks(artist.id, id, input)
  }

  @RemoveReleaseTrackSwagger()
  @ArtistAuth()
  @Header('Cache-Control', 'private, no-store')
  @HttpCode(200)
  @Delete(':id/tracks/:trackId')
  removeTrack(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('trackId', ParseUUIDPipe) trackId: string,
    @Body(new ZodValidationPipe(ReleaseDraftVersionSchema)) input: ReleaseDraftVersionDto,
  ) {
    return this.media.removeTrack(artist.id, id, trackId, input)
  }

  @ReleaseTrackAudioSwagger()
  @ArtistAuth()
  @Get(':id/tracks/:trackId/audio')
  async trackAudio(
    @CurrentArtist() artist: ArtistEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('trackId', ParseUUIDPipe) trackId: string,
    @Headers('range') range: string | undefined,
    @Res() response: Response,
  ) {
    const audio = await this.media.audioStream(artist.id, id, trackId, range)
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
