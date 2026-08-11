import { beforeEach, describe, expect, it } from 'vitest'

import type { TrackEntity } from '@/entities/Track/models/schema/Track.entity'

import { usePlayerStore } from './playerStore'

type TestTrackInput = {
  id: string
  title?: string
  duration?: number
}

const createTrack = ({ id, title = id, duration = 100 }: TestTrackInput): TrackEntity => ({
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

const first = createTrack({ id: 'first' })
const second = createTrack({ id: 'second' })
const third = createTrack({ id: 'third' })

const startPlaylist = () =>
  usePlayerStore.getState().playPlaylist({
    currentPlaylistId: 'playlist-1',
    currentPlaylistName: 'Playlist',
    startTrack: first,
    tracks: [first, second],
  })

describe('player queue', () => {
  beforeEach(() => {
    usePlayerStore.getState().reset()
  })

  it('starts empty', () => {
    expect(usePlayerStore.getState().queue).toEqual([])
  })

  it('appends a track with addToQueue', () => {
    usePlayerStore.getState().addToQueue(third)

    expect(usePlayerStore.getState().queue).toHaveLength(1)
    expect(usePlayerStore.getState().queue[0]?.track).toEqual(third)
  })

  it('puts playNext ahead of previously queued tracks', () => {
    usePlayerStore.getState().addToQueue(second)
    usePlayerStore.getState().playNext(third)

    expect(
      usePlayerStore.getState().queue.map((item) => item.track.id),
    ).toEqual(['third', 'second'])
  })

  it('plays the queued track before continuing the playlist', () => {
    startPlaylist()
    usePlayerStore.getState().addToQueue(third)

    usePlayerStore.getState().changeTrack('next')

    expect(usePlayerStore.getState().currentTrack?.id).toBe('third')
    expect(usePlayerStore.getState().queue).toEqual([])
  })

  it('removes a queued track by its queue id', () => {
    usePlayerStore.getState().addToQueue(second)
    usePlayerStore.getState().addToQueue(third)
    const [firstQueued] = usePlayerStore.getState().queue

    usePlayerStore.getState().removeFromQueue(firstQueued?.queueId ?? '')

    expect(
      usePlayerStore.getState().queue.map((item) => item.track.id),
    ).toEqual(['third'])
  })

  it('clears the whole queue', () => {
    usePlayerStore.getState().addToQueue(second)
    usePlayerStore.getState().addToQueue(third)

    usePlayerStore.getState().clearQueue()

    expect(usePlayerStore.getState().queue).toEqual([])
  })

  it('queues the same track twice with distinct ids', () => {
    usePlayerStore.getState().addToQueue(third)
    usePlayerStore.getState().addToQueue(third)

    const [left, right] = usePlayerStore.getState().queue
    expect(usePlayerStore.getState().queue).toHaveLength(2)
    expect(left?.queueId).not.toBe(right?.queueId)
  })
})

describe('repeat mode', () => {
  beforeEach(() => {
    usePlayerStore.getState().reset()
  })

  it('defaults to off', () => {
    expect(usePlayerStore.getState().repeatMode).toBe('off')
  })

  it('cycles off → all → one → off', () => {
    const { cycleRepeatMode } = usePlayerStore.getState()

    cycleRepeatMode()
    expect(usePlayerStore.getState().repeatMode).toBe('all')

    cycleRepeatMode()
    expect(usePlayerStore.getState().repeatMode).toBe('one')

    cycleRepeatMode()
    expect(usePlayerStore.getState().repeatMode).toBe('off')
  })

  it('stops at the end of the playlist when repeat is off', () => {
    startPlaylist()
    usePlayerStore.getState().changeTrack('next')
    expect(usePlayerStore.getState().currentTrack?.id).toBe('second')

    usePlayerStore.getState().changeTrack('next')

    expect(usePlayerStore.getState().currentTrack?.id).toBe('second')
    expect(usePlayerStore.getState().isPlaying).toBe(false)
  })

  it('wraps to the first track when repeat is all', () => {
    startPlaylist()
    usePlayerStore.getState().setRepeatMode('all')
    usePlayerStore.getState().changeTrack('next')

    usePlayerStore.getState().changeTrack('next')

    expect(usePlayerStore.getState().currentTrack?.id).toBe('first')
    expect(usePlayerStore.getState().isPlaying).toBe(true)
  })

  it('restarts the same track on track end when repeat is one', () => {
    startPlaylist()
    usePlayerStore.getState().setRepeatMode('one')
    usePlayerStore.getState().setCurrentTime(90)

    usePlayerStore.getState().advanceOnTrackEnd()

    expect(usePlayerStore.getState().currentTrack?.id).toBe('first')
    expect(usePlayerStore.getState().currentTime).toBe(0)
    expect(usePlayerStore.getState().isPlaying).toBe(true)
  })
})
