import type { SafeUser } from '@/entities/User'
import type {
  SearchAlbumResult,
  SearchArtistResult,
  SearchPlaylistResult,
  SearchTrackResult,
} from '@/features/Search/api/client'
import type { SearchResultRow } from '@/features/Search/model/types'
import { ROUTES } from '@/shared/routes'
import {
  getAlbumCoverUrl,
  getArtistAvatarUrl,
  getPlaylistCoverUrl,
  getTrackCoverUrl,
  getUserAvatarUrl,
} from '@/shared/utils/mediaUrl'

export type BuildSearchRowsInput = {
  albums: SearchAlbumResult[]
  artists: SearchArtistResult[]
  playlists: SearchPlaylistResult[]
  tracks: SearchTrackResult[]
  users: SafeUser[]
}

export type SearchRowGroups = Record<string, SearchResultRow[]>

/** Maps each search result type into a uniform row shape, grouped by filter tab. */
export const buildSearchRows = ({
  albums,
  artists,
  playlists,
  tracks,
  users,
}: BuildSearchRowsInput): SearchRowGroups => ({
  Albums: albums.map((album) => ({
    href: ROUTES.album(album.id),
    image: getAlbumCoverUrl(album.cover),
    kind: 'Album' as const,
    subtitle: 'Album',
    title: album.title,
  })),
  Artists: artists.map((artist) => ({
    circularImage: true,
    href: ROUTES.artist(artist.id),
    image: getArtistAvatarUrl(artist.avatar),
    kind: 'Artist' as const,
    subtitle: 'Artist',
    title: artist.username,
  })),
  Playlists: playlists.map((playlist) => ({
    href: ROUTES.playlist(playlist.id),
    image: getPlaylistCoverUrl(playlist.cover),
    kind: 'Playlist' as const,
    subtitle: 'Playlist',
    title: playlist.title,
  })),
  Profiles: users.map((user) => ({
    href: ROUTES.user(user.id),
    image: getUserAvatarUrl(user.avatar),
    kind: 'Profile' as const,
    subtitle: 'Profile',
    title: user.username,
  })),
  Songs: tracks.map((track) => ({
    artistId: track.artistId,
    image: getTrackCoverUrl(track.cover),
    kind: 'Song' as const,
    subtitle: 'Song',
    title: track.title,
  })),
})

const ALL_TAB_ROWS_PER_GROUP = 4

/** Rows shown on the "All" tab — a few from each group, artists first. */
export const getAllTabRows = (groups: SearchRowGroups): SearchResultRow[] =>
  ['Artists', 'Songs', 'Albums', 'Playlists', 'Profiles'].flatMap((group) =>
    (groups[group] ?? []).slice(0, ALL_TAB_ROWS_PER_GROUP),
  )
