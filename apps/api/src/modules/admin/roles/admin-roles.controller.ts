import { AdminAuth, RequirePermission } from '@modules/admin-auth'
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminRolesService } from './admin-roles.service'
import {
  CreateRoleSwagger,
  DeleteRoleSwagger,
  GetRoleSwagger,
  ListRolePermissionsSwagger,
  ListRolesSwagger,
  UpdateRoleSwagger,
} from './decorators'
import { type CreateRoleDto, CreateRoleSchema, type UpdateRoleDto, UpdateRoleSchema } from './dtos'

/** Operator-facing role templates and the permission catalogue. */
@ApiTags('Admin Roles')
@AdminAuth()
@Controller({ path: 'admin/roles', version: '1' })
export class AdminRolesController {
  constructor(private readonly roles: AdminRolesService) {}

  /** Runs the list roles operation. */
  @RequirePermission('roles:read')
  @ListRolesSwagger()
  @Get('')
  list() {
    return this.roles.findAll()
  }

  /**
   * Runs the list permissions operation. Declared before `:id` so `permissions` is never
   * swallowed by the dynamic route.
   */
  @RequirePermission('roles:read')
  @ListRolePermissionsSwagger()
  @Get('permissions')
  permissions() {
    return this.roles.permissionsCatalogue()
  }

  /** Runs the get role operation. */
  @RequirePermission('roles:read')
  @GetRoleSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.roles.findById(id)
  }

  /** Runs the create role operation. */
  @RequirePermission('roles:write')
  @CreateRoleSwagger()
  @Post('')
  create(@Body(new ZodValidationPipe(CreateRoleSchema)) dto: CreateRoleDto) {
    return this.roles.create(dto)
  }

  /** Runs the update role operation. */
  @RequirePermission('roles:write')
  @UpdateRoleSwagger()
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateRoleSchema)) dto: UpdateRoleDto,
    @Req() req: Request & { staff: { id: string } },
  ) {
    return this.roles.update(id, dto, req.staff.id)
  }

  /** Runs the delete role operation. */
  @RequirePermission('roles:write')
  @DeleteRoleSwagger()
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.roles.remove(id)
  }
}
