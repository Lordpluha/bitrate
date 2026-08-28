'use client'

import { ROUTES } from '@shared/routes'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export type ErrorStateProps = {
  description?: string
  onRetry?: () => void
  title?: string
}

/** Shared empty/error screen used by the App Router `error.tsx` boundaries. */
export const ErrorState = ({
  description = 'Something went wrong on our side. Try again, or head back home.',
  onRetry,
  title = 'Something went wrong',
}: ErrorStateProps) => (
  <div
    aria-live="assertive"
    className="flex h-full min-h-100 flex-col items-center justify-center gap-4 rounded-lg bg-background-secondary px-6 py-16 text-center"
    role="alert"
  >
    <AlertTriangle aria-hidden="true" className="text-text-subdued" size={44} />
    <h1 className="text-2xl font-bold text-text sm:text-3xl">{title}</h1>
    <p className="max-w-110 text-sm text-text-subdued sm:text-base">
      {description}
    </p>
    <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
      {onRetry ? (
        <button
          className="rounded-full bg-text px-6 py-3 text-sm font-bold text-background transition-transform hover:scale-105"
          onClick={onRetry}
          type="button"
        >
          Try again
        </button>
      ) : null}
      <Link
        className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-text transition-colors hover:border-white"
        href={ROUTES.main}
      >
        Back to home
      </Link>
    </div>
  </div>
)
