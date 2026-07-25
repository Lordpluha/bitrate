import type { ApiSchemas } from '@spotify/contracts'
import type { PlaylistEntity } from '@/entities/Playlist'

export type ProfileArtist = ApiSchemas['SafeArtistEntity']

export type ProfilePlaylist = PlaylistEntity

export type ProfileTrack = Pick<
  ApiSchemas['TrackEntity'],
  'artistId' | 'cover' | 'duration' | 'id' | 'title'
> & {
  artist?: {
    username?: string | null
  }
}
