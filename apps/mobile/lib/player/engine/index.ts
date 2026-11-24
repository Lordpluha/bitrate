import TrackPlayer, { AppKilledPlaybackBehavior, Capability, Event, State } from 'react-native-track-player'

import type { AudioEngine, EngineEvents, EngineState } from './audio-engine'
import { registerRemoteControls } from './register-remote-controls'

/** RNTP states the store cares about; `Ready`/`None` carry no news for it. */
const STATE_MAP: Partial<Record<State, EngineState>> = {
  [State.Playing]: 'playing',
  [State.Paused]: 'paused',
  [State.Stopped]: 'paused',
  [State.Buffering]: 'buffering',
  [State.Loading]: 'buffering',
  [State.Ended]: 'ended',
  [State.Error]: 'error',
}

let ready: Promise<void> | null = null

async function initialise(events: EngineEvents): Promise<void> {
  try {
    await TrackPlayer.setupPlayer({ autoHandleInterruptions: true })
  } catch (error) {
    // Fast refresh re-runs this module while the native player stays initialised.
    if (!String(error).includes('already been initialized')) throw error
  }
  await TrackPlayer.updateOptions({
    capabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious, Capability.SeekTo],
    android: { appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification },
  })
  registerRemoteControls(events.onRemoteCommand)
  TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
    const mapped = STATE_MAP[state]
    if (mapped) events.onStateChange(mapped)
  })
}

/** react-native-track-player: native audio with lock-screen and notification controls. */
export const audioEngine: AudioEngine = {
  setup: (events) => {
    ready ??= initialise(events)
    return ready
  },
  load: async (track) => {
    await ready
    await TrackPlayer.load({
      id: track.id,
      url: track.url,
      title: track.title,
      artist: track.artist,
      artwork: track.artworkUrl ?? undefined,
      duration: track.durationSec,
      contentType: 'audio/mp4',
    })
  },
  play: () => TrackPlayer.play(),
  pause: () => TrackPlayer.pause(),
  seekTo: (positionSec) => TrackPlayer.seekTo(positionSec),
  stop: async () => {
    if (ready) await TrackPlayer.reset()
  },
  getPosition: async () => (await TrackPlayer.getProgress()).position,
}
