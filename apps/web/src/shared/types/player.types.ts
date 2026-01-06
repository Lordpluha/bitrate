export interface ITrack {
  id: string
  title: string
  audioUrl: string
  artist: string
  duration: number
  cover?: string
  name: string
  file: string
  album?: string
  createdAt?: string
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
