import { type ReleaseStage, releaseStages } from '@entities/release'
import { createFileRoute, type SearchSchemaInput } from '@tanstack/react-router'
import { ReleaseWorkspaceView } from '@views/ReleaseWorkspaceView'
import { z } from 'zod'

/** An unknown stage falls back to the release's current one instead of failing the page. */
const releaseSearchSchema = z.object({
  step: z.enum(releaseStages).optional().catch(undefined),
  /** The promotion POST step whose drafts are open. */
  post: z.uuid().optional().catch(undefined),
})

type ReleaseSearch = { step?: ReleaseStage; post?: string }

export const Route = createFileRoute('/dashboard/music_/$releaseId')({
  validateSearch: (search: SearchSchemaInput & ReleaseSearch): ReleaseSearch =>
    releaseSearchSchema.parse(search),
  component: ReleasePage,
})

function ReleasePage() {
  const { releaseId } = Route.useParams()
  const { step, post } = Route.useSearch()
  const { artist } = Route.useRouteContext()
  return (
    <ReleaseWorkspaceView
      artistId={artist.id}
      key={releaseId}
      postStepId={post}
      releaseId={releaseId}
      step={step}
    />
  )
}
