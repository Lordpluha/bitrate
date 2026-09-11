import { AdminAuth, StaffRoles } from '@modules/admin-auth'
import { Controller, Delete, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminUsersService } from './admin-users.service'
import { DeleteUserSwagger, GetUserSwagger, ListUsersSwagger } from './decorators'
import { type ListAdminUsersQueryDto, ListAdminUsersQuerySchema } from './dtos'

/** Operator-facing user directory. */
@ApiTags('Admin Users')
@AdminAuth('ADMIN', 'MODERATOR')
@Controller({ path: 'admin/users', version: '1' })
export class AdminUsersController {
  constructor(private readonly users: AdminUsersService) {}

  /** Runs the list users operation. Available to any staff role. */
  @ListUsersSwagger()
  @Get('')
  list(@Query(new ZodValidationPipe(ListAdminUsersQuerySchema)) query: ListAdminUsersQueryDto) {
    return this.users.findAll(query)
  }

  /** Runs the get user operation. Available to any staff role. */
  @GetUserSwagger()
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.findById(id)
  }

  /** Runs the soft-delete operation. Requires the ADMIN role. */
  @StaffRoles('ADMIN')
  @DeleteUserSwagger()
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.softDelete(id)
  }
}
