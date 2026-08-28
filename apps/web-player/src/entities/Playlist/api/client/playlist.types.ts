import type { ApiSchemas } from '@spotify/contracts'

export type PlaylistEntity = ApiSchemas['PlaylistEntity']
export type PlaylistTrack = ApiSchemas['TrackEntity']

export type PlaylistWithTracks = PlaylistEntity & {
  tracks: PlaylistTrack[]
  user?: {
    id?: string
    username?: string
    avatar?: string | null
  }
}

export type CreatePlaylistPayload = {
  title: string
  description?: string
  isPublic?: boolean
}

export type UpdatePlaylistPayload = {
  title: string
  description?: string
}
