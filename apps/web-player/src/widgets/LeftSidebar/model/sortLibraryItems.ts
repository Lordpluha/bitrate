import { LIKED_SONGS_ID } from '@/entities/Playlist'
import type { LibraryMusicItem } from './library.types'

/** Orders the library sidebar offers; "recent" is newest added first. */
export const LIBRARY_SORTS = ['recent', 'title', 'creator'] as const
export type LibrarySort = (typeof LIBRARY_SORTS)[number]

/** Narrows a stored value; anything else falls back to the default order. */
export const isLibrarySort = (value: unknown): value is LibrarySort =>
  LIBRARY_SORTS.some((sort) => sort === value)

const timestamp = (value?: string) => (value ? Date.parse(value) || 0 : 0)
const byTitle = (first: LibraryMusicItem, second: LibraryMusicItem) =>
  first.title.localeCompare(second.title, undefined, { sensitivity: 'base' })

const COMPARATORS = {
  creator: (first, second) =>
    first.username.localeCompare(second.username, undefined, {
      sensitivity: 'base',
    }) || byTitle(first, second),
  recent: (first, second) =>
    timestamp(second.createdAt) - timestamp(first.createdAt),
  title: byTitle,
} as const satisfies Record<
  LibrarySort,
  (first: LibraryMusicItem, second: LibraryMusicItem) => number
>

type SortLibraryItemsInput = {
  items: LibraryMusicItem[]
  sort: LibrarySort
}

/** Sorts a copy of the library; Liked Songs always stays on top. */
export const sortLibraryItems = ({ items, sort }: SortLibraryItemsInput) =>
  [...items].sort((first, second) => {
    if (first.id === LIKED_SONGS_ID) return -1
    if (second.id === LIKED_SONGS_ID) return 1
    return COMPARATORS[sort](first, second)
  })
