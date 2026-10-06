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
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminPlaylistsService } from './admin-playlists.service'
import {
  DeletePlaylistSwagger,
  GetPlaylistSwagger,
  ListPlaylistsSwagger,
  RestorePlaylistSwagger,
  SetPlaylistVisibilitySwagger,
} from './decorators'
import {
  type ListAdminPlaylistsQueryDto,
  ListAdminPlaylistsQuerySchema,
  type SetPlaylistVisibilityDto,
  SetPlaylistVisibilitySchema,
} from './dtos'

/** Operator-facing public-playlist moderation. */
@ApiTags('Admin Playlists')
@AdminAuth()
@Controller({ path: 'admin/playlists', version: '1' })
export class AdminPlaylistsController {
  constructor(private readonly playlists: AdminPlaylistsService) {}

  /** Runs the list playlists operation. */
  @RequirePermission('playlists:read')
  @ListPlaylistsSwagger()
  @Get('')
  list(
    @Query(new ZodValidationPipe(ListAdminPlaylistsQuerySchema)) query: ListAdminPlaylistsQueryDto,
  ) {
    return this.playlists.findAll(query)
  }

  /** Runs the get playlist operation. */
  @RequirePermission('playlists:read')
  @GetPlaylistSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.playlists.findById(id)
  }

  /** Runs the hide / un-hide operation. */
  @RequirePermission('playlists:hide')
  @SetPlaylistVisibilitySwagger()
  @Patch(':id/visibility')
  setVisibility(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(SetPlaylistVisibilitySchema)) body: SetPlaylistVisibilityDto,
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.playlists.setVisibility(id, body.isPublic, staff.id, body.reason, auditContext)
  }

  /** Runs the soft-delete (take-down) operation. */
  @RequirePermission('playlists:delete')
  @DeletePlaylistSwagger()
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(TakeDownReasonSchema.optional())) body: TakeDownReasonDto = {},
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.playlists.softDelete(id, staff.id, body.reason, auditContext)
  }

  /** Runs the restore operation. */
  @RequirePermission('playlists:restore')
  @RestorePlaylistSwagger()
  @HttpCode(HttpStatus.OK)
  @Post(':id/restore')
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(TakeDownReasonSchema.optional())) body: TakeDownReasonDto = {},
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.playlists.restore(id, staff.id, body.reason, auditContext)
  }
}
