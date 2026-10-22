import type { CatalogueSearch } from '@entities/music'

type CatalogueSort = NonNullable<CatalogueSearch['sort']>

/** The control label and the footer note for each catalogue order. */
export const catalogueSortLabels = {
  updated: { label: 'Recently updated', note: 'Sorted by recently updated' },
  title: { label: 'Title A–Z', note: 'Sorted by title' },
  oldest: { label: 'Oldest updated', note: 'Sorted by oldest updated' },
} satisfies Record<CatalogueSort, { label: string; note: string }>
