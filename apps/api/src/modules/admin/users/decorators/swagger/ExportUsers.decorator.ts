import { ADMIN_RESOURCE_STATUSES, CsvExportResponseSwagger } from '@modules/admin/shared'
import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiQuery } from '@nestjs/swagger'
import { ADMIN_USERS_SORT_FIELDS } from '../../dtos'
import { ADMIN_USER_EXPORT_COLUMNS } from '../../user.select'

/** Runs the export users swagger operation. */
export function ExportUsersSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Export users as CSV',
      description:
        'Streams the users matching the list filters and sort as CSV. Administrator-only by default (users:export): the file contains email addresses. Writes one audit row (admin-users.export).',
    }),
    ApiQuery({ name: 'status', required: false, enum: ADMIN_RESOURCE_STATUSES }),
    ApiQuery({ name: 'q', required: false, type: String, description: 'Search username/email' }),
    ApiQuery({ name: 'sort', required: false, enum: ADMIN_USERS_SORT_FIELDS }),
    ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] }),
    CsvExportResponseSwagger(ADMIN_USER_EXPORT_COLUMNS),
  )
}
