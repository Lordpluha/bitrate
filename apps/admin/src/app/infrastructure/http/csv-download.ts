import type { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs'
import type { CsvDownload } from '@domain/shared'
import { buildFilterParams, type WireFilters } from './wire-page'

type FetchCsvInput = {
  http: HttpClient
  url: string
  filters: WireFilters
  /** Used when the browser cannot read `Content-Disposition`, e.g. `users.csv`. */
  fallbackFilename: string
}

/** The `filename="…"` the API puts on the attachment, or `undefined` when it is not readable. */
function filenameFrom(contentDisposition: string | null): string | undefined {
  return /filename="([^"]+)"/.exec(contentDisposition ?? '')?.[1]
}

/**
 * The single place an operator CSV is requested. The server streams it for the same filters and
 * sort the list uses; cookies authenticate it (the auth interceptor adds `withCredentials`), so no
 * token is ever read here. The body stays a `Blob` — nothing is parsed or held as text.
 */
export async function fetchCsv({
  http,
  url,
  filters,
  fallbackFilename,
}: FetchCsvInput): Promise<CsvDownload> {
  const response = await firstValueFrom(
    http.get(url, {
      params: buildFilterParams(filters),
      observe: 'response',
      responseType: 'blob',
    }),
  )
  if (!response.body) throw new Error('The CSV export came back empty.')

  return {
    blob: response.body,
    filename: filenameFrom(response.headers.get('Content-Disposition')) ?? fallbackFilename,
    truncated: response.headers.get('X-Export-Truncated') === 'true',
  }
}
