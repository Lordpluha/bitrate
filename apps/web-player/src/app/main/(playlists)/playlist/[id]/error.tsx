'use client'

import { PlaylistLoadError } from '@views/Playlist'

/** The design's playlist error frames, chosen by the API status. */
export default function PlaylistError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return <PlaylistLoadError error={error} onRetry={reset} />
}
