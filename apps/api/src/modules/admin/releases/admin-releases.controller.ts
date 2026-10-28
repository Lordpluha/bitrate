import { pipeToResponse } from '@common/utils/stream'
import { AuditContext, type AuditContextValue } from '@modules/admin/shared'
import type { AuthenticatedStaff } from '@modules/admin-auth'
import { AdminAuth, CurrentStaff, RequirePermission } from '@modules/admin-auth'
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminReleasesService } from './admin-releases.service'
import {
  AdminReleaseAudioSwagger,
  ApproveReleaseSwagger,
  GetAdminReleaseSwagger,
  ListAdminReleasesSwagger,
  RequestReleaseChangesSwagger,
  RetryReleasePublishingSwagger,
  TakeDownReleaseSwagger,
} from './decorators'
import {
  type ApproveReleaseDto,
  ApproveReleaseSchema,
  type ListAdminReleasesQueryDto,
  ListAdminReleasesQuerySchema,
  type RequestReleaseChangesDto,
  RequestReleaseChangesSchema,
} from './dtos/release-review.dto'

const logger = new Logger('AdminReleasesController')

/** Operator-facing review of artist release submissions. */
@ApiTags('Admin Releases')
@AdminAuth()
@Controller({ path: 'admin/releases', version: '1' })
export class AdminReleasesController {
  constructor(private readonly releases: AdminReleasesService) {}

  @RequirePermission('releases:read')
  @ListAdminReleasesSwagger()
  @Get('')
  list(
    @Query(new ZodValidationPipe(ListAdminReleasesQuerySchema)) query: ListAdminReleasesQueryDto,
  ) {
    return this.releases.list(query)
  }

  @RequirePermission('releases:read')
  @GetAdminReleaseSwagger()
  @Get(':id')
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.releases.detail(id)
  }

  @RequirePermission('releases:read')
  @AdminReleaseAudioSwagger()
  @Get(':id/tracks/:trackId/audio')
  async audio(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('trackId', ParseUUIDPipe) trackId: string,
    @Headers('range') range: string | undefined,
    @Res() response: Response,
  ) {
    const audio = await this.releases.audioStream(id, trackId, range)
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

  @RequirePermission('releases:review')
  @ApproveReleaseSwagger()
  @HttpCode(HttpStatus.OK)
  @Post(':id/approve')
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(ApproveReleaseSchema)) body: ApproveReleaseDto,
    @AuditContext() audit: AuditContextValue = {},
  ) {
    return this.releases.approve(id, staff.id, body, audit)
  }

  @RequirePermission('releases:review')
  @RequestReleaseChangesSwagger()
  @HttpCode(HttpStatus.OK)
  @Post(':id/request-changes')
  requestChanges(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(RequestReleaseChangesSchema)) body: RequestReleaseChangesDto,
    @AuditContext() audit: AuditContextValue = {},
  ) {
    return this.releases.requestChanges(id, staff.id, body, audit)
  }

  @RequirePermission('releases:review')
  @RetryReleasePublishingSwagger()
  @HttpCode(HttpStatus.OK)
  @Post(':id/retry-publishing')
  retryPublishing(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @AuditContext() audit: AuditContextValue = {},
  ) {
    return this.releases.retryPublishing(id, staff.id, audit)
  }

  @RequirePermission('releases:review')
  @TakeDownReleaseSwagger()
  @HttpCode(HttpStatus.OK)
  @Post(':id/unpublish')
  takeDown(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @AuditContext() audit: AuditContextValue = {},
  ) {
    return this.releases.takeDown(id, staff.id, audit)
  }
}
