import type { ArtistEntity } from '@entities/Artist'
import type { TrackEntity } from '@entities/Track'

export type ArtistAlbum = {
  id: string
  title: string
  cover: string | null
  releaseDate: string | null
}

export type ArtistContent = {
  albums: ArtistAlbum[]
  isPending: boolean
  isError: boolean
  tracks: TrackEntity[]
  /** The artist's most played tracks, ranked by listening (falls back to `tracks`). */
  popularTracks: TrackEntity[]
}

export type ArtistHeroProps = {
  artist: ArtistEntity
  statsLabel: string
}
