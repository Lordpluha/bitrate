import { AdminAuth } from '@modules/admin-auth'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ZodValidationPipe } from 'nestjs-zod'
import { AdminAuditService } from './admin-audit.service'
import { ListAuditLogsSwagger } from './decorators'
import { type ListAdminAuditLogsQueryDto, ListAdminAuditLogsQuerySchema } from './dtos'

/** Operator-facing audit log — read-only, available to any staff role. */
@ApiTags('Admin Audit')
@AdminAuth('ADMIN', 'MODERATOR')
@Controller({ path: 'admin/audit', version: '1' })
export class AdminAuditController {
  constructor(private readonly audit: AdminAuditService) {}

  /** Runs the list audit logs operation. */
  @ListAuditLogsSwagger()
  @Get('')
  list(
    @Query(new ZodValidationPipe(ListAdminAuditLogsQuerySchema)) query: ListAdminAuditLogsQueryDto,
  ) {
    return this.audit.findAll(query)
  }
}
