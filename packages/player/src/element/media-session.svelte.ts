/**
 * The Media Session integration of a playing `<bitrate-player>`: the title, artist and cover on
 * the lock screen and in the OS media controls, and the hardware/headset keys wired to the
 * element. Opt-in through the root's `mediaSession` prop — a page with several players must
 * pick the one that owns the session.
 */
import type { PlayerController } from './player-controller'

/** How far the OS "skip back/forward" buttons move when they pass no offset of their own. */
const SKIP_SECONDS = 10

type MediaSessionLike = Pick<
  MediaSession,
  'metadata' | 'playbackState' | 'setActionHandler' | 'setPositionState'
>

type MediaSessionHandlers = {
  play: () => void
  pause: () => void
  seekTo: (seconds: number) => void
}

export type CreateMediaSessionInput = {
  getEnabled: () => boolean
  getController: () => PlayerController
  handlers: MediaSessionHandlers
}

const ACTIONS: MediaSessionAction[] = [
  'play',
  'pause',
  'previoustrack',
  'nexttrack',
  'seekto',
  'seekbackward',
  'seekforward',
]

function sessionOf(): MediaSessionLike | null {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return null
  return navigator.mediaSession
}

/** Clears every handler this module set, so a disabled or removed player leaves nothing behind. */
function clearHandlers(session: MediaSessionLike): void {
  for (const action of ACTIONS) {
    try {
      session.setActionHandler(action, null)
    } catch {
      /** An action this browser does not support was never set either. */
    }
  }
}

export function createMediaSession({
  getEnabled,
  getController,
  handlers,
}: CreateMediaSessionInput) {
  $effect(() => {
    const session = sessionOf()
    if (!session || !getEnabled()) return

    const controller = getController()
    const bind = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
      try {
        session.setActionHandler(action, handler)
      } catch {
        /** Not supported here; the remaining actions still work. */
      }
    }

    bind('play', () => handlers.play())
    bind('pause', () => handlers.pause())
    bind('seekto', (details) => {
      if (details.seekTime !== undefined) handlers.seekTo(details.seekTime)
    })
    bind('seekbackward', (details) =>
      handlers.seekTo(Math.max(0, controller.currentTime - (details.seekOffset ?? SKIP_SECONDS))),
    )
    bind('seekforward', (details) =>
      handlers.seekTo(
        Math.min(
          controller.duration,
          controller.currentTime + (details.seekOffset ?? SKIP_SECONDS),
        ),
      ),
    )

    return () => clearHandlers(session)
  })

  /** Track buttons follow the host's callbacks: no `onNext`, no OS "next". */
  $effect(() => {
    const session = sessionOf()
    if (!session || !getEnabled()) return
    const { onNext, onPrevious } = getController().callbacks
    try {
      session.setActionHandler('nexttrack', onNext ? () => onNext() : null)
      session.setActionHandler('previoustrack', onPrevious ? () => onPrevious() : null)
    } catch {
      /** Not supported here. */
    }
  })

  $effect(() => {
    const session = sessionOf()
    if (!session || !getEnabled() || typeof MediaMetadata === 'undefined') return
    const { trackTitle, artist, coverUrl } = getController()
    session.metadata = new MediaMetadata({
      title: trackTitle,
      artist,
      artwork: coverUrl ? [{ src: coverUrl }] : [],
    })
  })

  $effect(() => {
    const session = sessionOf()
    if (!session || !getEnabled()) return
    const { playing, duration, currentTime } = getController()
    session.playbackState = playing ? 'playing' : 'paused'
    if (duration <= 0) return
    try {
      session.setPositionState({
        duration,
        playbackRate: 1,
        position: Math.min(currentTime, duration),
      })
    } catch {
      /** An inconsistent position is reported on the next change instead. */
    }
  })

  $effect(() => {
    const session = sessionOf()
    if (!session || !getEnabled()) return
    return () => {
      session.metadata = null
      session.playbackState = 'none'
    }
  })
}
