import { HttpErrorResponse } from '@angular/common/http'

/**
 * Maps a failed `probeAudio` call (the `HEAD` request) to the transloco key of what the operator
 * sees. Distinct from
 * `resourceWriteError` — this is a read, not a write, so there is no take-down/restore
 * wording to reuse. Generic media-playback errors (unsupported rendition, dropped connection)
 * are the `<bitrate-player>` element's own concern — see `@bitrate/player`'s engine.
 */
export function probeAudioErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401) return 'ui.audio.sessionExpired'
    if (error.status === 404) return 'ui.audio.gone'
  }

  return 'ui.audio.failed'
}
