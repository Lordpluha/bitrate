/** Audio a session may receive ahead of real time: the player's buffer plus switches and seeks. */
export const PACING_ALLOWANCE_MS = 60_000

/** The session asked for more audio than real time allows; retry after this many seconds. */
export class PlaybackPacingError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super('Playback is ahead of real time')
  }
}
