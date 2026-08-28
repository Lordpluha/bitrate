import type { TrackEntity } from '@entities/Track'
import type { ArtistAlbum } from './artist.types'

export type DiscographyFilter = 'popular' | 'albums' | 'singles'

export type AlbumRelease = {
  album: ArtistAlbum
  id: string
  kind: 'album'
  releaseDate: string | null
}

export type SingleRelease = {
  id: string
  index: number
  kind: 'single'
  releaseDate: string | null
  track: TrackEntity
}

export type DiscographyRelease = AlbumRelease | SingleRelease

export const COLLAPSED_RELEASE_COUNT = 6

export const DISCOGRAPHY_FILTERS: Array<{
  id: DiscographyFilter
  label: string
}> = [
  { id: 'popular', label: 'Popular releases' },
  { id: 'albums', label: 'Albums' },
  { id: 'singles', label: 'Singles and EPs' },
]

export const EMPTY_FILTER_LABELS: Record<DiscographyFilter, string> = {
  popular: 'No releases yet.',
  albums: 'No albums yet.',
  singles: 'No singles or EPs yet.',
}

const getReleaseTimestamp = (releaseDate: string | null) => {
  if (!releaseDate) return null
  const timestamp = Date.parse(releaseDate)
  return Number.isNaN(timestamp) ? null : timestamp
}

const compareNewestFirst = (
  left: DiscographyRelease,
  right: DiscographyRelease,
) => {
  const leftTimestamp = getReleaseTimestamp(left.releaseDate)
  const rightTimestamp = getReleaseTimestamp(right.releaseDate)

  if (leftTimestamp === null) return rightTimestamp === null ? 0 : 1
  if (rightTimestamp === null) return -1
  return rightTimestamp - leftTimestamp
}

export const getReleaseMetadata = (
  releaseDate: string | null,
  releaseType: 'Album' | 'Single',
) => {
  const timestamp = getReleaseTimestamp(releaseDate)
  const year = timestamp === null ? null : new Date(timestamp).getFullYear()
  return year ? `${year} · ${releaseType}` : releaseType
}

export const getDiscographyReleases = (
  albums: ArtistAlbum[],
  tracks: TrackEntity[],
) => {
  const albumReleases: AlbumRelease[] = albums.map((album) => ({
    album,
    id: `album:${album.id}`,
    kind: 'album',
    releaseDate: album.releaseDate,
  }))
  const singleReleases: SingleRelease[] = tracks.map((track, index) => ({
    id: `single:${track.id}`,
    index,
    kind: 'single',
    releaseDate: track.releaseDate,
    track,
  }))

  return {
    popular: [...albumReleases, ...singleReleases].sort(compareNewestFirst),
    albums: albumReleases.sort(compareNewestFirst),
    singles: singleReleases.sort(compareNewestFirst),
  } satisfies Record<DiscographyFilter, DiscographyRelease[]>
}
