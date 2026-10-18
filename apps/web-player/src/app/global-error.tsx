'use client'

import * as Sentry from '@sentry/nextjs'
import { Power } from 'lucide-react'
import { useEffect } from 'react'

export type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        <span className="flex size-18 items-center justify-center rounded-full bg-error-surface text-error">
          <Power aria-hidden="true" size={30} />
        </span>
        <h1 className="text-[28px] leading-[1.25] font-semibold">
          The app failed to load
        </h1>
        <p className="max-w-120 text-sm text-muted-foreground">
          An unexpected error stopped the player from starting. Reloading
          usually fixes it.
        </p>
        <button
          className="mt-2 inline-flex h-9 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          onClick={reset}
          type="button"
        >
          Reload the app
        </button>
      </body>
    </html>
  )
}
