import { computed, signal, type Signal } from '@angular/core'

type CreateSelectionInput = {
  /** The most rows that may be selected at once; further selections are ignored. */
  limit: number
}

export type Selection = {
  /** The selected ids, in selection order. */
  ids: Signal<readonly string[]>
  count: Signal<number>
  has: (id: string) => boolean
  toggle: (id: string) => void
  /** Selects every id in `ids`, or clears them all when they are already all selected. */
  toggleAll: (ids: readonly string[]) => void
  allSelected: (ids: readonly string[]) => boolean
  clear: () => void
}

/**
 * Which rows of the current list page are ticked. Presentation state only: it holds ids, and the
 * page derives the rows from its collection, so a reload that drops a row also drops it here.
 *
 * Callers clear it whenever the visible rows change underneath it — a page or filter change — so
 * an operator never confirms an action against rows they can no longer see.
 */
export function createSelection({ limit }: CreateSelectionInput): Selection {
  const selected = signal<readonly string[]>([])
  const count = computed(() => selected().length)

  return {
    ids: selected.asReadonly(),
    count,
    has: (id) => selected().includes(id),
    toggle: (id) =>
      selected.update((current) => {
        if (current.includes(id)) return current.filter((existing) => existing !== id)
        return current.length >= limit ? current : [...current, id]
      }),
    toggleAll: (ids) =>
      selected.update((current) =>
        ids.length > 0 && ids.every((id) => current.includes(id)) ? [] : ids.slice(0, limit),
      ),
    allSelected: (ids) => ids.length > 0 && ids.every((id) => selected().includes(id)),
    clear: () => selected.set([]),
  }
}
