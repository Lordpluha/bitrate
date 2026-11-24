import { isTauri } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'

/**
 * Events the native shell pushes to the renderer. The names and payloads are the contract with
 * `src-tauri/src/events.rs`; change both sides together.
 */
const PLAYBACK_EVENT = 'bitrate://playback'
const NAVIGATE_EVENT = 'bitrate://navigate'

/** A playback command from the tray menu. */
export type PlaybackCommand = 'toggle' | 'next' | 'previous'

const PLAYBACK_COMMANDS: readonly PlaybackCommand[] = ['toggle', 'next', 'previous']

const isPlaybackCommand = (value: unknown): value is PlaybackCommand =>
  PLAYBACK_COMMANDS.some((command) => command === value)

/** No-op unsubscribe for a renderer running in a plain browser (`pnpm dev` without Tauri). */
const noop: UnlistenFn = () => undefined

/** Calls `onCommand` for each tray playback command; resolves to the unsubscribe function. */
export const onPlaybackCommand = async (
  onCommand: (command: PlaybackCommand) => void,
): Promise<UnlistenFn> => {
  if (!isTauri()) return noop
  return listen<unknown>(PLAYBACK_EVENT, ({ payload }) => {
    if (isPlaybackCommand(payload)) onCommand(payload)
  })
}

/**
 * Calls `onNavigate` with the in-app path of each `bitrate://` deep link. Rust has already
 * mapped and validated it; the renderer still accepts only a same-origin absolute path.
 */
export const onNavigateRequest = async (
  onNavigate: (path: string) => void,
): Promise<UnlistenFn> => {
  if (!isTauri()) return noop
  return listen<unknown>(NAVIGATE_EVENT, ({ payload }) => {
    if (typeof payload === 'string' && /^\/(?!\/)/.test(payload)) {
      onNavigate(payload)
    }
  })
}
