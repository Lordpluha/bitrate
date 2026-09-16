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
  Query,
  Req,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminStaffService } from './admin-staff.service'
import {
  AssignStaffRoleSwagger,
  CreateStaffSwagger,
  DeleteStaffSwagger,
  GetStaffSwagger,
  ListStaffSwagger,
  UpdateStaffPermissionsSwagger,
} from './decorators'
import {
  type AssignStaffRoleDto,
  AssignStaffRoleSchema,
  type CreateStaffDto,
  CreateStaffSchema,
  type ListAdminStaffQueryDto,
  ListAdminStaffQuerySchema,
  type UpdateStaffPermissionsDto,
  UpdateStaffPermissionsSchema,
} from './dtos'

/** Operator-facing staff directory: creation, role assignment, and permission grants. */
@ApiTags('Admin Staff')
@AdminAuth()
@Controller({ path: 'admin/staff', version: '1' })
export class AdminStaffController {
  constructor(private readonly staff: AdminStaffService) {}

  /** Runs the list staff operation. */
  @RequirePermission('staff:read')
  @ListStaffSwagger()
  @Get('')
  list(@Query(new ZodValidationPipe(ListAdminStaffQuerySchema)) query: ListAdminStaffQueryDto) {
    return this.staff.findAll(query)
  }

  /** Runs the get staff operation. */
  @RequirePermission('staff:read')
  @GetStaffSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.staff.findById(id)
  }

  /** Runs the create staff operation. */
  @RequirePermission('staff:write')
  @CreateStaffSwagger()
  @Post('')
  create(
    @Body(new ZodValidationPipe(CreateStaffSchema)) dto: CreateStaffDto,
    @Req() req: Request & { staff: { id: string } },
  ) {
    return this.staff.create(dto, req.staff.id)
  }

  /** Runs the assign role operation. */
  @RequirePermission('staff:write')
  @AssignStaffRoleSwagger()
  @Patch(':id/role')
  assignRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(AssignStaffRoleSchema)) dto: AssignStaffRoleDto,
    @Req() req: Request & { staff: { id: string } },
  ) {
    return this.staff.assignRole(id, dto, req.staff.id)
  }

  /** Runs the update permissions operation. */
  @RequirePermission('staff:write')
  @UpdateStaffPermissionsSwagger()
  @Patch(':id/permissions')
  updatePermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(UpdateStaffPermissionsSchema)) dto: UpdateStaffPermissionsDto,
    @Req() req: Request & { staff: { id: string } },
  ) {
    return this.staff.updatePermissions(id, dto, req.staff.id)
  }

  /** Runs the deactivate operation. */
  @RequirePermission('staff:write')
  @DeleteStaffSwagger()
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.staff.softDelete(id)
  }
}
