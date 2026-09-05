import { beforeEach, describe, expect, it } from 'vitest'

import type { TrackEntity } from '@/entities/Track/models/schema/Track.entity'

import { usePlayerStore } from './playerStore'

type TestTrackInput = {
  id: string
  title: string
  duration: number
}

const createTrack = ({ id, title, duration }: TestTrackInput): TrackEntity => ({
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
  playbackVersion: 1,
  fragmentTimescale: null,
  durationTicks: null,
})

describe('usePlayerStore', () => {
  beforeEach(() => {
    usePlayerStore.getState().reset()
  })

  it('plays and pauses a track', () => {
    const track = createTrack({ id: 'first', title: 'First', duration: 120 })

    usePlayerStore.getState().play(track)

    expect(usePlayerStore.getState()).toMatchObject({
      currentTrack: track,
      isPlaying: true,
      duration: 120,
    })

    usePlayerStore.getState().pause()

    expect(usePlayerStore.getState().isPlaying).toBe(false)
  })

  it('cycles through playlist tracks in both directions when repeat is all', () => {
    const first = createTrack({ id: 'first', title: 'First', duration: 120 })
    const second = createTrack({ id: 'second', title: 'Second', duration: 180 })

    usePlayerStore.getState().setPlaylistTracks([first, second])
    usePlayerStore.getState().setRepeatMode('all')
    usePlayerStore.getState().play(first)
    usePlayerStore.getState().changeTrack('next')

    expect(usePlayerStore.getState().currentTrack).toEqual(second)

    usePlayerStore.getState().changeTrack('next')
    expect(usePlayerStore.getState().currentTrack).toEqual(first)

    usePlayerStore.getState().changeTrack('prev')
    expect(usePlayerStore.getState().currentTrack).toEqual(second)
  })
})
