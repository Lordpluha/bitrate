import { createFileRoute } from '@tanstack/react-router'
import { SettingsView } from '@views/SettingsView'

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { artist } = Route.useRouteContext()
  return <SettingsView artistId={artist.id} />
}
