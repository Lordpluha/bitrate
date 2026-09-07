'use client'

import * as Sentry from '@sentry/nextjs'
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
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
        <h1 className="text-2xl font-bold sm:text-3xl">
          The app failed to load
        </h1>
        <p className="max-w-110 text-white/70">
          An unexpected error stopped the player from starting. Reloading
          usually fixes it.
        </p>
        <button
          className="mt-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-105"
          onClick={reset}
          type="button"
        >
          Reload the app
        </button>
      </body>
    </html>
  )
}
