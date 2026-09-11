import type { Track } from '@prisma/client'

/** Builds a full track record for tests (mirrors the Prisma model shape). */
export const buildTrack = (overrides: Partial<Track> = {}): Track => ({
  id: 'track-1',
  title: 'Test Track',
  audioUrl: 'source.opus',
  cover: null,
  artistId: 'artist-1',
  duration: 180,
  releaseDate: null,
  lyrics: null,
  explicit: false,
  popularity: 0,
  playCount: 0,
  isrc: null,
  previewUrl: null,
  trackNumber: null,
  discNumber: 1,
  language: null,
  deletedAt: null,
  processingStatus: 'READY',
  processingError: null,
  processingAttempts: 0,
  processingStartedAt: null,
  processingFinishedAt: null,
  playbackVersion: 2,
  fragmentTimescale: null,
  durationTicks: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

/** Builds a track joined with its artist's username, as `findFirst({ include })` returns. */
export const buildTrackWithArtist = (
  overrides: Partial<Track> = {},
  artistUsername = 'dj-test',
) => ({
  ...buildTrack(overrides),
  artist: { username: artistUsername },
})

/** Builds the operator-facing (flattened) row shape returned by `AdminTracksService`. */
export const buildAdminTrackRow = (overrides: Partial<Track> = {}, artistUsername = 'dj-test') => {
  const track = buildTrack(overrides)
  return {
    id: track.id,
    title: track.title,
    artistId: track.artistId,
    artistUsername,
    processingStatus: track.processingStatus,
    processingError: track.processingError,
    processingAttempts: track.processingAttempts,
    processingStartedAt: track.processingStartedAt,
    processingFinishedAt: track.processingFinishedAt,
    deletedAt: track.deletedAt,
    createdAt: track.createdAt,
    updatedAt: track.updatedAt,
  }
}
