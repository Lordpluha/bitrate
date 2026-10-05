import { SkipAudit } from '@infra/observability/skip-audit.decorator'
import {
  AuditContext,
  type AuditContextValue,
  BatchIdsDto,
  BatchIdsSchema,
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
  Post,
  Query,
  Res,
  type StreamableFile,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminUsersService } from './admin-users.service'
import {
  DeactivateUsersBatchSwagger,
  DeleteUserSwagger,
  ExportUsersSwagger,
  GetUserSwagger,
  ListListeningHistorySwagger,
  ListUsersSwagger,
  RestoreUserSwagger,
  RevokeUserSessionsSwagger,
} from './decorators'
import {
  type ExportAdminUsersQueryDto,
  ExportAdminUsersQuerySchema,
  type ListAdminUsersQueryDto,
  ListAdminUsersQuerySchema,
  type ListListeningHistoryQueryDto,
  ListListeningHistoryQuerySchema,
} from './dtos'

/** Operator-facing user directory. */
@ApiTags('Admin Users')
@AdminAuth()
@Controller({ path: 'admin/users', version: '1' })
export class AdminUsersController {
  constructor(private readonly users: AdminUsersService) {}

  /** Runs the list users operation. */
  @RequirePermission('users:read')
  @ListUsersSwagger()
  @Get('')
  list(@Query(new ZodValidationPipe(ListAdminUsersQuerySchema)) query: ListAdminUsersQueryDto) {
    return this.users.findAll(query)
  }

  /** Runs the CSV export operation. */
  // Declared before `:id` so `export.csv` is not read as an id. The service writes the one audit
  // row, because GET is not interceptor-audited.
  @RequirePermission('users:export')
  @ExportUsersSwagger()
  @Get('export.csv')
  async exportCsv(
    @Query(new ZodValidationPipe(ExportAdminUsersQuerySchema)) query: ExportAdminUsersQueryDto,
    @CurrentStaff() staff: AuthenticatedStaff,
    @AuditContext() auditContext: AuditContextValue,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    return sendCsvExport(res, 'users', await this.users.exportCsv(query, staff.id, auditContext))
  }

  /** Runs the get user operation. */
  @RequirePermission('users:read')
  @GetUserSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.findById(id)
  }

  /** Runs the list listening history operation. */
  @RequirePermission('users:read')
  @ListListeningHistorySwagger()
  @Get(':id/listening-history')
  listListeningHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query(new ZodValidationPipe(ListListeningHistoryQuerySchema))
    query: ListListeningHistoryQueryDto,
  ) {
    return this.users.findListeningHistory(id, query)
  }

  /** Runs the soft-delete operation. */
  @RequirePermission('users:delete')
  @DeleteUserSwagger()
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(TakeDownReasonSchema.optional())) body: TakeDownReasonDto = {},
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.users.softDelete(id, staff.id, body.reason, auditContext)
  }

  /** Runs the batch deactivate operation. `@SkipAudit` because each take-down audits itself. */
  @RequirePermission('users:delete')
  @DeactivateUsersBatchSwagger()
  @SkipAudit()
  @HttpCode(HttpStatus.OK)
  @Post('batch/deactivate')
  deactivateMany(
    @Body(new ZodValidationPipe(BatchIdsSchema)) body: BatchIdsDto,
    @CurrentStaff() staff: AuthenticatedStaff,
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.users.softDeleteMany(body.ids, staff.id, auditContext)
  }

  /** Runs the restore operation. */
  @RequirePermission('users:restore')
  @RestoreUserSwagger()
  @HttpCode(HttpStatus.OK)
  @Post(':id/restore')
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(TakeDownReasonSchema.optional())) body: TakeDownReasonDto = {},
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.users.restore(id, staff.id, body.reason, auditContext)
  }

  /** Runs the revoke sessions operation. */
  @RequirePermission('users:revoke-sessions')
  @RevokeUserSessionsSwagger()
  @HttpCode(HttpStatus.OK)
  @Post(':id/sessions/revoke')
  revokeSessions(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(TakeDownReasonSchema.optional())) body: TakeDownReasonDto = {},
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.users.revokeSessions(id, staff.id, body.reason, auditContext)
  }
}
