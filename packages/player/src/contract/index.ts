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

/**
 * `<bitrate-player-seek variant="…">` — `full` with the time either side (default), `stacked`
 * with the time under the rail, `thin` without it.
 */
export type BitratePlayerSeekVariant = 'full' | 'stacked' | 'thin'

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

/**
 * Fragment entry of the single-file CMAF manifest (ADR-0020):
 * `[startTicks, durationTicks, offset, length]`, offsets absolute inside the rendition file.
 */
type ManifestFragment = readonly [
  startTicks: number,
  durationTicks: number,
  offset: number,
  length: number,
]

/** One rendition of a CMAF manifest — one file, fetched fragment by fragment. */
export type ManifestRendition = {
  bitrate: number
  codec: string
  size: number
  /** Inclusive byte range of the MSE initialization segment (`ftyp`+`moov`). */
  initRange: readonly [number, number]
  fragments: readonly ManifestFragment[]
}

/** The manifest the API serves at `/tracks/{id}/manifest`. */
export type TrackManifest = {
  version: 1
  timescale: number
  durationTicks: number
  durationMs: number
  renditions: readonly ManifestRendition[]
}

/**
 * One track the streaming element plays or prefetches. `key` identifies this *play* of the
 * track — the same track queued twice gets two keys — and is what the element reports back in
 * `statechange` and `ended`, and what the saved position is stored under.
 */
export type BitratePlayerSource = {
  key: string
  trackId: string
  /** The plain audio file, the last fallback when neither CMAF nor HLS can play. */
  progressiveUrl: string
  /** The track's length in seconds, shown until the media reports its own. */
  duration?: number
  /**
   * Where a restored play left off, in seconds: shown until the media loads, and resumed from
   * when the position store has nothing newer for this key.
   */
  startTime?: number
}

/** One byte range of one rendition, as the CMAF loader asks for it. */
export type BitratePlayerFetchRangeInput = {
  trackId: string
  bitrate: number
  /** The rendition file's size from the manifest, for validating `Content-Range`. */
  expectedSize: number
  range: readonly [number, number]
  signal: AbortSignal
}

/**
 * Plays a track with no CMAF manifest (or no MSE) through the host's own legacy chain, such as
 * hls.js and then the progressive file. The adapter owns that whole chain and calls
 * `onFatalError` only once nothing in it can play.
 */
export type BitratePlayerLegacyAdapter = (input: {
  media: HTMLMediaElement
  /** The play's key, for saving the position across the adapter's own fallbacks. */
  key: string
  trackId: string
  progressiveUrl: string
  isPrefetch: boolean
  onFatalError: () => void
}) => { destroy: () => void }

/** Where the element keeps each play's resume position (web-player: `sessionStorage`). */
export type BitratePlayerPositionStore = {
  save: (key: string, seconds: number) => void
  restore: (key: string) => number | null
  remove: (key: string) => void
}

/**
 * Everything the streaming element needs from its host to play `source` and prefetch `next`:
 * the manifest and byte ranges over the host's own authenticated client, an optional legacy
 * adapter, resume storage, and whether the connection is constrained (data saver, 2G/3G).
 */
export type BitratePlayerStreaming = {
  /** The track's CMAF manifest, or `null` for a track that has none. */
  resolveManifest: (trackId: string) => Promise<TrackManifest | null>
  fetchRange: (input: BitratePlayerFetchRangeInput) => Promise<ArrayBuffer>
  legacy?: BitratePlayerLegacyAdapter
  positions?: BitratePlayerPositionStore
  isConstrained?: () => boolean
  /** `crossorigin` for both media elements, e.g. `use-credentials` for cookie-authed media. */
  crossOrigin?: 'anonymous' | 'use-credentials'
}

/** `status` of the streaming element; `idle` until a source is set. */
export type BitratePlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

/** Detail of the `statechange` event — the element's playback state after every change. */
export type BitratePlayerStateDetail = {
  status: BitratePlayerStatus
  /** The `key` of the source being heard, or `null`. */
  key: string | null
  currentTime: number
  /** The media duration, or 0 while unknown. */
  duration: number
  volume: number
  muted: boolean
  /** The CMAF rendition being downloaded, or `null` off the CMAF path. */
  bitrate: number | null
  /** The bitrates the current CMAF track offers, lowest first; empty off the CMAF path. */
  renditions: number[]
  /** Whether adaptive bitrate picks the rendition, as opposed to the listener's pin. */
  autoBitrate: boolean
  error: BitratePlayerErrorDetail | null
}

/** Detail of `ended` on the streaming element: which play just finished. */
export type BitratePlayerEndedDetail = {
  key: string
}

/**
 * Every accessible name and visible label the element renders, so a host can supply its own
 * translations. Set `labels` to any subset; the rest keep their English defaults.
 */
export type BitratePlayerLabels = {
  /** The Play button's name for the current track ('' when no title is known). */
  play: (trackTitle: string) => string
  pause: (trackTitle: string) => string
  preparing: string
  previous: string
  next: string
  enableShuffle: string
  disableShuffle: string
  /** The repeat button's name for each mode — what pressing it does next. */
  repeat: Record<BitratePlayerRepeatMode, string>
  like: string
  unlike: string
  mute: string
  unmute: string
  volume: string
  seek: string
  openFloating: string
  openQueue: string
  openFull: string
  quality: string
  /** The quality select's adaptive option. */
  qualityAuto: string
  /** A rendition in the quality select, from its bitrate in kbps. */
  qualityOption: (kbps: number) => string
}

/** What a host sets on `labels`: any subset, including part of `repeat`. */
export type BitratePlayerLabelOverrides = Partial<Omit<BitratePlayerLabels, 'repeat'>> & {
  repeat?: Partial<Record<BitratePlayerRepeatMode, string>>
}

/** The custom element's dispatched event names — bubbling, composed, `detail` where noted. */
export const BITRATE_PLAYER_EVENT = {
  PLAY: 'play',
  PAUSE: 'pause',
  ENDED: 'ended',
  ERROR: 'error',
  QUALITY_CHANGE: 'qualitychange',
  STATE_CHANGE: 'statechange',
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
  /**
   * Switches the element to streaming mode: two media elements, the CMAF path with adaptive
   * bitrate, prefetch of `next` and an instant switch when `source` becomes it. Without it the
   * element keeps the `resolveSource` path.
   */
  streaming: BitratePlayerStreaming | null
  /** What plays now (streaming mode). Setting the key `next` held switches instantly. */
  source: BitratePlayerSource | null
  /** What to prefetch once the current track is near its end (streaming mode). */
  next: BitratePlayerSource | null
  volume: number
  muted: boolean
  /** Renders and controls another `<bitrate-player>` instead of playing anything itself. */
  mirror: BitratePlayerElement | null
  /**
   * Reflected as `media-session`: show this element's track on the lock screen and in the OS
   * media controls, and answer the media keys. Set it on the one element that plays.
   */
  mediaSession: boolean
  /** Translations for the element's labels; a mirror uses the labels of the root it mirrors. */
  labels: BitratePlayerLabelOverrides | null
  /** The current playback state; `statechange` fires whenever it changes. */
  readonly state: BitratePlayerStateDetail
  play(): Promise<void>
  pause(): void
  seek(seconds: number): void
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
