import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'

/**
 * The 404 screen.
 *
 * Next answered an unknown path with its own built-in page, so this app never had one written
 * down; TanStack Router has no built-in worth shipping and says so out loud on the first miss.
 * Attached to the router as `defaultNotFoundComponent`, so a miss under any route — not just the
 * root — lands here.
 */
export function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          404
        </p>
        <h1 className="text-2xl font-semibold text-foreground">
          This page doesn&apos;t exist
        </h1>
        <p className="max-w-prose text-muted-foreground">
          The link may be out of date, or the address mistyped.
        </p>
      </div>

      <Link
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        to={ROUTES.landing}
      >
        Back to Bitrate for Artists
      </Link>
    </main>
  )
}
