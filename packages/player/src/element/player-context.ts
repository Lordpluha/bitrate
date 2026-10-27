/**
 * How a part element finds the `<bitrate-player>` it belongs to — the community Context
 * Protocol shape (`context-request`, bubbling and composed), so a part works the same in the
 * host's light DOM and inside the root's own shadow tree, and the nearest root answers first.
 * Element-only: the contract stays free of DOM classes.
 */
import type { PlayerController } from './player-controller'

export const PLAYER_CONTEXT = 'bitrate-player'

export const CONTEXT_REQUEST_EVENT = 'context-request'

type PlayerContextCallback = (controller: PlayerController) => void

/** Dispatched by a part element on connect; the nearest root calls `callback` with its controller. */
export class PlayerContextRequestEvent extends Event {
  readonly context = PLAYER_CONTEXT
  readonly callback: PlayerContextCallback

  constructor(callback: PlayerContextCallback) {
    super(CONTEXT_REQUEST_EVENT, { bubbles: true, composed: true })
    this.callback = callback
  }
}

/** A root element once `withPlayerProvider` has extended it. */
export type PlayerProviderHost = HTMLElement & {
  providePlayer: (controller: PlayerController) => void
}

export function isPlayerProviderHost(element: HTMLElement): element is PlayerProviderHost {
  return 'providePlayer' in element && typeof element.providePlayer === 'function'
}

function isPlayerContextRequest(event: Event): event is PlayerContextRequestEvent {
  return event instanceof PlayerContextRequestEvent && event.context === PLAYER_CONTEXT
}

type ElementConstructor = new () => HTMLElement

/**
 * Extends the root's compiled custom-element class with the provider side. The listener is
 * attached in the constructor — at upgrade, before any child part connects — while the
 * controller only exists once the Svelte component mounts a microtask later, so requests that
 * arrive in between are queued and answered by `providePlayer`.
 */
export function withPlayerProvider(Base: ElementConstructor): new () => PlayerProviderHost {
  return class extends Base {
    #controller: PlayerController | null = null
    #pending: PlayerContextCallback[] = []

    constructor() {
      super()
      this.addEventListener(CONTEXT_REQUEST_EVENT, (event) => {
        if (!isPlayerContextRequest(event)) return
        event.stopPropagation()
        if (this.#controller) event.callback(this.#controller)
        else this.#pending.push(event.callback)
      })
    }

    providePlayer(controller: PlayerController): void {
      this.#controller = controller
      const pending = this.#pending
      this.#pending = []
      for (const callback of pending) callback(controller)
    }
  }
}
