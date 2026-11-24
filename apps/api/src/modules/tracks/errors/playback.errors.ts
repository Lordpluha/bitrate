/** Message keys the `HttpExceptionFilter` translates — never literal English. */
export const PLAYBACK_ERRORS = {
  SESSION_REQUIRED: 'errors.track.playback_session_required',
  SESSION_ENDED: 'errors.track.playback_session_ended',
  RENDITION_UNAVAILABLE: 'errors.track.rendition_unavailable',
  TOO_MANY_TRACKS: 'errors.track.playback_too_many_tracks',
} as const
