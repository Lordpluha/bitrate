import { ROUTES } from '@shared/routes'
import {
  getAlbumCoverUrl,
  getArtistAvatarUrl,
  getPlaylistCoverUrl,
  getTrackCoverUrl,
} from '@shared/utils/mediaUrl'
import type { SearchResult } from '@/features/Search/api/client/search.schemas'

/** The "Top result" panel's content, from the API's highest-ranked result. */
export type TopResultCard = {
  href: string | undefined
  id: string
  image: string
  kind: 'Album' | 'Artist' | 'Playlist' | 'Song'
  /** What its play button starts; artists have none. */
  playKind: 'album' | 'playlist' | 'track' | undefined
  /** Artists show a round avatar. */
  round: boolean
  subtitle: string | null
  title: string
}

export const toTopResultCard = (result: SearchResult): TopResultCard => {
  const common = {
    id: result.id,
    subtitle: result.subtitle,
    title: result.title,
  }

  switch (result.type) {
    case 'artists':
      return {
        ...common,
        href: ROUTES.artist(result.id),
        image: getArtistAvatarUrl(result.image),
        kind: 'Artist',
        playKind: undefined,
        round: true,
      }
    case 'albums':
      return {
        ...common,
        href: ROUTES.album(result.id),
        image: getAlbumCoverUrl(result.image),
        kind: 'Album',
        playKind: 'album',
        round: false,
      }
    case 'playlists':
      return {
        ...common,
        href: ROUTES.playlist(result.id),
        image: getPlaylistCoverUrl(result.image),
        kind: 'Playlist',
        playKind: 'playlist',
        round: false,
      }
    case 'tracks':
      /* There is no track page, so a song points at its artist. */
      return {
        ...common,
        href: result.artistId ? ROUTES.artist(result.artistId) : undefined,
        image: getTrackCoverUrl(result.image),
        kind: 'Song',
        playKind: 'track',
        round: false,
      }
  }
}
