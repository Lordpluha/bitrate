import type {
  DiscoveryFeedItem,
  DiscoveryPlaylist,
  DiscoveryTrack,
} from '@/entities/Discovery'
import type { MediaCardItem } from '@/features/Search/model/types'
import { ROUTES } from '@/shared/routes'
import {
  getAlbumCoverUrl,
  getPlaylistCoverUrl,
  getTrackCoverUrl,
} from '@/shared/utils/mediaUrl'

export const mapDiscoveryFeedItem = (
  sectionId: string,
  item: DiscoveryFeedItem,
): MediaCardItem => {
  if (sectionId === 'new-releases') {
    return {
      description: item.artist?.username ?? 'Album',
      href: ROUTES.album(item.id),
      id: item.id,
      image: getAlbumCoverUrl(item.cover),
      title: item.title,
    }
  }

  if (sectionId === 'popular-playlists') {
    return {
      description: item.user?.username ?? item.description ?? 'Playlist',
      href: ROUTES.playlist(item.id),
      id: item.id,
      image: getPlaylistCoverUrl(item.cover),
      title: item.title,
    }
  }

  /** There is no track page, so a track card points at its artist instead. */
  return {
    description: item.artist?.username ?? 'Track',
    href: item.artistId ? ROUTES.artist(item.artistId) : undefined,
    id: item.id,
    image: getTrackCoverUrl(item.cover),
    title: item.title,
  }
}

export const mapDiscoveryPlaylist = (
  playlist: DiscoveryPlaylist,
): MediaCardItem => ({
  description: playlist.user?.username ?? playlist.description ?? 'Playlist',
  href: ROUTES.playlist(playlist.id),
  id: playlist.id,
  image: getPlaylistCoverUrl(playlist.cover),
  title: playlist.title,
})

export const mapDiscoveryTrack = (track: DiscoveryTrack): MediaCardItem => ({
  description: track.artist?.username ?? 'Track',
  href: track.artistId ? ROUTES.artist(track.artistId) : undefined,
  id: track.id,
  image: getTrackCoverUrl(track.cover),
  title: track.title,
})
