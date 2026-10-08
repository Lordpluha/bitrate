import { Button } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes/routes'
import { Link, useRouter } from '@tanstack/react-router'

/** Session outages do not render the shell or pretend the visitor has signed out. */
export function DashboardSessionError() {
  const router = useRouter()
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-foreground">
      <div
        className="max-w-md space-y-4 rounded-xl border border-border bg-card p-6"
        role="alert"
      >
        <h1 className="text-2xl font-semibold">
          We couldn't check your session
        </h1>
        <p className="text-text-secondary">
          Your workspace is temporarily unavailable. Try again in a moment.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              void router.invalidate()
            }}
            variant="primary"
          >
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link to={ROUTES.landing}>Back to Bitrate</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
