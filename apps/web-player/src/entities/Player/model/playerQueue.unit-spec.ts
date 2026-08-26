import { beforeEach, describe, expect, it } from 'vitest'
import {
  first,
  fourth,
  second,
  startPlaylist,
  third,
} from './__tests__/playerTracks.fixtures'
import { usePlayerStore } from './playerStore'
import { resolvePlaybackTransition } from './playerStore.utils'

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
    expect(usePlayerStore.getState().currentTrackIndex).toBe(0)

    usePlayerStore.getState().changeTrack('next')

    expect(usePlayerStore.getState().currentTrack?.id).toBe('second')
    expect(usePlayerStore.getState().currentTrackIndex).toBe(1)
  })

  it('drains multiple queued tracks before resuming the playlist', () => {
    startPlaylist()
    usePlayerStore.getState().addToQueue(third)
    usePlayerStore.getState().addToQueue(fourth)

    usePlayerStore.getState().advanceOnTrackEnd()
    expect(usePlayerStore.getState().currentTrack?.id).toBe('third')

    usePlayerStore.getState().advanceOnTrackEnd()
    expect(usePlayerStore.getState().currentTrack?.id).toBe('fourth')

    usePlayerStore.getState().advanceOnTrackEnd()
    expect(usePlayerStore.getState().currentTrack?.id).toBe('second')
    expect(usePlayerStore.getState().currentQueueId).toBeNull()
  })

  it('keeps the interrupted playlist cursor when the context is reordered', () => {
    startPlaylist()
    usePlayerStore.getState().addToQueue(third)
    usePlayerStore.getState().changeTrack('next')

    usePlayerStore.getState().setPlaylistTracks([second, first, fourth])
    usePlayerStore.getState().changeTrack('next')

    expect(usePlayerStore.getState().currentTrack?.id).toBe('fourth')
    expect(usePlayerStore.getState().currentTrackIndex).toBe(2)
  })

  it('resumes a persisted queue and then its interrupted playlist', () => {
    usePlayerStore.getState().restorePlayerSession({
      currentPlaylistId: 'playlist-1',
      currentPlaylistName: 'Playlist',
      currentQueueId: 'current-queue-item',
      currentTrack: third,
      currentTrackIndex: 0,
      playbackSequence: 7,
      playlist: [first, second],
      queue: [{ queueId: 'next-queue-item', track: fourth }],
    })

    usePlayerStore.getState().advanceOnTrackEnd()
    expect(usePlayerStore.getState().currentTrack?.id).toBe('fourth')
    expect(usePlayerStore.getState().playbackSequence).toBe(8)

    usePlayerStore.getState().advanceOnTrackEnd()
    expect(usePlayerStore.getState().currentTrack?.id).toBe('second')
    expect(usePlayerStore.getState().currentQueueId).toBeNull()
  })

  it('plays a queue after a standalone track', () => {
    usePlayerStore.getState().play(first)
    usePlayerStore.getState().addToQueue(third)

    usePlayerStore.getState().advanceOnTrackEnd()

    expect(usePlayerStore.getState().currentTrack?.id).toBe('third')
    expect(usePlayerStore.getState().isPlaying).toBe(true)
  })

  it('keeps queued copies of the same track as distinct playback instances', () => {
    startPlaylist()
    const initialSequence = usePlayerStore.getState().playbackSequence
    usePlayerStore.getState().addToQueue(first)

    const transition = resolvePlaybackTransition(
      usePlayerStore.getState(),
      'next',
      'ended',
    )
    expect(transition).toMatchObject({
      kind: 'track',
      playbackSequence: initialSequence + 1,
      track: first,
    })

    usePlayerStore.getState().advanceOnTrackEnd()

    expect(usePlayerStore.getState()).toMatchObject({
      currentTrack: first,
      currentTrackIndex: 0,
      playbackSequence: initialSequence + 1,
    })
  })

  it('uses the same queued candidate for preview and committed transition', () => {
    startPlaylist()
    usePlayerStore.getState().addToQueue(third)
    const candidate = resolvePlaybackTransition(
      usePlayerStore.getState(),
      'next',
      'ended',
    )

    usePlayerStore.getState().advanceOnTrackEnd()

    expect(candidate?.kind).toBe('track')
    if (candidate?.kind !== 'track') return
    expect(usePlayerStore.getState()).toMatchObject({
      currentTrack: candidate.track,
      currentTrackIndex: candidate.currentTrackIndex,
      playbackSequence: candidate.playbackSequence,
    })
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

  it('resolves stop instead of wrapping prefetch at the end with repeat off', () => {
    startPlaylist()
    usePlayerStore.getState().changeTrack('next')

    expect(
      resolvePlaybackTransition(usePlayerStore.getState(), 'next', 'ended'),
    ).toEqual({ kind: 'stop' })
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

  it('keeps the queue for repeat-one endings but honors manual next', () => {
    startPlaylist()
    usePlayerStore.getState().addToQueue(third)
    usePlayerStore.getState().setRepeatMode('one')

    usePlayerStore.getState().advanceOnTrackEnd()
    expect(usePlayerStore.getState().currentTrack?.id).toBe('first')
    expect(usePlayerStore.getState().queue).toHaveLength(1)

    usePlayerStore.getState().changeTrack('next')
    expect(usePlayerStore.getState().currentTrack?.id).toBe('third')
    expect(usePlayerStore.getState().queue).toHaveLength(0)
  })
})
