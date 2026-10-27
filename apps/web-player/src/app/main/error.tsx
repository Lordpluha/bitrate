'use client'

import { ErrorState } from '@shared/ui/ErrorState'

/** A page that failed to render: the design's error copy, never the exception's text. */
export default function MainError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      description="This page could not be loaded. Try again, or head back home."
      onRetry={reset}
    />
  )
}
