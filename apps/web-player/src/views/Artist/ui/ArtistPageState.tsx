'use client'

import { ROUTES } from '@shared/routes'
import Link from 'next/link'

export type ArtistPageStateProps = {
  variant: 'error' | 'loading'
}

/** Skeleton and not-found states for the artist screen. */
export const ArtistPageState = ({ variant }: ArtistPageStateProps) => {
  if (variant === 'loading') {
    return (
      <div className="h-full overflow-hidden rounded-lg bg-background-secondary">
        <div className="h-70 w-full animate-pulse bg-surface sm:h-90" />
        <div className="flex items-center gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <div className="size-14 animate-pulse rounded-full bg-surface" />
          <div className="h-8 w-28 animate-pulse rounded-full bg-surface" />
        </div>
        <div className="flex flex-col gap-3 px-4 sm:px-6 lg:px-8">
          {[0, 1, 2, 3, 4].map((row) => (
            <div
              className="h-12 animate-pulse rounded-md bg-surface"
              key={row}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-lg bg-background-secondary px-6 text-center">
      <h1 className="text-3xl font-bold text-text sm:text-4xl">
        Artist not found
      </h1>
      <p className="max-w-100 text-text-subdued">
        We couldn&apos;t find this artist. They may have been removed, or the
        link is incorrect.
      </p>
      <Link
        className="rounded-full bg-text px-6 py-3 text-sm font-bold text-background transition-transform hover:scale-105"
        href={ROUTES.main}
      >
        Back to home
      </Link>
    </div>
  )
}
