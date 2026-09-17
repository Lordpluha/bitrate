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
import { AdminUsersService } from './admin-users.service'
import {
  DeleteUserSwagger,
  GetUserSwagger,
  ListUsersSwagger,
  RestoreUserSwagger,
  RevokeUserSessionsSwagger,
} from './decorators'
import { type ListAdminUsersQueryDto, ListAdminUsersQuerySchema } from './dtos'

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

  /** Runs the get user operation. */
  @RequirePermission('users:read')
  @GetUserSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.findById(id)
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
