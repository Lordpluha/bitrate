import type { ApiSchemas } from '@spotify/contracts'

export type ITrack = ApiSchemas['TrackEntity'] & {
  album?: string
}

