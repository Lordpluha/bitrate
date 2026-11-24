import type { UnlistenFn } from '@tauri-apps/api/event'
import { useEffect } from 'react'
import { router } from '../app/router/router'
import { onNavigateRequest, onPlaybackCommand } from './nativeEvents'
import { runPlaybackCommand } from './runPlaybackCommand'

const subscribe = (subscriptions: Promise<UnlistenFn>[]) => () => {
  for (const subscription of subscriptions) {
    void subscription.then((unlisten) => unlisten())
  }
}

/**
 * Connects the native shell to the renderer: tray playback commands drive the player store,
 * and deep links navigate the router without reloading (playback keeps going). Renders nothing.
 */
export const NativeBridge = () => {
  useEffect(
    () =>
      subscribe([
        onPlaybackCommand(runPlaybackCommand),
        onNavigateRequest((path) => router.history.push(path)),
      ]),
    [],
  )

  return null
}
