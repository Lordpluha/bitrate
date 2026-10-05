import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiProduces, ApiResponse } from '@nestjs/swagger'
import { CSV_EXPORT_MAX_ROWS, CSV_EXPORT_TRUNCATED_HEADER } from '../csv-export'

/**
 * The response half every CSV export route documents the same way: `text/csv`, the column
 * order, the format rules and the truncation header. Routes add their own summary and query
 * params next to it.
 */
export function CsvExportResponseSwagger(columns: readonly string[]) {
  return applyDecorators(
    ApiProduces('text/csv'),
    ApiResponse({
      status: HttpStatus.OK,
      description: [
        `A CSV attachment (UTF-8 with a byte order mark, CRLF line endings, RFC 4180 quoting) of every row matching the same filters and sort as the list, capped at ${CSV_EXPORT_MAX_ROWS} rows.`,
        `Columns, in order: ${columns.join(', ')}.`,
        'Dates are ISO 8601 UTC, booleans are true/false, null is an empty cell, and a text cell starting with = + - @ tab or CR is prefixed with a single quote.',
        `${CSV_EXPORT_TRUNCATED_HEADER} is true when more rows matched than the cap.`,
      ].join(' '),
      headers: {
        [CSV_EXPORT_TRUNCATED_HEADER]: {
          description: `true when the export stopped at ${CSV_EXPORT_MAX_ROWS} rows, otherwise false`,
          schema: { type: 'string', enum: ['true', 'false'] },
        },
        'Content-Disposition': {
          description: 'attachment; filename="<resource>-<UTC timestamp>.csv"',
          schema: { type: 'string' },
        },
      },
      content: { 'text/csv': { schema: { type: 'string', format: 'binary' } } },
    }),
  )
}
