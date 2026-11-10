import type { ApiSchemas } from '@bitrate/contracts'
import type { ApiTrack } from '@shared/api/track'

type PlaylistEntity = ApiSchemas['PlaylistEntity']
export type PlaylistTrack = ApiTrack

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
