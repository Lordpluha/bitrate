import {
  AuditContext,
  type AuditContextValue,
  sendCsvExport,
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
  Res,
  type StreamableFile,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminArtistsService } from './admin-artists.service'
import {
  DeleteArtistSwagger,
  ExportArtistsSwagger,
  GetArtistSwagger,
  ListArtistAlbumsSwagger,
  ListArtistsSwagger,
  ListArtistTracksSwagger,
  RestoreArtistSwagger,
  RevokeArtistSessionsSwagger,
  UpdateArtistVerificationSwagger,
} from './decorators'
import {
  type ExportAdminArtistsQueryDto,
  ExportAdminArtistsQuerySchema,
  type ListAdminArtistsQueryDto,
  ListAdminArtistsQuerySchema,
  type ListArtistAlbumsQueryDto,
  ListArtistAlbumsQuerySchema,
  type ListArtistTracksQueryDto,
  ListArtistTracksQuerySchema,
  type UpdateArtistVerificationDto,
  UpdateArtistVerificationSchema,
} from './dtos'

/** Operator-facing artist directory. */
@ApiTags('Admin Artists')
@AdminAuth()
@Controller({ path: 'admin/artists', version: '1' })
export class AdminArtistsController {
  constructor(private readonly artists: AdminArtistsService) {}

  /** Runs the list artists operation. */
  @RequirePermission('artists:read')
  @ListArtistsSwagger()
  @Get('')
  list(@Query(new ZodValidationPipe(ListAdminArtistsQuerySchema)) query: ListAdminArtistsQueryDto) {
    return this.artists.findAll(query)
  }

  /** Runs the CSV export operation. */
  // Declared before `:id` so `export.csv` is not read as an id. The service writes the one audit
  // row, because GET is not interceptor-audited.
  @RequirePermission('artists:export')
  @ExportArtistsSwagger()
  @Get('export.csv')
  async exportCsv(
    @Query(new ZodValidationPipe(ExportAdminArtistsQuerySchema)) query: ExportAdminArtistsQueryDto,
    @CurrentStaff() staff: AuthenticatedStaff,
    @AuditContext() auditContext: AuditContextValue,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    return sendCsvExport(
      res,
      'artists',
      await this.artists.exportCsv(query, staff.id, auditContext),
    )
  }

  /** Runs the get artist operation. */
  @RequirePermission('artists:read')
  @GetArtistSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.artists.findById(id)
  }

  /**
   * Runs the list artist tracks operation. Permission is `artists:read` — this is a sub-view of
   * the artist detail page (the same permission that already backs its `counts.tracks`), not
   * the global track-management surface behind `tracks:read`.
   */
  @RequirePermission('artists:read')
  @ListArtistTracksSwagger()
  @Get(':id/tracks')
  listTracks(
    @Param('id', ParseUUIDPipe) id: string,
    @Query(new ZodValidationPipe(ListArtistTracksQuerySchema)) query: ListArtistTracksQueryDto,
  ) {
    return this.artists.findTracks(id, query)
  }

  /** Runs the list artist albums operation. Permission is `artists:read`, for the same reason
   * as {@link listTracks}. */
  @RequirePermission('artists:read')
  @ListArtistAlbumsSwagger()
  @Get(':id/albums')
  listAlbums(
    @Param('id', ParseUUIDPipe) id: string,
    @Query(new ZodValidationPipe(ListArtistAlbumsQuerySchema)) query: ListArtistAlbumsQueryDto,
  ) {
    return this.artists.findAlbums(id, query)
  }

  /** Runs the update verification operation. */
  @RequirePermission('artists:verify')
  @UpdateArtistVerificationSwagger()
  @Patch(':id/verification')
  updateVerification(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateArtistVerificationSchema)) dto: UpdateArtistVerificationDto,
  ) {
    return this.artists.updateVerification(id, dto)
  }

  /** Runs the soft-delete operation. */
  @RequirePermission('artists:delete')
  @DeleteArtistSwagger()
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(TakeDownReasonSchema.optional())) body: TakeDownReasonDto = {},
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.artists.softDelete(id, staff.id, body.reason, auditContext)
  }

  /** Runs the restore operation. */
  @RequirePermission('artists:restore')
  @RestoreArtistSwagger()
  @HttpCode(HttpStatus.OK)
  @Post(':id/restore')
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(TakeDownReasonSchema.optional())) body: TakeDownReasonDto = {},
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.artists.restore(id, staff.id, body.reason, auditContext)
  }

  /** Runs the revoke sessions operation. */
  @RequirePermission('artists:revoke-sessions')
  @RevokeArtistSessionsSwagger()
  @HttpCode(HttpStatus.OK)
  @Post(':id/sessions/revoke')
  revokeSessions(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(TakeDownReasonSchema.optional())) body: TakeDownReasonDto = {},
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.artists.revokeSessions(id, staff.id, body.reason, auditContext)
  }
}
