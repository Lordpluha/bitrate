import {
  fallbackAlbumCover,
  fallbackArtistImage,
  fallbackPlaylistCover,
  fallbackTrackCover,
  fallbackUserAvatar,
} from '@shared/constants'

export type StaticMediaFolder =
  | 'albums/covers'
  | 'artists/avatars'
  | 'artists/backgrounds'
  | 'playlists/covers'
  | 'tracks/covers'
  | 'users/avatars'

export type MediaFallbackKind =
  | 'album'
  | 'artist'
  | 'playlist'
  | 'track'
  | 'user'

const mediaFallbacks: Record<MediaFallbackKind, string> = {
  album: fallbackAlbumCover,
  artist: fallbackArtistImage,
  playlist: fallbackPlaylistCover,
  track: fallbackTrackCover,
  user: fallbackUserAvatar,
}

export const getApiBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''

const staticMediaProxyPrefix = '/api-media'

export const getApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getApiBaseUrl()}${normalizedPath}`
}

const getProxiedStaticMediaUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${staticMediaProxyPrefix}${normalizedPath}`
}

export const getStaticMediaUrl = (
  value: string | null | undefined,
  folder: StaticMediaFolder,
  fallback: string,
) => {
  const normalizedValue = value?.trim()
  if (!normalizedValue) return fallback

  if (normalizedValue.startsWith('/images/')) {
    return normalizedValue
  }

  if (
    normalizedValue.startsWith('http://') ||
    normalizedValue.startsWith('https://')
  ) {
    try {
      const url = new URL(normalizedValue)
      const apiBaseUrl = getApiBaseUrl()

      if (apiBaseUrl) {
        const apiUrl = new URL(apiBaseUrl)

        if (
          url.origin === apiUrl.origin &&
          url.pathname.startsWith('/static/')
        ) {
          return getProxiedStaticMediaUrl(`${url.pathname}${url.search}`)
        }
      }

      return url.toString()
    } catch {
      return fallback
    }
  }

  if (normalizedValue.startsWith('/static/')) {
    return getProxiedStaticMediaUrl(normalizedValue)
  }

  if (normalizedValue.startsWith('/')) {
    return fallback
  }

  return getProxiedStaticMediaUrl(
    `/static/${folder}/${encodeURIComponent(normalizedValue)}`,
  )
}

export const getMediaFallback = (kind: MediaFallbackKind) =>
  mediaFallbacks[kind]

export const getPlaylistCoverUrl = (value: string | null | undefined) =>
  getStaticMediaUrl(value, 'playlists/covers', getMediaFallback('playlist'))

export const getTrackCoverUrl = (value: string | null | undefined) =>
  getStaticMediaUrl(value, 'tracks/covers', getMediaFallback('track'))

export const getAlbumCoverUrl = (value: string | null | undefined) =>
  getStaticMediaUrl(value, 'albums/covers', getMediaFallback('album'))

export const getUserAvatarUrl = (value: string | null | undefined) =>
  getStaticMediaUrl(value, 'users/avatars', getMediaFallback('user'))

export const getArtistAvatarUrl = (value: string | null | undefined) =>
  getStaticMediaUrl(value, 'artists/avatars', getMediaFallback('artist'))

export const getArtistBackgroundUrl = (
  value: string | null | undefined,
  fallback: string | null | undefined,
) =>
  getStaticMediaUrl(value, 'artists/backgrounds', getArtistAvatarUrl(fallback))
