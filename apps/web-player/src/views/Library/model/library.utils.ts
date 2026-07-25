import type {
  LibrarySection,
  SortMode,
} from '@/views/Library/model/library.types'

export const libraryTabs: Array<{
  id: LibrarySection
  label: string
}> = [
  { id: 'playlists', label: 'Playlists' },
  { id: 'liked', label: 'Liked Songs' },
  { id: 'albums', label: 'Albums' },
  { id: 'history', label: 'Recently Played' },
]

export const getTimestamp = (value?: string | null) =>
  value ? new Date(value).getTime() || 0 : 0

export const includesQuery = (value: string | undefined, query: string) =>
  value?.toLowerCase().includes(query.toLowerCase()) ?? false

export const compareByTitleOrDate = (
  firstTitle: string,
  secondTitle: string,
  firstDate: string | null | undefined,
  secondDate: string | null | undefined,
  sortMode: SortMode,
) =>
  sortMode === 'title'
    ? firstTitle.localeCompare(secondTitle)
    : getTimestamp(secondDate) - getTimestamp(firstDate)
