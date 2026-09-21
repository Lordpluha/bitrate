import { HttpErrorResponse } from '@angular/common/http'

/**
 * Maps a failed `probeAudio` call (the `HEAD` request) to what the operator sees. Distinct from
 * `resourceWriteErrorMessage` — this is a read, not a write, so there is no take-down/restore
 * wording to reuse. Generic media-playback errors (unsupported rendition, dropped connection)
 * are the `<bitrate-player>` element's own concern — see `@bitrate/player`'s engine.
 */
export function probeAudioErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401) return 'Your session has expired — press Play to continue.'
    if (error.status === 404) return 'This rendition is no longer available.'
  }

  return 'Could not start playback — press Play to continue.'
}
