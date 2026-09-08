import type { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs'
import type { ZodType } from 'zod'
import { API_BASE_URL } from './api.config'

export const ADMIN_API = `${API_BASE_URL}/api/v1/admin`

type ListInput = {
  http: HttpClient
  url: string
  page: number
  limit?: number
  /** Extra filters; `undefined` and `''` entries are dropped rather than sent as empty. */
  filters?: Record<string, string | number | boolean | undefined>
  schema: ZodType
}

/**
 * One place where a list request is built and its response validated, so a new operator screen
 * cannot quietly invent a different pagination contract or skip the `parse`.
 */
export async function fetchPage<T>({
  http,
  url,
  page,
  limit = 20,
  filters = {},
  schema,
}: ListInput): Promise<T> {
  const params: Record<string, string> = { page: String(page), limit: String(limit) }

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === '') continue
    params[key] = String(value)
  }

  const response = await firstValueFrom(http.get<unknown>(url, { params }))

  return schema.parse(response) as T
}
