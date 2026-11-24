import type { IconName } from '@/components/ui/icon'
import type { MediaFolder } from '@/lib/api/media-url'
import type { SearchResult } from '@/lib/catalog/search-query'
import type { TranslationKey } from '@/lib/i18n/messages/en'

type ResultLook = { folder: MediaFolder; fallback: IconName; labelKey: TranslationKey; round: boolean }

/** How each search result type is drawn: image folder, placeholder glyph, type label, shape. */
export const RESULT_LOOK: Record<SearchResult['type'], ResultLook> = {
  tracks: { folder: 'tracks/covers', fallback: 'music', labelKey: 'search.filter.tracks', round: false },
  artists: { folder: 'artists/avatars', fallback: 'user', labelKey: 'search.filter.artists', round: true },
  albums: { folder: 'albums/covers', fallback: 'disc', labelKey: 'search.filter.albums', round: false },
  playlists: { folder: 'playlists/covers', fallback: 'list', labelKey: 'search.filter.playlists', round: false },
}
