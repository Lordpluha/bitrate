import { Button } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { Link, useRouter } from '@tanstack/react-router'

/** Session outages do not render the shell or pretend the visitor has signed out. */
export function DashboardSessionError() {
  const router = useRouter()
  const { t } = useI18n()
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-foreground">
      <div
        className="max-w-md space-y-4 rounded-xl border border-border bg-card p-6"
        role="alert"
      >
        <h1 className="text-2xl font-semibold">
          {t('shell.sessionError.title')}
        </h1>
        <p className="text-text-secondary">
          {t('shell.sessionError.description')}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              void router.invalidate()
            }}
            variant="primary"
          >
            {t('common.tryAgain')}
          </Button>
          <Button asChild variant="outline">
            <Link to={ROUTES.landing}>{t('shell.backToBitrate')}</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
