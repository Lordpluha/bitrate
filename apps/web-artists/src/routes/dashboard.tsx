import { artistSessionCheck } from '@shared/auth/artistSessionCheck'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { PageSkeleton } from '@shared/ui'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import {
  ArtistDashboard,
  DashboardSessionError,
} from '@widgets/ArtistDashboard'
import workspaceCss from '../styles/workspace.css?url'

export const Route = createFileRoute('/dashboard')({
  head: () => ({ links: [{ rel: 'stylesheet', href: workspaceCss }] }),
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
    <PageSkeleton
      className="bg-background p-6 text-foreground"
      heading
      label={t('shell.checkingSession')}
    />
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
