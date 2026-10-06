import { ADMIN_RESOURCE_STATUSES, CsvExportResponseSwagger } from '@modules/admin/shared'
import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiQuery } from '@nestjs/swagger'
import { ADMIN_TRACKS_SORT_FIELDS, TRACK_PROCESSING_STATUSES } from '../../dtos'
import { ADMIN_TRACK_EXPORT_COLUMNS } from '../../track-export.columns'

/** Runs the export tracks (catalog) swagger operation. */
export function ExportTracksSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Export tracks as CSV',
      description:
        'Streams the tracks matching the list filters and ordering as CSV, in the list order (problem-first unless `sort` is given). Administrator-only by default (tracks:export). Writes one audit row (admin-tracks.export).',
    }),
    ApiQuery({ name: 'processingStatus', required: false, enum: TRACK_PROCESSING_STATUSES }),
    ApiQuery({ name: 'status', required: false, enum: ADMIN_RESOURCE_STATUSES }),
    ApiQuery({ name: 'q', required: false, type: String, description: 'Search by title' }),
    ApiQuery({ name: 'sort', required: false, enum: ADMIN_TRACKS_SORT_FIELDS }),
    ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] }),
    CsvExportResponseSwagger(ADMIN_TRACK_EXPORT_COLUMNS),
  )
}
