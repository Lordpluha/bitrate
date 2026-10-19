import { describe, expect, it } from 'vitest'
import type { PlayerSnapshot } from '@/entities/Player'
import { track } from '../__tests__/track.fixture'
import {
  describeBrowser,
  fromServerPlayer,
  SERVER_QUEUE_LIMIT,
  toServerPlayerUpdate,
  toServerQueue,
} from './playerSync'

const snapshot = (overrides: Partial<PlayerSnapshot> = {}): PlayerSnapshot => ({
  currentPlaylistId: 'playlist-1',
  currentPlaylistName: 'Mix',
  currentQueueId: null,
  currentTime: 42.6,
  currentTrack: track('b'),
  currentTrackIndex: 1,
  duration: 200,
  isPlaying: true,
  isShuffled: false,
  playbackSequence: 3,
  playlist: [track('a'), track('b'), track('c')],
  progress: 21,
  queue: [],
  repeatMode: 'all',
  volume: 1,
  ...overrides,
})

describe('toServerPlayerUpdate', () => {
  it('sends the track, position in ms, play state and repeat mode of this device', () => {
    expect(
      toServerPlayerUpdate({ deviceId: 'device-1', snapshot: snapshot() }),
    ).toEqual({
      currentTrackId: 'b',
      deviceId: 'device-1',
      isPlaying: true,
      positionMs: 42_600,
      repeatMode: 'context',
      shuffle: false,
    })
  })

  it('maps repeat-one to the server "track" mode', () => {
    expect(
      toServerPlayerUpdate({
        deviceId: 'd',
        snapshot: snapshot({ repeatMode: 'one' }),
      }).repeatMode,
    ).toBe('track')
  })
})

describe('toServerQueue', () => {
  it('is the ordered track ids of the playing list', () => {
    expect(toServerQueue({ snapshot: snapshot() })).toEqual({
      trackIds: ['a', 'b', 'c'],
    })
  })

  it('keeps a window that holds the current track when the list exceeds the server limit', () => {
    const playlist = Array.from({ length: 600 }, (_, index) =>
      track(`t${index}`),
    )
    const { trackIds } = toServerQueue({
      snapshot: snapshot({
        currentTrack: track('t550'),
        currentTrackIndex: 550,
        playlist,
      }),
    })

    expect(trackIds).toHaveLength(SERVER_QUEUE_LIMIT)
    expect(trackIds[0]).toBe('t100')
    expect(trackIds).toContain('t550')
  })

  it('falls back to the current track when nothing else is listed', () => {
    expect(
      toServerQueue({
        snapshot: snapshot({ playlist: [], currentTrack: track('solo') }),
      }),
    ).toEqual({ trackIds: ['solo'] })
  })
})

describe('fromServerPlayer', () => {
  it('restores the queue paused at the saved position', () => {
    const session = fromServerPlayer({
      currentTrack: track('b'),
      positionMs: 42_600,
      queue: [
        { track: track('a') },
        { track: track('b') },
        { track: track('c') },
      ],
      repeatMode: 'track',
      shuffle: true,
    })

    expect(session).toMatchObject({
      currentTime: 42.6,
      currentTrackIndex: 1,
      isShuffled: true,
      repeatMode: 'one',
    })
    expect(session?.currentTrack?.id).toBe('b')
    expect(session?.playlist?.map(({ id }) => id)).toEqual(['a', 'b', 'c'])
  })

  it('has nothing to restore without a current track', () => {
    expect(
      fromServerPlayer({
        currentTrack: null,
        positionMs: 0,
        queue: [],
        repeatMode: 'off',
        shuffle: false,
      }),
    ).toBeNull()
  })

  it('keeps a current track that is missing from the saved queue', () => {
    const session = fromServerPlayer({
      currentTrack: track('x'),
      positionMs: 0,
      queue: [{ track: track('a') }],
      repeatMode: 'off',
      shuffle: false,
    })

    expect(session?.playlist?.map(({ id }) => id)).toEqual(['x'])
    expect(session?.currentTrackIndex).toBe(0)
  })
})

describe('describeBrowser', () => {
  it('names the browser and operating system', () => {
    expect(
      describeBrowser(
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
      ),
    ).toBe('Chrome on Linux')
    expect(
      describeBrowser(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
      ),
    ).toBe('Safari on macOS')
    expect(
      describeBrowser(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36 Edg/140.0',
      ),
    ).toBe('Edge on Windows')
  })

  it('falls back to a generic name', () => {
    expect(describeBrowser('curl/8.0')).toBe('Web browser')
  })
})
