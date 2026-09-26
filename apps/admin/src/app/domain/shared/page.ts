/**
 * The pagination envelope every operator list speaks once it is out of transport.
 *
 * `items`, not the wire's `data`: the mapper is the only place that has to know the API's
 * spelling, so a contract that renames the field costs one file instead of five screens.
 */
export type Page<TItem> = {
  items: TItem[]
  total: number
  page: number
  limit: number
}

/** How much of a list a caller is asking for. */
export type PageRequest = {
  page: number
  limit?: number
}

/** Rows per page every operator list asks for unless it says otherwise. */
export const DEFAULT_PAGE_SIZE = 20

type CountPagesInput = {
  total: number
  limit: number
}

/**
 * At least one page, so an empty list still reads as "page 1 of 1" rather than "of 0".
 * @returns The number of pages the total spans.
 */
export function countPages({ total, limit }: CountPagesInput): number {
  if (limit <= 0) return 1

  return Math.max(1, Math.ceil(total / limit))
}

/** The shape a list starts in, and falls back to when a load fails. */
export function emptyPage<TItem>(limit: number = DEFAULT_PAGE_SIZE): Page<TItem> {
  return { items: [], total: 0, page: 1, limit }
}
