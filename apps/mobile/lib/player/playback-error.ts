/** Why a track could not start — each kind has its own user-facing message. */
export type PlaybackErrorKind = 'not-ready' | 'protected' | 'rate-limited' | 'failed'

export class PlaybackError extends Error {
  constructor(readonly kind: PlaybackErrorKind) {
    super(`Playback failed: ${kind}`)
    this.name = 'PlaybackError'
  }
}

/** Any thrown value as a playback error kind. */
export const toPlaybackErrorKind = (error: unknown): PlaybackErrorKind =>
  error instanceof PlaybackError ? error.kind : 'failed'
