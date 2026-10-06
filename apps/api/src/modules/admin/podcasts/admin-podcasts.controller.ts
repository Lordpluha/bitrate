import {
  AuditContext,
  type AuditContextValue,
  TakeDownReasonDto,
  TakeDownReasonSchema,
} from '@modules/admin/shared'
import type { AuthenticatedStaff } from '@modules/admin-auth'
import { AdminAuth, CurrentStaff, RequirePermission } from '@modules/admin-auth'
import {
  Body,
  Controller,
  Delete,
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
import { AdminPodcastsService } from './admin-podcasts.service'
import {
  DeletePodcastEpisodeSwagger,
  DeletePodcastSwagger,
  GetPodcastSwagger,
  ListPodcastsSwagger,
  RestorePodcastEpisodeSwagger,
  RestorePodcastSwagger,
} from './decorators'
import { type ListAdminPodcastsQueryDto, ListAdminPodcastsQuerySchema } from './dtos'

/** Operator-facing podcast catalog with podcast- and episode-level take-down. */
@ApiTags('Admin Podcasts')
@AdminAuth()
@Controller({ path: 'admin/podcasts', version: '1' })
export class AdminPodcastsController {
  constructor(private readonly podcasts: AdminPodcastsService) {}

  /** Runs the list podcasts operation. */
  @RequirePermission('podcasts:read')
  @ListPodcastsSwagger()
  @Get('')
  list(
    @Query(new ZodValidationPipe(ListAdminPodcastsQuerySchema)) query: ListAdminPodcastsQueryDto,
  ) {
    return this.podcasts.findAll(query)
  }

  /** Runs the get podcast operation. */
  @RequirePermission('podcasts:read')
  @GetPodcastSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.podcasts.findById(id)
  }

  /** Runs the soft-delete (take-down) operation. */
  @RequirePermission('podcasts:delete')
  @DeletePodcastSwagger()
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(TakeDownReasonSchema.optional())) body: TakeDownReasonDto = {},
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.podcasts.softDelete(id, staff.id, body.reason, auditContext)
  }

  /** Runs the restore operation. */
  @RequirePermission('podcasts:restore')
  @RestorePodcastSwagger()
  @HttpCode(HttpStatus.OK)
  @Post(':id/restore')
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(TakeDownReasonSchema.optional())) body: TakeDownReasonDto = {},
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.podcasts.restore(id, staff.id, body.reason, auditContext)
  }

  /** Runs the episode soft-delete (take-down) operation. */
  @RequirePermission('podcasts:delete')
  @DeletePodcastEpisodeSwagger()
  @Delete(':id/episodes/:episodeId')
  removeEpisode(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(TakeDownReasonSchema.optional())) body: TakeDownReasonDto = {},
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.podcasts.softDeleteEpisode(id, episodeId, staff.id, body.reason, auditContext)
  }

  /** Runs the episode restore operation. */
  @RequirePermission('podcasts:restore')
  @RestorePodcastEpisodeSwagger()
  @HttpCode(HttpStatus.OK)
  @Post(':id/episodes/:episodeId/restore')
  restoreEpisode(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('episodeId', ParseUUIDPipe) episodeId: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(TakeDownReasonSchema.optional())) body: TakeDownReasonDto = {},
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.podcasts.restoreEpisode(id, episodeId, staff.id, body.reason, auditContext)
  }
}
