import { usePlayerStore } from '@entities/Player'
import type { PlaybackCommand } from './nativeEvents'

/** Applies a tray playback command to the same store the on-screen controls use. */
export const runPlaybackCommand = (command: PlaybackCommand) => {
  const player = usePlayerStore.getState()
  if (!player.currentTrack) return

  if (command === 'toggle') player.togglePlay()
  else player.changeTrack(command === 'next' ? 'next' : 'prev')
}
