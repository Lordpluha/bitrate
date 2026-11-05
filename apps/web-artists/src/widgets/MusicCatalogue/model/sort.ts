import type { CatalogueSearch } from '@entities/music'
import type { TranslationKey } from '@shared/i18n'

type CatalogueSort = NonNullable<CatalogueSearch['sort']>

/** Catalog keys for the control label and the footer note of each catalogue order. */
export const catalogueSortLabels = {
  updated: { label: 'music.sort.updated', note: 'music.sort.updatedNote' },
  title: { label: 'music.sort.title', note: 'music.sort.titleNote' },
  oldest: { label: 'music.sort.oldest', note: 'music.sort.oldestNote' },
} satisfies Record<
  CatalogueSort,
  { label: TranslationKey; note: TranslationKey }
>
