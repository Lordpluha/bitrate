/**
 * Public contract for `<bitrate-player>` — types, event names, and a thin client. Zero Svelte
 * imports; this module must stay importable from a server bundle (Next.js, Nitro) with no DOM
 * and no custom-element registry. See `.claude/rules/player-rules.md`.
 */

/** Which chrome the player renders around its transport controls. */
export type PlayerChrome = 'bar' | 'mini' | 'none'

/** One playable quality a host offers — the element's quality selector is built from these. */
export type BitratePlayerRendition = {
  bitrate: number
  label: string
}

/** What the element asks a host to resolve into a playable URL. */
export type BitratePlayerSourceRequest = {
  bitrate: number | null
}

/**
 * Resolves a `BitratePlayerSourceRequest` into a URL the element assigns to its internal
 * `<audio>` element. A rejection's `Error.message` is shown to the listener as-is, so a host
 * should reject with a message that is already safe to display.
 */
export type BitratePlayerSourceResolver = (request: BitratePlayerSourceRequest) => Promise<string>

/**
 * `source` — the resolver rejected. `unsupported` — the browser cannot decode the loaded
 * source (`MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED`); the source stays loaded. `playback` — the
 * browser refused to start/continue playback (a rejected `HTMLMediaElement.play()`, or any
 * other `MediaError`); the source is dropped so the next `play()` re-resolves. `network` — the
 * browser lost the connection to an already-loaded source; the source is dropped too.
 */
export type BitratePlayerErrorCode = 'source' | 'unsupported' | 'playback' | 'network'

/** Detail carried by the element's `error` event and by `PlaybackEngineState.error`. */
export type BitratePlayerErrorDetail = {
  code: BitratePlayerErrorCode
  message: string
}

/** Detail carried by the element's `qualitychange` event. */
export type BitratePlayerQualityChangeDetail = {
  bitrate: number
}

/**
 * The three states the element's optional repeat control cycles through — mirrors the
 * `apps/web-player` widget's `RepeatMode` domain type without importing it, since the contract
 * cannot depend on a Next.js app.
 */
export type BitratePlayerRepeatMode = 'off' | 'all' | 'one'

/** The custom element's dispatched event names — bubbling, composed, `detail` where noted. */
export const BITRATE_PLAYER_EVENT = {
  PLAY: 'play',
  PAUSE: 'pause',
  ENDED: 'ended',
  ERROR: 'error',
  QUALITY_CHANGE: 'qualitychange',
} as const

export type BitratePlayerEventName =
  (typeof BITRATE_PLAYER_EVENT)[keyof typeof BITRATE_PLAYER_EVENT]

/**
 * The properties and methods a host reads/writes on a `<bitrate-player>` element once it has
 * upgraded. Properties set on the element before `customElements.define()` resolves are not
 * guaranteed to survive the upgrade — a host should `await customElements.whenDefined('bitrate-player')`
 * (or the package's own `defineBitratePlayer()`) before assigning any of these.
 *
 * `artist` through `onQueueOpen` are additive and default to absent (`''` / `false` / `'off'` /
 * `null`) — the element renders web-player's visual language at whatever capability the host
 * supplies. A transport control (previous, next, shuffle, repeat, like, queue, picture-in-picture,
 * expand) renders only when its matching `on*` callback is set; the paired state prop
 * (`isLiked`, `isShuffled`, `repeatMode`) only affects a control that is already showing.
 */
export interface BitratePlayerElement extends HTMLElement {
  renditions: BitratePlayerRendition[]
  resolveSource: BitratePlayerSourceResolver | null
  trackTitle: string
  artist: string
  coverUrl: string
  isLiked: boolean
  isShuffled: boolean
  repeatMode: BitratePlayerRepeatMode
  onNext: (() => void) | null
  onPrevious: (() => void) | null
  onLikeToggle: (() => void) | null
  onShuffleToggle: (() => void) | null
  onRepeatToggle: (() => void) | null
  onExpand: (() => void) | null
  onPictureInPicture: (() => void) | null
  onQueueOpen: (() => void) | null
  play(): Promise<void>
  pause(): void
}

declare global {
  interface HTMLElementTagNameMap {
    'bitrate-player': BitratePlayerElement
  }
}
