import type { TrackProcessingStatus } from '../track/track'

/** One row of an artist's track list, on the artist detail page's "Tracks" section. */
export type ArtistTrack = {
  id: string
  title: string
  coverUrl: string | null
  processingStatus: TrackProcessingStatus
  playCount: number
  /** Set when an operator took the track down. */
  takenDownAt: Date | null
  createdAt: Date
}

/** The release types the API groups an artist's albums by. */
export type ArtistAlbumType = 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION'

/** One row of an artist's album list, on the artist detail page's "Albums" section. */
export type ArtistAlbum = {
  id: string
  title: string
  coverUrl: string | null
  type: ArtistAlbumType
  totalTracks: number
  releaseDate: Date | null
  /** Set when an operator took the album down. */
  takenDownAt: Date | null
  createdAt: Date
}

/** Rows per page for the artist detail page's tracks and albums sections. */
export const ARTIST_TRACKS_PAGE_SIZE = 10

export const ARTIST_ALBUMS_PAGE_SIZE = 10
