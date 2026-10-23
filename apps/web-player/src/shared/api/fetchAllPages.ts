/** One page of a `{ data, limit, page, total }` list response. */
export type PaginatedPage<TItem> = {
  data: TItem[]
  limit: number
  total: number
}

type FetchAllPagesInput<TItem> = {
  /** Loads one 1-based page. */
  fetchPage: (page: number) => Promise<PaginatedPage<TItem>>
}

/** Loads page 1, then every remaining page in parallel, and returns all items in page order. */
export const fetchAllPages = async <TItem>({
  fetchPage,
}: FetchAllPagesInput<TItem>): Promise<TItem[]> => {
  const firstPage = await fetchPage(1)
  const pageCount = Math.ceil(firstPage.total / firstPage.limit)
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) =>
      fetchPage(index + 2),
    ),
  )

  return [firstPage, ...remainingPages].flatMap(({ data }) => data)
}
