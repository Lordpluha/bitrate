import {
  AuditContext,
  type AuditContextValue,
  TakeDownReasonDto,
  TakeDownReasonSchema,
} from '@modules/admin/shared'
import type { AuthenticatedStaff } from '@modules/admin-auth'
import { AdminAuth, CurrentStaff, RequirePermission } from '@modules/admin-auth'
import { UnsatisfiableRangeError } from '@modules/tracks'
import {
  Body,
  Controller,
  Delete,
  Get,
  Head,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import type { Request, Response } from 'express'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminTrackAudioService } from './admin-track-audio.service'
import { AdminTracksService } from './admin-tracks.service'
import {
  DeleteTrackSwagger,
  GetTrackSwagger,
  ListTrackProcessingAttemptsSwagger,
  ListTracksSwagger,
  ProbeTrackAudioSwagger,
  ReprocessTrackSwagger,
  RestoreTrackSwagger,
  StreamTrackAudioSwagger,
} from './decorators'
import {
  type ListAdminTracksQueryDto,
  ListAdminTracksQuerySchema,
  type ListProcessingAttemptsQueryDto,
  ListProcessingAttemptsQuerySchema,
} from './dtos'

/** No CDN sits in front of this route — it is a review surface, not a distribution path. */
const AUDIO_CACHE_CONTROL = 'private, no-store'

/** Operator-facing track processing pipeline. */
@ApiTags('Admin Tracks')
@AdminAuth()
@Controller({ path: 'admin/tracks', version: '1' })
export class AdminTracksController {
  constructor(
    private readonly tracks: AdminTracksService,
    private readonly trackAudio: AdminTrackAudioService,
  ) {}

  /** Runs the list tracks operation. */
  @RequirePermission('tracks:read')
  @ListTracksSwagger()
  @Get('')
  list(@Query(new ZodValidationPipe(ListAdminTracksQuerySchema)) query: ListAdminTracksQueryDto) {
    return this.tracks.findAll(query)
  }

  /** Runs the get track operation. */
  @RequirePermission('tracks:read')
  @GetTrackSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.tracks.findById(id)
  }

  /**
   * Runs the probe audio operation — headers only, no storage round-trip.
   * Declared before {@link streamAudio} so Express matches HEAD here rather than
   * falling through to the GET handler for the same path.
   */
  @RequirePermission('tracks:read')
  @ProbeTrackAudioSwagger()
  @Throttle({ default: { ttl: 60_000, limit: 1_200 } })
  @Head(':id/audio')
  async probeAudio(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('bitrate', new ParseIntPipe({ optional: true })) bitrate: number | undefined,
    @Res() res: Response,
  ) {
    const meta = await this.trackAudio.head(id, bitrate)
    res.set({
      'Content-Type': meta.contentType,
      'Accept-Ranges': 'bytes',
      'Content-Length': String(meta.fileSize),
      'Cache-Control': AUDIO_CACHE_CONTROL,
      'Content-Disposition': 'inline',
    })
    res.status(HttpStatus.OK).send()
  }

  /** Runs the stream audio operation. */
  @RequirePermission('tracks:read')
  @StreamTrackAudioSwagger()
  @Throttle({ default: { ttl: 60_000, limit: 1_200 } })
  @Get(':id/audio')
  async streamAudio(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('bitrate', new ParseIntPipe({ optional: true })) bitrate: number | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    let audio: Awaited<ReturnType<AdminTrackAudioService['stream']>>
    try {
      audio = await this.trackAudio.stream(id, bitrate, req.headers.range)
    } catch (error) {
      if (error instanceof UnsatisfiableRangeError) {
        res.set({ 'Accept-Ranges': 'bytes', 'Content-Range': `bytes */${error.fileSize}` })
        res.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE).send()
        return
      }
      throw error
    }

    res.status(audio.isPartial ? HttpStatus.PARTIAL_CONTENT : HttpStatus.OK)
    res.set({
      'Content-Type': audio.contentType,
      'Accept-Ranges': 'bytes',
      'Content-Length': String(audio.contentLength),
      'Cache-Control': AUDIO_CACHE_CONTROL,
      'Content-Disposition': 'inline',
      ...(audio.isPartial
        ? { 'Content-Range': `bytes ${audio.start}-${audio.end}/${audio.fileSize}` }
        : {}),
    })

    audio.stream.pipe(res)
  }

  /** Runs the list processing attempts operation. */
  @RequirePermission('tracks:read')
  @ListTrackProcessingAttemptsSwagger()
  @Get(':id/processing-attempts')
  listProcessingAttempts(
    @Param('id', ParseUUIDPipe) id: string,
    @Query(new ZodValidationPipe(ListProcessingAttemptsQuerySchema))
    query: ListProcessingAttemptsQueryDto,
  ) {
    return this.tracks.findProcessingAttempts(id, query)
  }

  /** Runs the reprocess operation. */
  @RequirePermission('tracks:reprocess')
  @ReprocessTrackSwagger()
  @HttpCode(HttpStatus.OK)
  @Post(':id/reprocess')
  reprocess(@Param('id', ParseUUIDPipe) id: string) {
    return this.tracks.reprocess(id)
  }

  /** Runs the soft-delete (take-down) operation. */
  @RequirePermission('tracks:delete')
  @DeleteTrackSwagger()
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(TakeDownReasonSchema.optional())) body: TakeDownReasonDto = {},
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.tracks.softDelete(id, staff.id, body.reason, auditContext)
  }

  /** Runs the restore operation. */
  @RequirePermission('tracks:restore')
  @RestoreTrackSwagger()
  @HttpCode(HttpStatus.OK)
  @Post(':id/restore')
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(TakeDownReasonSchema.optional())) body: TakeDownReasonDto = {},
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.tracks.restore(id, staff.id, body.reason, auditContext)
  }
}
