import { StreamableFile } from '@nestjs/common'
import type { Response } from 'express'
import { CSV_EXPORT_TRUNCATED_HEADER, type CsvExport, csvExportFilename } from './csv-export'

/**
 * Turns a prepared export into the HTTP response: a `text/csv; charset=utf-8` attachment named
 * `<resource>-<UTC timestamp>.csv`, with `X-Export-Truncated: true|false` always present so a
 * client never has to infer truncation from a missing header.
 */
export function sendCsvExport(
  res: Pick<Response, 'setHeader'>,
  resource: string,
  { stream, truncated }: CsvExport,
): StreamableFile {
  res.setHeader(CSV_EXPORT_TRUNCATED_HEADER, String(truncated))
  return new StreamableFile(stream, {
    type: 'text/csv; charset=utf-8',
    disposition: `attachment; filename="${csvExportFilename(resource)}"`,
  })
}
