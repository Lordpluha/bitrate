import type { ApiSchemas } from '@spotify/contracts'

export type ProfileArtist = ApiSchemas['SafeArtistEntity']

export type ProfilePlaylist = {
  cover: string | null
  id: string
  isPublic: boolean
  title: string
}

export type ProfileTrack = Pick<
  ApiSchemas['TrackEntity'],
  'artistId' | 'cover' | 'duration' | 'id' | 'title'
> & {
  artist?: {
    username?: string | null
  }
}
