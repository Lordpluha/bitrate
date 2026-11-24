/** Message keys the `HttpExceptionFilter` translates — never literal English. */
export const PLAYBACK_ERRORS = {
  SESSION_REQUIRED: 'errors.track.playback_session_required',
  SESSION_ENDED: 'errors.track.playback_session_ended',
  RENDITION_UNAVAILABLE: 'errors.track.rendition_unavailable',
  TOO_MANY_TRACKS: 'errors.track.playback_too_many_tracks',
  KEY_NOT_FOUND: 'errors.track.playback_key_not_found',
  KEY_UNAVAILABLE: 'errors.track.playback_key_unavailable',
} as const
