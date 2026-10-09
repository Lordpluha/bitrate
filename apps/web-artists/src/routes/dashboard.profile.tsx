import { createFileRoute } from '@tanstack/react-router'
import { ProfileView } from '@views/ProfileView'

export const Route = createFileRoute('/dashboard/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { artist } = Route.useRouteContext()
  return <ProfileView artistId={artist.id} />
}
