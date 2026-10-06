/** The most rows one CSV export holds — the API stops there and flags the file as truncated. */
export const CSV_EXPORT_MAX_ROWS = 50_000

/** A CSV the API generated for the operator's current filters, ready to be saved. */
export type CsvDownload = {
  blob: Blob
  filename: string
  /** True when more rows matched than {@link CSV_EXPORT_MAX_ROWS}, so the file is a prefix. */
  truncated: boolean
}
