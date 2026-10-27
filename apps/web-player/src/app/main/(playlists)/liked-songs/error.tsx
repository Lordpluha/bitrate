'use client'

import { ErrorState } from '@shared/ui'

/** The design's Liked Songs error state, instead of the generic page error. */
export default function LikedSongsError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      description="Something went wrong on our side. Try again."
      onRetry={reset}
      title="Liked songs could not be loaded"
    />
  )
}
