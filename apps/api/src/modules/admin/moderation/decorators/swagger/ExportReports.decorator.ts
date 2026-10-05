import { CsvExportResponseSwagger } from '@modules/admin/shared'
import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiQuery } from '@nestjs/swagger'
import { ADMIN_REPORTS_SORT_FIELDS, MODERATION_ENTITY_TYPES, MODERATION_STATUSES } from '../../dtos'
import { ADMIN_REPORT_EXPORT_COLUMNS } from '../../report-export.columns'

/** Runs the export moderation reports swagger operation. */
export function ExportReportsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Export moderation reports as CSV',
      description:
        'Streams the reports matching the queue filters and sort as CSV. Administrator-only by default (reports:export). Writes one audit row (admin-moderation.export).',
    }),
    ApiQuery({ name: 'status', required: false, enum: MODERATION_STATUSES }),
    ApiQuery({ name: 'entityType', required: false, enum: MODERATION_ENTITY_TYPES }),
    ApiQuery({ name: 'sort', required: false, enum: ADMIN_REPORTS_SORT_FIELDS }),
    ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] }),
    CsvExportResponseSwagger(ADMIN_REPORT_EXPORT_COLUMNS),
  )
}
