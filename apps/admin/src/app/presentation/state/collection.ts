import { computed, signal, type Signal } from '@angular/core'
import { countPages, DEFAULT_PAGE_SIZE, type Page } from '@domain/shared'

type CreateCollectionInput<TItem> = {
  /** Fetches one page. Close over the screen's own filter signals here. */
  load: (page: number) => Promise<Page<TItem>>
  /** Shown when `load` rejects. Say what could not be loaded, not "an error occurred". */
  errorMessage: string
}

export type Collection<TItem> = {
  items: Signal<TItem[]>
  total: Signal<number>
  page: Signal<number>
  pageCount: Signal<number>
  loading: Signal<boolean>
  failure: Signal<string | null>
  /** Re-fetches the current page — use after a mutation. */
  reload: () => Promise<void>
  /** Jumps to a page and fetches it. Out-of-range values are ignored. */
  goTo: (page: number) => Promise<void>
  /** Re-fetches from page one — use when a filter changes. */
  restart: () => Promise<void>
  /** Replaces the failure message, e.g. when a mutation rather than a load failed. */
  fail: (message: string | null) => void
}

/**
 * The loading/error/empty/paging bookkeeping every operator list needs, in one place.
 *
 * Presentation state, not application state: it describes what a screen is showing, and nothing
 * outside the screen reads it. The page it holds is already domain data — `load` is a use case,
 * so nothing transport-shaped reaches here.
 *
 * Written as a factory rather than a base class because Angular's DI and signals both work better
 * with composition, and because a component owning a `Collection` can still hold its own filter
 * state without fighting an inherited lifecycle.
 */
export function createCollection<TItem>({
  load,
  errorMessage,
}: CreateCollectionInput<TItem>): Collection<TItem> {
  const items = signal<TItem[]>([])
  const total = signal(0)
  const limit = signal(DEFAULT_PAGE_SIZE)
  const page = signal(1)
  const loading = signal(false)
  const failure = signal<string | null>(null)

  const pageCount = computed(() => countPages({ total: total(), limit: limit() }))

  async function fetchPage(next: number): Promise<void> {
    loading.set(true)
    failure.set(null)
    try {
      const result = await load(next)
      items.set(result.items)
      total.set(result.total)
      page.set(result.page)
      limit.set(result.limit)
    } catch {
      failure.set(errorMessage)
      items.set([])
      total.set(0)
    } finally {
      loading.set(false)
    }
  }

  return {
    items: items.asReadonly(),
    total: total.asReadonly(),
    page: page.asReadonly(),
    pageCount,
    loading: loading.asReadonly(),
    failure: failure.asReadonly(),
    reload: () => fetchPage(page()),
    restart: () => fetchPage(1),
    goTo: (next: number) => {
      if (next < 1 || next > pageCount() || next === page()) return Promise.resolve()
      return fetchPage(next)
    },
    fail: (message: string | null) => failure.set(message),
  }
}
