import { API_BASE_URL } from './config'

export type MediaFolder =
  | 'albums/covers'
  | 'artists/avatars'
  | 'playlists/covers'
  | 'tracks/covers'
  | 'users/avatars'

/**
 * Turns the cover/avatar value the API returns into a loadable URL, or null when the caller
 * should render its placeholder. Mirrors the web player's `getStaticMediaUrl` minus the web-only
 * `/api-media` proxy — native image loaders have no CORS to work around.
 */
export function resolveMediaUrl(value: string | null | undefined, folder: MediaFolder): string | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  if (/^https?:\/\//.test(trimmed)) return trimmed
  if (trimmed.startsWith('/static/')) return `${API_BASE_URL}${trimmed}`
  if (trimmed.startsWith('/')) return null
  return `${API_BASE_URL}/static/${folder}/${encodeURIComponent(trimmed)}`
}
