import { createFileRoute } from '@tanstack/react-router'
import { DashboardView } from '@views/DashboardView'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { artist } = Route.useRouteContext()
  return <DashboardView artistId={artist.id} />
}
