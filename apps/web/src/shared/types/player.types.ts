// снести
import type { ApiSchemas } from '@spotify/contracts'

export type ITrack = ApiSchemas['TrackEntity'] & {
  name: string
  file: string
  artist: string
  duration: number
  album?: string
}

