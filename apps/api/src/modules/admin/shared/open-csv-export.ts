import { CSV_EXPORT_MAX_ROWS, type CsvExport, createCsvExportStream } from './csv-export'
import { writeExportAudit } from './write-export-audit'

type OpenCsvExportInput<Row> = Omit<
  Parameters<typeof writeExportAudit>[0],
  'rowCount' | 'truncated'
> & {
  columns: readonly (keyof Row & string)[]
  /** How many rows match the filters, read before streaming starts. */
  total: number
  fetchPage: (skip: number, take: number) => Promise<readonly Row[]>
}

/**
 * Shared tail of every `exportCsv` service method: caps the match count, writes the one audit
 * row, then hands back the lazy stream. The audit row is written before the first byte so an
 * export that is aborted half-way is still on record.
 */
export async function openCsvExport<Row>({
  columns,
  total,
  fetchPage,
  ...audit
}: OpenCsvExportInput<Row>): Promise<CsvExport> {
  const rowCount = Math.min(total, CSV_EXPORT_MAX_ROWS)
  const truncated = total > CSV_EXPORT_MAX_ROWS
  await writeExportAudit({ ...audit, rowCount, truncated })
  return {
    stream: createCsvExportStream({ columns, limit: rowCount, fetchPage }),
    truncated,
    rowCount,
  }
}
