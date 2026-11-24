import type { PlayableTrack } from '@/lib/catalog/playable-track'

import { audioEngine } from './engine'
import { openStream } from './open-stream'
import { PlaybackError } from './playback-error'
import { usePlayerStore } from './player-store'

jest.mock('./engine', () => ({
  audioEngine: {
    setup: jest.fn(),
    load: jest.fn().mockResolvedValue(undefined),
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn().mockResolvedValue(undefined),
    seekTo: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    getPosition: jest.fn().mockResolvedValue(0),
  },
}))
jest.mock('./open-stream', () => ({ openStream: jest.fn() }))

const openStreamMock = jest.mocked(openStream)
const engine = jest.mocked(audioEngine)

const track = (id: string): PlayableTrack => ({
  id,
  title: `Track ${id}`,
  artistName: 'nova',
  artistId: 'a1',
  coverUrl: null,
  durationSec: 180,
})

const queue = [track('1'), track('2'), track('3')]
const flush = () => new Promise((resolve) => setImmediate(resolve))

describe('player store', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    openStreamMock.mockImplementation(async (id) => ({ url: `https://api.test/${id}`, durationSec: 180 }))
    usePlayerStore.getState().stop()
  })

  it('loads and plays the chosen track of a new queue', async () => {
    usePlayerStore.getState().playQueue({ tracks: queue, startIndex: 1, source: { kind: 'feed' } })
    await flush()

    expect(engine.load).toHaveBeenCalledWith(expect.objectContaining({ id: '2', url: 'https://api.test/2' }))
    expect(engine.play).toHaveBeenCalled()
    expect(usePlayerStore.getState().current()?.id).toBe('2')
  })

  it('advances to the next track and stops after the last one', async () => {
    usePlayerStore.getState().playQueue({ tracks: queue, startIndex: 2, source: { kind: 'feed' } })
    await flush()
    usePlayerStore.getState().handleTrackEnded()
    await flush()

    expect(usePlayerStore.getState().index).toBe(2)
    expect(usePlayerStore.getState().status).toBe('paused')
  })

  it('restarts the track instead of going back when past the first seconds', async () => {
    engine.getPosition.mockResolvedValueOnce(42)
    usePlayerStore.getState().playQueue({ tracks: queue, startIndex: 1, source: { kind: 'feed' } })
    await flush()
    await usePlayerStore.getState().previous()

    expect(engine.seekTo).toHaveBeenCalledWith(0)
    expect(usePlayerStore.getState().index).toBe(1)
  })

  it('surfaces a protected track as an error without playing it', async () => {
    openStreamMock.mockRejectedValueOnce(new PlaybackError('protected'))
    usePlayerStore.getState().playQueue({ tracks: queue, startIndex: 0, source: { kind: 'feed' } })
    await flush()

    expect(usePlayerStore.getState().status).toBe('error')
    expect(usePlayerStore.getState().error).toBe('protected')
    expect(engine.play).not.toHaveBeenCalled()
  })

  it('ignores a slow load that a newer selection has replaced', async () => {
    let release: () => void = () => undefined
    openStreamMock.mockImplementationOnce(
      (id) =>
        new Promise((resolve) => {
          release = () => resolve({ url: `https://api.test/${id}`, durationSec: 1 })
        }),
    )
    usePlayerStore.getState().playQueue({ tracks: queue, startIndex: 0, source: { kind: 'feed' } })
    usePlayerStore.getState().playQueue({ tracks: queue, startIndex: 2, source: { kind: 'feed' } })
    await flush()
    release()
    await flush()

    expect(engine.load).toHaveBeenCalledTimes(1)
    expect(engine.load).toHaveBeenCalledWith(expect.objectContaining({ id: '3' }))
  })
})
