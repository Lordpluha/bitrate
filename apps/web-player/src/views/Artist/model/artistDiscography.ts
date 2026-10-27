import type { TrackEntity } from '@entities/Track'
import type { Translate, TranslationKey } from '@shared/i18n'
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

type DiscographyRelease = AlbumRelease | SingleRelease

export const COLLAPSED_RELEASE_COUNT = 6

export const DISCOGRAPHY_FILTERS: Array<{
  id: DiscographyFilter
  labelKey: TranslationKey
}> = [
  { id: 'popular', labelKey: 'artist.popularReleases' },
  { id: 'albums', labelKey: 'artist.albums' },
  { id: 'singles', labelKey: 'artist.singles' },
]

export const EMPTY_FILTER_LABELS: Record<DiscographyFilter, TranslationKey> = {
  popular: 'artist.noReleases',
  albums: 'artist.noAlbums',
  singles: 'artist.noSingles',
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

type ReleaseMetadataInput = {
  releaseDate: string | null
  releaseType: 'album' | 'single'
  t: Translate
}

/** "2024 · Album" under a release card, or just the type when the year is unknown. */
export const getReleaseMetadata = ({
  releaseDate,
  releaseType,
  t,
}: ReleaseMetadataInput) => {
  const type = t(
    releaseType === 'album' ? 'album.type.album' : 'album.type.single',
  )
  const timestamp = getReleaseTimestamp(releaseDate)
  const year = timestamp === null ? null : new Date(timestamp).getFullYear()
  return year ? t('artist.releaseMeta', { type, year }) : type
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
