'use client'

import { ErrorState } from '@shared/ui/ErrorState'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-dvh bg-background p-4 text-text">
      <ErrorState
        description={
          error.message ||
          'Something went wrong on our side. Try again, or head back home.'
        }
        onRetry={reset}
      />
    </div>
  )
}
