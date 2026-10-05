import { Button } from '@bitrate/ui-react'
import { useReleaseWorkspace } from '@entities/release'
import {
  AddContributorDialog,
  EditContributorDialog,
  EditReleaseDialog,
  ScheduleReleaseDialog,
} from '@features/edit-release'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { ReleaseWorkspaceContent } from '@widgets/ReleaseWorkspace'
import { useState } from 'react'

interface ReleaseWorkspaceViewProps {
  artistId: string
  releaseId: string
}

export function ReleaseWorkspaceView({
  artistId,
  releaseId,
}: ReleaseWorkspaceViewProps) {
  const query = useReleaseWorkspace(artistId, releaseId)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [addingContributor, setAddingContributor] = useState(false)
  const [editingContributor, setEditingContributor] = useState<string | null>(
    null,
  )
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
            onAddContributor={() => setAddingContributor(true)}
            onEdit={() => setEditing(true)}
            onEditContributor={setEditingContributor}
            onSchedule={() => setScheduling(true)}
            release={query.data}
          />
        </>
      )}
      {editing && (
        <EditReleaseDialog
          artistId={artistId}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false)
            setSaved(true)
          }}
          releaseId={releaseId}
        />
      )}
      {scheduling && (
        <ScheduleReleaseDialog
          artistId={artistId}
          onClose={() => setScheduling(false)}
          onSaved={() => {
            setScheduling(false)
            setSaved(true)
          }}
          releaseId={releaseId}
        />
      )}
      {addingContributor && (
        <AddContributorDialog
          artistId={artistId}
          onClose={() => setAddingContributor(false)}
          onSaved={() => {
            setAddingContributor(false)
            setSaved(true)
          }}
          releaseId={releaseId}
        />
      )}
      {editingContributor && (
        <EditContributorDialog
          artistId={artistId}
          contributorId={editingContributor}
          onClose={() => setEditingContributor(null)}
          onSaved={() => {
            setEditingContributor(null)
            setSaved(true)
          }}
          releaseId={releaseId}
        />
      )}
    </div>
  )
}
