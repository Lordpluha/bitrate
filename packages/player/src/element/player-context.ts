/**
 * How a part element finds the `<bitrate-player>` it belongs to — the community Context
 * Protocol shape (`context-request`, bubbling and composed), so a part works the same in the
 * host's light DOM and inside the root's own shadow tree, and the nearest root answers first.
 * Element-only: the contract stays free of DOM classes.
 */
import type { BitratePlayerStateDetail } from '../contract'
import type { PlayerController } from './player-controller'

const PLAYER_CONTEXT = 'bitrate-player'

const CONTEXT_REQUEST_EVENT = 'context-request'

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

/** The playback methods the root's component hands its host element. */
export type HostTransport = {
  play: () => Promise<void>
  pause: () => void
  seek: (seconds: number) => void
}

/** A root element once `withPlayerProvider` has extended it. */
export type PlayerProviderHost = HTMLElement & {
  play: () => Promise<void>
  pause: () => void
  seek: (seconds: number) => void
  /** Binds the host methods above to the component's engine; later calls replace parts of it. */
  provideTransport: (transport: Partial<HostTransport>) => void
  /** Hands every subscriber this controller, now and after any later `providePlayer`. */
  providePlayer: (controller: PlayerController) => void
  /**
   * Subscribes to this root's controller directly, without an event — how a mirror reaches
   * the root it mirrors, which need not be its ancestor or even in its document.
   */
  requestPlayer: (callback: PlayerContextCallback) => void
  /** Where the host's `state` getter reads from. */
  provideState: (read: () => BitratePlayerStateDetail) => void
  readonly state: BitratePlayerStateDetail | null
}

export function isPlayerProviderHost(element: unknown): element is PlayerProviderHost {
  return (
    typeof element === 'object' &&
    element !== null &&
    'providePlayer' in element &&
    typeof element.providePlayer === 'function' &&
    'requestPlayer' in element &&
    typeof element.requestPlayer === 'function'
  )
}

function isPlayerContextRequest(event: Event): event is PlayerContextRequestEvent {
  return event instanceof PlayerContextRequestEvent && event.context === PLAYER_CONTEXT
}

type ElementConstructor = new () => HTMLElement

/**
 * Extends the root's compiled custom-element class with the provider side. The listener is
 * attached in the constructor — at upgrade, before any child part connects — while the
 * controller only exists once the Svelte component mounts a microtask later, so a request that
 * arrives in between is answered by `providePlayer`. Subscribers are kept, so a root that
 * starts mirroring another hands its parts the mirrored controller.
 */
export function withPlayerProvider(Base: ElementConstructor): new () => PlayerProviderHost {
  return class extends Base {
    #controller: PlayerController | null = null
    #subscribers: PlayerContextCallback[] = []
    #readState: (() => BitratePlayerStateDetail) | null = null
    #transport: Partial<HostTransport> = {}
    /**
     * Svelte mounts the component a microtask after the element connects, so a host that calls
     * `play()` from a ref callback reaches the element before any engine exists. The last
     * intent and seek are kept and replayed once the component provides its transport.
     */
    #pendingIntent: 'play' | 'pause' | null = null
    #pendingSeek: number | null = null

    play(): Promise<void> {
      if (this.#transport.play) return this.#transport.play()
      this.#pendingIntent = 'play'
      return Promise.resolve()
    }

    pause(): void {
      if (this.#transport.pause) this.#transport.pause()
      else this.#pendingIntent = 'pause'
    }

    seek(seconds: number): void {
      if (this.#transport.seek) this.#transport.seek(seconds)
      else this.#pendingSeek = seconds
    }

    provideTransport(transport: Partial<HostTransport>): void {
      this.#transport = { ...this.#transport, ...transport }
      if (this.#pendingSeek !== null && this.#transport.seek) {
        this.#transport.seek(this.#pendingSeek)
        this.#pendingSeek = null
      }
      if (this.#pendingIntent === 'play' && this.#transport.play) {
        void this.#transport.play()
        this.#pendingIntent = null
      } else if (this.#pendingIntent === 'pause' && this.#transport.pause) {
        this.#transport.pause()
        this.#pendingIntent = null
      }
    }

    constructor() {
      super()
      this.addEventListener(CONTEXT_REQUEST_EVENT, (event) => {
        if (!isPlayerContextRequest(event)) return
        event.stopPropagation()
        this.requestPlayer(event.callback)
      })
    }

    get state(): BitratePlayerStateDetail | null {
      return this.#readState?.() ?? null
    }

    requestPlayer(callback: PlayerContextCallback): void {
      this.#subscribers.push(callback)
      if (this.#controller) callback(this.#controller)
    }

    providePlayer(controller: PlayerController): void {
      if (this.#controller === controller) return
      this.#controller = controller
      for (const callback of this.#subscribers) callback(controller)
    }

    provideState(read: () => BitratePlayerStateDetail): void {
      this.#readState = read
    }
  }
}
