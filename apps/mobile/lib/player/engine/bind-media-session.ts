import type { RemoteCommand } from './audio-engine'

/** Hardware media keys and the browser's media controls, forwarded like native remote events. */
export function bindMediaSession(onCommand: (command: RemoteCommand) => void): void {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
  const session = navigator.mediaSession
  session.setActionHandler('play', () => onCommand({ type: 'play' }))
  session.setActionHandler('pause', () => onCommand({ type: 'pause' }))
  session.setActionHandler('nexttrack', () => onCommand({ type: 'next' }))
  session.setActionHandler('previoustrack', () => onCommand({ type: 'previous' }))
  session.setActionHandler('seekto', (details) => {
    if (details.seekTime !== undefined) onCommand({ type: 'seek', positionSec: details.seekTime })
  })
}
