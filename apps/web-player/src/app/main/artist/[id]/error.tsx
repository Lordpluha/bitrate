'use client'

import { ArtistPageState } from '@views/Artist'

/** The design's artist error frame; a 404 from the API shows the not-found frame. */
export default function ArtistError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return <ArtistPageState error={error} onRetry={reset} variant="error" />
}
