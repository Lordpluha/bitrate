import { HttpErrorResponse } from '@angular/common/http'

/** Shown when the `error` event fires with `MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED`. */
export const UNSUPPORTED_RENDITION_MESSAGE = 'This browser cannot play this rendition.'

/**
 * Shown for every other mid-playback `error` — a dropped connection or an access token that
 * expired while the track was playing. The component clears its prepared source so the next
 * Play re-probes rather than retrying a source that may itself be stale.
 */
export const PLAYBACK_STOPPED_MESSAGE = 'Playback stopped — press Play to continue.'

/**
 * Maps a failed `probeAudio` call (the `HEAD` request) to what the operator sees. Distinct from
 * `resourceWriteErrorMessage` — this is a read, not a write, so there is no take-down/restore
 * wording to reuse.
 */
export function probeAudioErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401) return 'Your session has expired — press Play to continue.'
    if (error.status === 404) return 'This rendition is no longer available.'
  }

  return 'Could not start playback — press Play to continue.'
}
