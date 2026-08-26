import { usePlayerStore } from '@/entities/Player/model/playerStore'
import type { TrackEntity } from '@/entities/Track/models/schema/Track.entity'

/** The few fields a queue test actually varies. */
type TestTrackInput = {
  id: string
  title?: string
  duration?: number
}

/** Builds a fully populated ready track, so queue tests only state what matters. */
export const createTrack = ({
  id,
  title = id,
  duration = 100,
}: TestTrackInput): TrackEntity => ({
  id,
  title,
  duration,
  artistId: 'artist-id',
  audioUrl: `/audio/${id}.mp3`,
  cover: '/cover.jpg',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  releaseDate: null,
  lyrics: null,
  processingStatus: 'READY' as const,
  processingError: null,
  processingAttempts: 0,
  processingStartedAt: null,
  processingFinishedAt: null,
  explicit: false,
  popularity: 0,
  playCount: 0,
  isrc: null,
  previewUrl: null,
  trackNumber: null,
  discNumber: 1,
  language: null,
  deletedAt: null,
})

export const first = createTrack({ id: 'first' })
export const second = createTrack({ id: 'second' })
export const third = createTrack({ id: 'third' })
export const fourth = createTrack({ id: 'fourth' })

/** Starts a two-track playlist positioned on its first track. */
export const startPlaylist = () =>
  usePlayerStore.getState().playPlaylist({
    currentPlaylistId: 'playlist-1',
    currentPlaylistName: 'Playlist',
    startTrack: first,
    tracks: [first, second],
  })
