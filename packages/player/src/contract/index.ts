/**
 * Public contract for `<bitrate-player>` — types, event names, and a thin client. Zero Svelte
 * imports; this module must stay importable from a server bundle (Next.js, Nitro) with no DOM
 * and no custom-element registry. See `.claude/rules/player-rules.md`.
 */

/**
 * The layout `<bitrate-player>` renders when the host puts no part elements inside it —
 * `bar` (the default: the horizontal desktop bar), `mini` (a compact mobile row), `expanded`
 * (the full-screen now-playing view), `floating` (the small picture-in-picture window), or
 * `none` (no built-in layout; only the parts the host composes). An unknown value falls back
 * to `bar`.
 */
export const BITRATE_PLAYER_CHROMES = ['bar', 'mini', 'expanded', 'floating', 'none'] as const

export type PlayerChrome = (typeof BITRATE_PLAYER_CHROMES)[number]

/**
 * Part elements a host composes inside `<bitrate-player>` to build its own layout. Each reads
 * the state of the nearest `<bitrate-player>` ancestor and renders nothing outside one.
 */
export const BITRATE_PLAYER_PART_TAG = {
  COVER: 'bitrate-player-cover',
  META: 'bitrate-player-meta',
  TRANSPORT: 'bitrate-player-transport',
  SEEK: 'bitrate-player-seek',
  VOLUME: 'bitrate-player-volume',
  ACTIONS: 'bitrate-player-actions',
  QUALITY: 'bitrate-player-quality',
  ERROR: 'bitrate-player-error',
} as const

export type BitratePlayerPartTagName =
  (typeof BITRATE_PLAYER_PART_TAG)[keyof typeof BITRATE_PLAYER_PART_TAG]

/** Controls `<bitrate-player-transport controls="…">` can show, in the order they render. */
export const BITRATE_PLAYER_TRANSPORT_CONTROLS = [
  'shuffle',
  'prev',
  'play',
  'next',
  'repeat',
] as const

export type BitratePlayerTransportControl = (typeof BITRATE_PLAYER_TRANSPORT_CONTROLS)[number]

/** Controls `<bitrate-player-actions controls="…">` can show, in the order they render. */
export const BITRATE_PLAYER_ACTION_CONTROLS = ['like', 'pip', 'queue', 'expand'] as const

export type BitratePlayerActionControl = (typeof BITRATE_PLAYER_ACTION_CONTROLS)[number]

/** `<bitrate-player-cover size="…">` — `sm` 2.5rem, `md` 3.5rem (default), `lg` fills its box. */
export type BitratePlayerCoverSize = 'sm' | 'md' | 'lg'

/** `<bitrate-player-seek variant="…">` — `full` with time readouts (default), `thin` without. */
export type BitratePlayerSeekVariant = 'full' | 'thin'

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
  /** Reflected as the `chrome` attribute; see `PlayerChrome`. */
  chrome: PlayerChrome
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

/**
 * A part whose `controls` attribute narrows which buttons it shows — a space-separated list of
 * control names. Absent, every control is allowed; a control still renders only when the
 * root has its matching `on*` callback (`play` needs none). Unknown names are ignored.
 */
export interface BitratePlayerControlsPartElement extends HTMLElement {
  controls: string | null
}

/** `<bitrate-player-cover>` — the track's cover art, or a placeholder. */
export interface BitratePlayerCoverElement extends HTMLElement {
  size: BitratePlayerCoverSize
}

/** `<bitrate-player-seek>` — the seek slider. */
export interface BitratePlayerSeekElement extends HTMLElement {
  variant: BitratePlayerSeekVariant
}

declare global {
  interface HTMLElementTagNameMap {
    'bitrate-player': BitratePlayerElement
    'bitrate-player-cover': BitratePlayerCoverElement
    'bitrate-player-meta': HTMLElement
    'bitrate-player-transport': BitratePlayerControlsPartElement
    'bitrate-player-seek': BitratePlayerSeekElement
    'bitrate-player-volume': HTMLElement
    'bitrate-player-actions': BitratePlayerControlsPartElement
    'bitrate-player-quality': HTMLElement
    'bitrate-player-error': HTMLElement
  }
}
