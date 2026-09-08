import { AdminAuth } from '@modules/admin-auth'
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminTracksService } from './admin-tracks.service'
import { GetTrackSwagger, ListTracksSwagger, ReprocessTrackSwagger } from './decorators'
import { type ListAdminTracksQueryDto, ListAdminTracksQuerySchema } from './dtos'

/** Operator-facing track processing pipeline. */
@ApiTags('Admin Tracks')
@Controller({ path: 'admin/tracks', version: '1' })
export class AdminTracksController {
  constructor(private readonly tracks: AdminTracksService) {}

  /** Runs the list tracks operation. Available to any staff role. */
  @AdminAuth('ADMIN', 'MODERATOR')
  @ListTracksSwagger()
  @Get('')
  list(@Query(new ZodValidationPipe(ListAdminTracksQuerySchema)) query: ListAdminTracksQueryDto) {
    return this.tracks.findAll(query)
  }

  /** Runs the get track operation. Available to any staff role. */
  @AdminAuth('ADMIN', 'MODERATOR')
  @GetTrackSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.tracks.findById(id)
  }

  /** Runs the reprocess operation. Requires the ADMIN role. */
  @AdminAuth('ADMIN')
  @ReprocessTrackSwagger()
  @HttpCode(HttpStatus.OK)
  @Post(':id/reprocess')
  reprocess(@Param('id', ParseUUIDPipe) id: string) {
    return this.tracks.reprocess(id)
  }
}
