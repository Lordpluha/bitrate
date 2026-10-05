import { ADMIN_RESOURCE_STATUSES, CsvExportResponseSwagger } from '@modules/admin/shared'
import { applyDecorators } from '@nestjs/common'
import { ApiOperation, ApiQuery } from '@nestjs/swagger'
import { ADMIN_ARTIST_EXPORT_COLUMNS } from '../../artist.select'
import { ADMIN_ARTISTS_SORT_FIELDS } from '../../dtos'

/** Runs the export artists swagger operation. */
export function ExportArtistsSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Export artists as CSV',
      description:
        'Streams the artists matching the list filters and sort as CSV. Administrator-only by default (artists:export): the file contains email addresses. Writes one audit row (admin-artists.export).',
    }),
    ApiQuery({ name: 'verified', required: false, type: Boolean }),
    ApiQuery({ name: 'status', required: false, enum: ADMIN_RESOURCE_STATUSES }),
    ApiQuery({ name: 'q', required: false, type: String, description: 'Search username/email' }),
    ApiQuery({ name: 'sort', required: false, enum: ADMIN_ARTISTS_SORT_FIELDS }),
    ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] }),
    CsvExportResponseSwagger(ADMIN_ARTIST_EXPORT_COLUMNS),
  )
}
