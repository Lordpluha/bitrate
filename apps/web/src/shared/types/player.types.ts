
import type { ApiSchemas } from '@spotify/contracts'

export interface ITrack extends ApiSchemas['TrackEntity'] {
  name: string
  file: string
  artist: string
  duration: number
  album?: string
}

