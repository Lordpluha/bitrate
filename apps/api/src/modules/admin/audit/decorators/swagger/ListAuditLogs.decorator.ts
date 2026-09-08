import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, getSchemaPath } from '@nestjs/swagger'
import { PaginatedAdminAuditLogsEntity } from '../../entities'

/** Runs the list audit logs swagger operation. */
export function ListAuditLogsSwagger() {
  return applyDecorators(
    ApiExtraModels(PaginatedAdminAuditLogsEntity),
    ApiOperation({ summary: 'List audit log entries, newest first' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiQuery({ name: 'entityType', required: false, type: String }),
    ApiQuery({ name: 'staffId', required: false, type: String, format: 'uuid' }),
    ApiQuery({ name: 'from', required: false, type: String, format: 'date-time' }),
    ApiQuery({ name: 'to', required: false, type: String, format: 'date-time' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'A page of audit log entries',
      schema: { $ref: getSchemaPath(PaginatedAdminAuditLogsEntity) },
    }),
  )
}
