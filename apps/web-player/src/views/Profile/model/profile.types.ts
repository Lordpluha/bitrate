import type { ApiSchemas } from '@spotify/contracts'

export type ProfileArtist = {
  avatar: string | null
  id: string
  username: string
}

export type ProfilePlaylist = {
  cover: string | null
  id: string
  isPublic: boolean
  title: string
}

export type ProfileTrack = Pick<
  ApiSchemas['TrackEntity'],
  'artistId' | 'id' | 'title'
> & {
  artist?: {
    username?: string | null
  }
  cover: string | null
  duration?: number | null
}
