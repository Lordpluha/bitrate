import { useSearch } from '@/features/Search'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'
import {
  getAlbumCoverUrl,
  getPlaylistCoverUrl,
  getTrackCoverUrl,
} from '@/shared/utils/mediaUrl'
import {
  categorySuggestions,
  headerSearchTypes,
} from '@/widgets/MainHeader/ui/HeaderSearch/model/headerSearch.constants'
import type { HeaderSuggestion } from '@/widgets/MainHeader/ui/HeaderSearch/model/headerSearch.types'

export const useSearchSuggestions = (query: string, debouncedQuery: string) => {
  const { t } = useI18n()
  const { data } = useSearch({
    limit: 4,
    query: debouncedQuery,
    types: headerSearchTypes,
  })
  const querySuggestions: HeaderSuggestion[] = [
    `${query} playlist`,
    query,
    `${query} motivation`,
    `${query} playlist 2026`,
  ].map((title) => ({
    query: title,
    subtitle: t('common.search'),
    title,
    type: 'query',
  }))
  const normalizedQuery = query.toLowerCase()
  const categoryMatches: HeaderSuggestion[] = categorySuggestions
    .filter(({ title }) => {
      const normalizedTitle = title.toLowerCase()
      return (
        normalizedTitle.includes(normalizedQuery) ||
        normalizedQuery.includes(normalizedTitle.replace(' music', ''))
      )
    })
    .slice(0, 2)
    .map((category) => ({
      ...category,
      href: ROUTES.searchCategory(category.title),
      subtitle: t('search.genre'),
      type: 'media',
    }))
  const mediaMatches: HeaderSuggestion[] =
    debouncedQuery === query
      ? [
          ...(data?.tracks ?? []).slice(0, 3).map((track) => ({
            image: getTrackCoverUrl(track.cover),
            subtitle: `${t('common.song')} • ${track.artistId || t('common.unknown')}`,
            title: track.title,
            type: 'media' as const,
          })),
          ...(data?.playlists ?? []).slice(0, 3).map((playlist) => ({
            href: ROUTES.playlist(playlist.id),
            image: getPlaylistCoverUrl(playlist.cover),
            subtitle: t('common.playlist'),
            title: playlist.title,
            type: 'media' as const,
          })),
          ...(data?.albums ?? []).slice(0, 2).map((album) => ({
            href: ROUTES.album(album.id),
            image: getAlbumCoverUrl(album.cover),
            subtitle: t('common.album'),
            title: album.title,
            type: 'media' as const,
          })),
        ]
      : []

  return [...querySuggestions, ...categoryMatches, ...mediaMatches].slice(0, 9)
}
