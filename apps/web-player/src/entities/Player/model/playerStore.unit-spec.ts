import { beforeEach, describe, expect, it } from 'vitest'

import { usePlayerStore } from './playerStore'

type TestTrackInput = {
  id: string
  title: string
  duration: number
}

const createTrack = ({ id, title, duration }: TestTrackInput) => ({
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

  it('cycles through playlist tracks in both directions', () => {
    const first = createTrack({ id: 'first', title: 'First', duration: 120 })
    const second = createTrack({ id: 'second', title: 'Second', duration: 180 })

    usePlayerStore.getState().setPlaylistTracks([first, second])
    usePlayerStore.getState().play(first)
    usePlayerStore.getState().changeTrack('next')

    expect(usePlayerStore.getState().currentTrack).toEqual(second)

    usePlayerStore.getState().changeTrack('next')
    expect(usePlayerStore.getState().currentTrack).toEqual(first)

    usePlayerStore.getState().changeTrack('prev')
    expect(usePlayerStore.getState().currentTrack).toEqual(second)
  })
})
