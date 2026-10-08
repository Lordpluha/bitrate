import { createFileRoute } from '@tanstack/react-router'
import { ReleaseWorkspaceView } from '@views/ReleaseWorkspaceView'

export const Route = createFileRoute('/dashboard/music_/$releaseId')({
  component: ReleasePage,
})

function ReleasePage() {
  const { releaseId } = Route.useParams()
  const { artist } = Route.useRouteContext()
  return (
    <ReleaseWorkspaceView
      artistId={artist.id}
      key={releaseId}
      releaseId={releaseId}
    />
  )
}
