import type { ApiSchemas } from '@spotify/contracts'

export type ITrack = ApiSchemas['TrackEntity'] & {
  name: string
  file: string
  artist: string
  duration: number
  album?: string
}

export interface IMusicPlayerState {
  currentTrack: ITrack | null
  playlist: ITrack[]
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  progress: number
}


// с Владом обговорить это, так как я понял у апи нету типов artist, duration, name, file, album или я тупой(более вероятно)