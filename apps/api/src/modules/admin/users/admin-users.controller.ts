import { AdminAuth, RequirePermission } from '@modules/admin-auth'
import { Controller, Delete, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminUsersService } from './admin-users.service'
import { DeleteUserSwagger, GetUserSwagger, ListUsersSwagger } from './decorators'
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
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.softDelete(id)
  }
}
