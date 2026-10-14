import type {
  SearchAlbumResult,
  SearchPlaylistResult,
  SearchTrackResult,
} from '@/features/Search'
import { ROUTES } from '@/shared/routes'
import {
  getAlbumCoverUrl,
  getPlaylistCoverUrl,
  getTrackCoverUrl,
} from '@/shared/utils/mediaUrl'
import type { HeaderSuggestion } from './headerSearch.types'

const MAX_SUGGESTIONS = 9
const MAX_HISTORY = 3
const MAX_CATEGORIES = 2

/** A browse category from `GET /browse/categories`. */
type SuggestedCategory = { name: string; slug: string; cover: string | null }

type BuildHeaderSuggestionsInput = {
  query: string
  /** Past searches of the signed-in user (server) or this browser (guest). */
  history: readonly string[]
  categories: readonly SuggestedCategory[]
  /** Search results for the settled query; undefined while typing. */
  results:
    | {
        tracks: SearchTrackResult[]
        playlists: SearchPlaylistResult[]
        albums: SearchAlbumResult[]
      }
    | undefined
  labels: Record<
    'search' | 'genre' | 'song' | 'playlist' | 'album' | 'unknown',
    string
  >
}

/**
 * The header search dropdown, built only from real data: the typed query, the user's own past
 * searches that contain it, matching browse categories and the search results.
 */
export const buildHeaderSuggestions = ({
  query,
  history,
  categories,
  results,
  labels,
}: BuildHeaderSuggestionsInput): HeaderSuggestion[] => {
  const q = query.trim()
  if (!q) return []
  const lower = q.toLowerCase()
  const asQuery = (title: string): HeaderSuggestion => ({
    query: title,
    subtitle: labels.search,
    title,
    type: 'query',
  })
  const past = history
    .filter((item) => {
      const value = item.toLowerCase()
      return value !== lower && value.includes(lower)
    })
    .slice(0, MAX_HISTORY)
    .map(asQuery)
  const genres: HeaderSuggestion[] = categories
    .filter(
      ({ name }) =>
        name.toLowerCase().includes(lower) ||
        lower.includes(name.toLowerCase()),
    )
    .slice(0, MAX_CATEGORIES)
    .map((category) => ({
      href: ROUTES.searchCategory(category.slug),
      image: getPlaylistCoverUrl(category.cover),
      subtitle: labels.genre,
      title: category.name,
      type: 'media',
    }))
  const media: HeaderSuggestion[] = results
    ? [
        ...results.tracks.slice(0, 3).map((track) => ({
          ...(track.artistId ? { href: ROUTES.artist(track.artistId) } : {}),
          image: getTrackCoverUrl(track.cover),
          subtitle: `${labels.song} • ${track.artistName || labels.unknown}`,
          title: track.title,
          type: 'media' as const,
        })),
        ...results.playlists.slice(0, 3).map((playlist) => ({
          href: ROUTES.playlist(playlist.id),
          image: getPlaylistCoverUrl(playlist.cover),
          subtitle: labels.playlist,
          title: playlist.title,
          type: 'media' as const,
        })),
        ...results.albums.slice(0, 2).map((album) => ({
          href: ROUTES.album(album.id),
          image: getAlbumCoverUrl(album.cover),
          subtitle: labels.album,
          title: album.title,
          type: 'media' as const,
        })),
      ]
    : []
  return [asQuery(q), ...past, ...genres, ...media].slice(0, MAX_SUGGESTIONS)
}
