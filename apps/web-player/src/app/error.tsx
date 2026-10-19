'use client'

import { ROUTES } from '@shared/routes'
import { Logo } from '@shared/ui'
import { ErrorState } from '@shared/ui/ErrorState'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4 text-foreground">
      <Logo href={ROUTES.main} wordmark />
      <ErrorState
        className="min-h-0 flex-none"
        description={
          error.message ||
          'Something went wrong on our side. Try again, or head back home.'
        }
        onRetry={reset}
      />
    </div>
  )
}
