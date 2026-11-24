import TrackPlayer, { Event } from 'react-native-track-player'

import type { RemoteCommand } from './audio-engine'

type RemoteHandler = (command: RemoteCommand) => void

let handler: RemoteHandler | null = null

/**
 * RNTP delivers lock-screen / notification / headset events to the playback service, which
 * Android keeps alive outside the React tree. The service only forwards them to whichever
 * handler the running app registered.
 */
TrackPlayer.registerPlaybackService(() => async () => {
  TrackPlayer.addEventListener(Event.RemotePlay, () => handler?.({ type: 'play' }))
  TrackPlayer.addEventListener(Event.RemotePause, () => handler?.({ type: 'pause' }))
  TrackPlayer.addEventListener(Event.RemoteNext, () => handler?.({ type: 'next' }))
  TrackPlayer.addEventListener(Event.RemotePrevious, () => handler?.({ type: 'previous' }))
  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => handler?.({ type: 'seek', positionSec: position }))
})

/** Routes remote commands to the app's player store. */
export function registerRemoteControls(next: RemoteHandler): void {
  handler = next
}
