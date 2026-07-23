import type { ApiSchemas } from '@spotify/contracts'
import type { PlaylistEntity } from '@/entities/Playlist'
import type { TrackEntity } from '@/entities/Track'

export type ProfileArtist = ApiSchemas['SafeArtistEntity']

export type ProfilePlaylist = PlaylistEntity

export type ProfileTrack = TrackEntity & {
  artist?: {
    username?: string | null
  }
}
