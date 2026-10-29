import { artistSessionCheck } from '@shared/auth/artistSessionCheck'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import {
  ArtistDashboard,
  DashboardSessionError,
} from '@widgets/ArtistDashboard'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ location }) => {
    const session = await artistSessionCheck.load()
    if (session.status === 'unauthenticated') {
      throw redirect({
        to: ROUTES.auth.login,
        search: { next: location.href },
        replace: true,
      })
    }
    if (session.status === 'unavailable') throw new Error('Session unavailable')
    return { artist: session.artist }
  },
  component: DashboardLayout,
  errorComponent: DashboardSessionError,
  pendingComponent: DashboardPending,
})

function DashboardPending() {
  const { t } = useI18n()
  return (
    <p className="bg-background p-6 text-foreground" role="status">
      {t('shell.checkingSession')}
    </p>
  )
}

function DashboardLayout() {
  const { artist } = Route.useRouteContext()
  return (
    <ArtistDashboard artist={artist}>
      <Outlet />
    </ArtistDashboard>
  )
}
