import { Readable } from 'node:stream'

/** Most rows one export ever contains; a larger result is truncated and flagged by header. */
export const CSV_EXPORT_MAX_ROWS = 50_000

/** Rows fetched per database round trip while streaming, so memory stays flat. */
export const CSV_EXPORT_BATCH_SIZE = 1000

/** Name of the response header that is `true` when the export stopped at the row cap. */
export const CSV_EXPORT_TRUNCATED_HEADER = 'X-Export-Truncated'

/** UTF-8 byte order mark written first so Excel opens the file as UTF-8, not the ANSI codepage. */
export const CSV_BOM = '﻿'

/** A value a CSV cell can hold. */
export type CsvValue = string | number | boolean | Date | null | undefined

/** First characters a spreadsheet would read as a formula (OWASP CSV injection list). */
const FORMULA_LEADS = new Set(['=', '+', '-', '@', '\t', '\r'])

/**
 * Serialises one cell: `null`/`undefined` become empty, booleans `true`/`false`, dates ISO 8601
 * UTC. A string starting with a formula character is prefixed with `'` before RFC 4180 quoting
 * (quote when it holds a comma, quote, CR or LF; double inner quotes). Numbers are never
 * prefixed — they are not user-typed text.
 */
export function serializeCsvCell(value: CsvValue): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'boolean' || typeof value === 'number') return String(value)

  const guarded = value !== '' && FORMULA_LEADS.has(value[0] ?? '') ? `'${value}` : value
  return /[",\r\n]/.test(guarded) ? `"${guarded.replaceAll('"', '""')}"` : guarded
}

/** Serialises one record, terminated by CRLF as RFC 4180 specifies. */
export function serializeCsvRow(cells: readonly CsvValue[]): string {
  return `${cells.map(serializeCsvCell).join(',')}\r\n`
}

/** `<resource>-<UTC timestamp>.csv`, e.g. `users-20260301T102030Z.csv`. */
export function csvExportFilename(resource: string, now: Date = new Date()): string {
  const stamp = now
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z')
    .replace(/[-:]/g, '')
  return `${resource}-${stamp}.csv`
}

/** A prepared export: the byte stream plus what the controller needs for headers. */
export type CsvExport = {
  stream: Readable
  /** True when more rows matched than {@link CSV_EXPORT_MAX_ROWS}. */
  truncated: boolean
  /** Rows the stream will contain (matches, capped). */
  rowCount: number
}

/** Input for {@link createCsvExportStream}. */
type CsvExportStreamInput<Row> = {
  columns: readonly (keyof Row & string)[]
  /** Hard ceiling on rows written. */
  limit: number
  batchSize?: number
  /** Fetches `take` rows after skipping `skip`, in the list route's order. */
  fetchPage: (skip: number, take: number) => Promise<readonly Row[]>
}

/**
 * Streams a CSV: BOM, header, then rows pulled one batch at a time until `limit` or an empty page.
 * Never holds more than one batch in memory.
 */
export function createCsvExportStream<Row>({
  columns,
  limit,
  batchSize = CSV_EXPORT_BATCH_SIZE,
  fetchPage,
}: CsvExportStreamInput<Row>): Readable {
  async function* generate() {
    yield `${CSV_BOM}${serializeCsvRow(columns)}`
    let written = 0
    while (written < limit) {
      const rows = await fetchPage(written, Math.min(batchSize, limit - written))
      if (rows.length === 0) return
      yield rows
        .map((row) => serializeCsvRow(columns.map((column) => row[column] as CsvValue)))
        .join('')
      written += rows.length
    }
  }
  return Readable.from(generate(), { objectMode: false })
}
