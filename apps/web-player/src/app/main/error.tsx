'use client'

import { ErrorState } from '@shared/ui/ErrorState'

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorState
      description={
        error.message ||
        'This page could not be loaded. Try again, or head back home.'
      }
      onRetry={reset}
    />
  )
}
