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
import { AdminAlbumsService } from './admin-albums.service'
import {
  DeleteAlbumSwagger,
  GetAlbumSwagger,
  ListAlbumsSwagger,
  RestoreAlbumSwagger,
} from './decorators'
import { type ListAdminAlbumsQueryDto, ListAdminAlbumsQuerySchema } from './dtos'

/** Operator-facing album catalog. */
@ApiTags('Admin Albums')
@AdminAuth()
@Controller({ path: 'admin/albums', version: '1' })
export class AdminAlbumsController {
  constructor(private readonly albums: AdminAlbumsService) {}

  /** Runs the list albums operation. */
  @RequirePermission('albums:read')
  @ListAlbumsSwagger()
  @Get('')
  list(@Query(new ZodValidationPipe(ListAdminAlbumsQuerySchema)) query: ListAdminAlbumsQueryDto) {
    return this.albums.findAll(query)
  }

  /** Runs the get album operation. */
  @RequirePermission('albums:read')
  @GetAlbumSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.albums.findById(id)
  }

  /** Runs the soft-delete (take-down) operation. */
  @RequirePermission('albums:delete')
  @DeleteAlbumSwagger()
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(TakeDownReasonSchema.optional())) body: TakeDownReasonDto = {},
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.albums.softDelete(id, staff.id, body.reason, auditContext)
  }

  /** Runs the restore operation. */
  @RequirePermission('albums:restore')
  @RestoreAlbumSwagger()
  @HttpCode(HttpStatus.OK)
  @Post(':id/restore')
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentStaff() staff: AuthenticatedStaff,
    @Body(new ZodValidationPipe(TakeDownReasonSchema.optional())) body: TakeDownReasonDto = {},
    @AuditContext() auditContext: AuditContextValue = {},
  ) {
    return this.albums.restore(id, staff.id, body.reason, auditContext)
  }
}
