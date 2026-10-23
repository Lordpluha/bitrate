import { Button } from '@bitrate/ui-react'
import { useReleaseWorkspace } from '@entities/release'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { ReleaseDeliveryPanel } from '@widgets/ReleaseDelivery'
import { ReleaseTasksPanel } from '@widgets/ReleaseTasks'
import {
  ReleaseWorkspaceContent,
  type WorkspaceAction,
} from '@widgets/ReleaseWorkspace'
import { useState } from 'react'
import { WorkspaceDialogs } from './WorkspaceDialogs'

interface ReleaseWorkspaceViewProps {
  artistId: string
  releaseId: string
}

export function ReleaseWorkspaceView({
  artistId,
  releaseId,
}: ReleaseWorkspaceViewProps) {
  const query = useReleaseWorkspace(artistId, releaseId)
  const [saved, setSaved] = useState(false)
  const [dialog, setDialog] = useState<WorkspaceAction | null>(null)
  /** Opening the next dialog is the next action, so it retires the saved notice. */
  const openDialog = (next: WorkspaceAction) => {
    setSaved(false)
    setDialog(next)
  }
  return (
    <div aria-busy={query.isFetching} className="artist-release-workspace">
      {query.isPending ? (
        <p role="status">Loading release workspace…</p>
      ) : query.isError ? (
        <div className="space-y-4 py-8">
          <h1 className="text-2xl">Release workspace unavailable</h1>
          <p role="alert">{query.error.message}</p>
          <Button
            onClick={() => {
              void query.refetch()
            }}
            variant="outline"
          >
            Try again
          </Button>
          <Link
            className="block underline"
            search={{ tab: 'releases', page: 1 }}
            to={ROUTES.dashboard.music}
          >
            Return to Music
          </Link>
        </div>
      ) : (
        <>
          {saved && (
            <p
              className="mb-4 rounded-lg border border-border bg-secondary p-4 text-sm"
              role="status"
            >
              Draft updated.
            </p>
          )}
          <ReleaseWorkspaceContent
            artistId={artistId}
            onAction={openDialog}
            release={query.data}
          >
            <ReleaseTasksPanel
              artistId={artistId}
              participants={query.data.participants}
              releaseId={releaseId}
            />
            <ReleaseDeliveryPanel
              artistId={artistId}
              release={query.data}
              releaseId={releaseId}
            />
          </ReleaseWorkspaceContent>
        </>
      )}
      {dialog && (
        <WorkspaceDialogs
          artistId={artistId}
          dialog={dialog}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null)
            setSaved(true)
          }}
          release={query.data}
          releaseId={releaseId}
        />
      )}
    </div>
  )
}
