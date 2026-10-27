/**
 * The consumer side of `player-context.ts`, for part elements. `$host()` is a compiler macro
 * tied to its `.svelte` file, so each part passes its own host in.
 */
import { PlayerContextRequestEvent } from './player-context'
import type { PlayerController } from './player-controller'

/** The root's tag — duplicated from `index.ts`, which imports this module's importers lazily. */
const ROOT_TAG_NAME = 'bitrate-player'

export type ConnectedPlayer = {
  /** The nearest root's controller, or `null` outside one (the part then renders nothing). */
  readonly current: PlayerController | null
}

/**
 * Asks the nearest `<bitrate-player>` ancestor for its controller. A part upgraded before its
 * root asks again once the root's tag is defined; one with no root at all stays empty.
 */
export function connectPlayer(host: HTMLElement): ConnectedPlayer {
  /** `$state.raw`: the controller is a bag of getters a deep proxy would freeze. */
  let current: PlayerController | null = $state.raw(null)

  const request = () => {
    host.dispatchEvent(
      new PlayerContextRequestEvent((controller) => {
        current = controller
      }),
    )
  }

  request()
  if (!current) {
    void customElements.whenDefined(ROOT_TAG_NAME).then(() => {
      if (!current && host.isConnected) request()
    })
  }

  return {
    get current() {
      return current
    },
  }
}
