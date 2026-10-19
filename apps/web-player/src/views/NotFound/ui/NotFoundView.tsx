'use client'

import { ROUTES } from '@shared/routes'
import { Logo } from '@shared/ui'
import { Heart, Library, Play, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/shared/hooks'

/** The design's flatline: the spectrum drops to nothing in the middle. */
const FLATLINE = [
  10, 18, 30, 46, 30, 22, 38, 54, 30, 14, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 12, 26,
  44, 60, 36, 20, 34, 48, 24, 12,
].map((height, position) => ({ height, key: `bar-${position}`, position }))

const primaryButton =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover'
const outlineButton =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-surface'

const SUGGESTIONS = [
  { href: ROUTES.likedSongs, icon: Heart, label: 'Liked Songs' },
  { href: ROUTES.search(), icon: Sparkles, label: 'Discover' },
  { href: ROUTES.library, icon: Library, label: 'Your Library' },
]

/**
 * "Signal lost": the global 404 as a track that does not exist — The 404s, stuck at 4:04 with a
 * flatline in the middle. Play goes home, Search opens search, and listeners get suggestions.
 */
export const NotFoundView = () => {
  const { isAuthenticated } = useAuth()

  return (
    <main className="flex min-h-dvh flex-col items-center gap-6 bg-background px-4 py-10 text-foreground md:justify-center">
      <Logo href={ROUTES.main} wordmark />
      <p
        aria-hidden="true"
        className="font-[family-name:var(--font-landing-display)] text-[54px] leading-none font-bold text-primary"
      >
        404
      </p>
      <p className="max-w-130 text-center text-sm text-muted-foreground">
        This track skipped. The page you are looking for is not on the setlist.
      </p>

      <section
        aria-labelledby="not-found-title"
        className="flex w-full max-w-155 flex-col gap-4.5 rounded-[14px] border border-border bg-card p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-[1.2px] text-muted-foreground uppercase">
            Now playing · Signal lost
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-error-surface px-2.5 py-0.5 text-xs font-semibold text-error-text">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-error"
            />
            No signal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="size-16 shrink-0 rounded-md bg-linear-135 from-primary to-magenta-500 opacity-45 md:size-22" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1
              className="text-[19px] leading-[1.25] font-semibold md:text-2xl"
              id="not-found-title"
            >
              Page not found
            </h1>
            <p className="truncate text-[13px] text-muted-foreground">
              The 404s · Lost Frequencies (B-side)
            </p>
          </div>
        </div>
        <div aria-hidden="true" className="flex h-16 items-center gap-1">
          {FLATLINE.map(({ height, key, position }) => (
            <span
              className={
                height <= 4
                  ? 'w-1.5 rounded-full bg-destructive'
                  : position < 10
                    ? 'w-1.5 rounded-full bg-primary'
                    : 'w-1.5 rounded-full bg-accent'
              }
              key={key}
              style={{ height }}
            />
          ))}
        </div>
        <div aria-hidden="true" className="flex flex-col gap-2">
          <div className="relative h-1 w-full rounded-full bg-progress-track">
            <div className="absolute inset-0 rounded-full bg-primary" />
            <span className="absolute top-1/2 right-0 size-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" />
          </div>
          <div className="flex justify-between text-xs tabular-nums text-muted-foreground">
            <span>4:04</span>
            <span>4:04</span>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Link className={primaryButton} href={ROUTES.main}>
            <Play aria-hidden="true" fill="currentColor" size={16} />
            {isAuthenticated ? 'Play something else' : 'Back to the start'}
          </Link>
          {isAuthenticated ? (
            <Link className={outlineButton} href={ROUTES.search()}>
              <Search aria-hidden="true" size={16} />
              Search
            </Link>
          ) : null}
        </div>
      </section>

      {isAuthenticated ? (
        <section className="flex w-full max-w-155 flex-col gap-3">
          <h2 className="text-base font-semibold">Try these instead</h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {SUGGESTIONS.map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <Link
                  className="flex h-14 items-center gap-3 overflow-hidden rounded-lg bg-card pr-3 transition-colors hover:bg-secondary"
                  href={href}
                >
                  <span className="flex size-14 shrink-0 items-center justify-center bg-linear-135 from-primary to-magenta-500 text-white">
                    <Icon aria-hidden="true" size={20} />
                  </span>
                  <span className="truncate text-[13px] font-semibold">
                    {label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  )
}
