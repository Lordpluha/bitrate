import type { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs'
import type { ZodType } from 'zod'
import type { Page } from '@domain/shared'

/** The envelope the API actually sends. `data`, not `items` — the domain's spelling differs. */
type WirePage<TItem> = {
  data: TItem[]
  total: number
  page: number
  limit: number
}

type FetchPageInput<TDto, TItem> = {
  http: HttpClient
  url: string
  page: number
  limit?: number
  /** Extra filters; `undefined` and `''` entries are dropped rather than sent as empty. */
  filters?: Record<string, string | number | boolean | undefined>
  schema: ZodType<WirePage<TDto>>
  toDomain: (dto: TDto) => TItem
}

/**
 * The single place a paginated operator request is built, validated and mapped into the domain.
 *
 * Centralised so a new screen cannot quietly invent a different pagination contract, skip the
 * `parse`, or hand a raw transport object to a component.
 */
export async function fetchPage<TDto, TItem>({
  http,
  url,
  page,
  limit,
  filters = {},
  schema,
  toDomain,
}: FetchPageInput<TDto, TItem>): Promise<Page<TItem>> {
  const params: Record<string, string> = { page: String(page) }
  if (limit !== undefined) params['limit'] = String(limit)

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === '') continue
    params[key] = String(value)
  }

  const response = await firstValueFrom(http.get<unknown>(url, { params }))
  const wire = schema.parse(response)

  return {
    items: wire.data.map(toDomain),
    total: wire.total,
    page: wire.page,
    limit: wire.limit,
  }
}
