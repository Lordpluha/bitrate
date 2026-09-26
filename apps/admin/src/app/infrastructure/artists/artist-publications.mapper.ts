import type { ArtistAlbum, ArtistAlbumType, ArtistTrack } from '@domain/artist'
import type { TrackProcessingStatus } from '@domain/track'
import { API_BASE_URL } from '../http/api.config'
import type { ArtistAlbumDto, ArtistTrackDto } from './artist-publications.dto'

/** See `track.mapper.ts`'s `toCoverUrl` — same join, a different storage bucket. */
function toTrackCoverUrl(cover: string | null | undefined): string | null {
  if (!cover) return null
  return `${API_BASE_URL}/static/tracks/covers/${encodeURIComponent(cover)}`
}

/** Albums are stored under their own bucket — see `apps/api/storage/public/albums/covers/`. */
function toAlbumCoverUrl(cover: string | null | undefined): string | null {
  if (!cover) return null
  return `${API_BASE_URL}/static/albums/covers/${encodeURIComponent(cover)}`
}

/**
 * See `track.mapper.ts`'s `TO_DOMAIN_STATUS` — a member the API grows later has no entry here,
 * and `satisfies` turns that into a compile error at this line rather than an empty screen.
 */
const TO_DOMAIN_STATUS = {
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const satisfies Record<ArtistTrackDto['processingStatus'], TrackProcessingStatus>

const TO_DOMAIN_ALBUM_TYPE = {
  ALBUM: 'ALBUM',
  SINGLE: 'SINGLE',
  EP: 'EP',
  COMPILATION: 'COMPILATION',
} as const satisfies Record<ArtistAlbumDto['type'], ArtistAlbumType>

export function toArtistTrack(dto: ArtistTrackDto): ArtistTrack {
  return {
    id: dto.id,
    title: dto.title,
    coverUrl: toTrackCoverUrl(dto.cover),
    processingStatus: TO_DOMAIN_STATUS[dto.processingStatus],
    playCount: dto.playCount,
    takenDownAt: dto.deletedAt ? new Date(dto.deletedAt) : null,
    createdAt: new Date(dto.createdAt),
  }
}

export function toArtistAlbum(dto: ArtistAlbumDto): ArtistAlbum {
  return {
    id: dto.id,
    title: dto.title,
    coverUrl: toAlbumCoverUrl(dto.cover),
    type: TO_DOMAIN_ALBUM_TYPE[dto.type],
    totalTracks: dto.totalTracks,
    releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : null,
    takenDownAt: dto.deletedAt ? new Date(dto.deletedAt) : null,
    createdAt: new Date(dto.createdAt),
  }
}
