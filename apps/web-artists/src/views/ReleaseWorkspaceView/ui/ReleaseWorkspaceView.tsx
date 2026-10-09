import { Button } from '@bitrate/ui-react'
import { useReleaseWorkspace } from '@entities/release'
import {
  AddContributorDialog,
  EditContributorDialog,
  EditReleaseDialog,
  IsrcDialog,
  RightsDialog,
  ScheduleReleaseDialog,
  SplitsDialog,
  UpcDialog,
} from '@features/edit-release'
import {
  CoverDialog,
  RemoveTrackDialog,
  RenameTrackDialog,
  TrackUploadDialog,
} from '@features/release-media'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import {
  ReleaseWorkspaceContent,
  type RightsAction,
  type TrackActions,
} from '@widgets/ReleaseWorkspace'
import { useState } from 'react'

type TrackDialogKind = 'isrc' | 'track-audio' | 'track-rename' | 'track-remove'

type WorkspaceDialog =
  | RightsAction
  | { kind: TrackDialogKind; trackId: string }
  | { kind: 'cover' }
  | { kind: 'track-add' }

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
  const [dialog, setDialog] = useState<WorkspaceDialog | null>(null)
  const closeDialog = () => setDialog(null)
  const dialogSaved = () => {
    setDialog(null)
    setSaved(true)
  }
  const trackActions: TrackActions = {
    onAdd: () => setDialog({ kind: 'track-add' }),
    onEditIsrc: (trackId) => setDialog({ kind: 'isrc', trackId }),
    onReplaceAudio: (trackId) => setDialog({ kind: 'track-audio', trackId }),
    onRename: (trackId) => setDialog({ kind: 'track-rename', trackId }),
    onRemove: (trackId) => setDialog({ kind: 'track-remove', trackId }),
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
            onAddContributor={() => setAddingContributor(true)}
            onCover={() => setDialog({ kind: 'cover' })}
            onEdit={() => setEditing(true)}
            onEditContributor={setEditingContributor}
            onRightsAction={setDialog}
            onSchedule={() => setScheduling(true)}
            release={query.data}
            trackActions={trackActions}
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
      {query.data && dialog?.kind === 'rights' && (
        <RightsDialog
          artistId={artistId}
          onClose={closeDialog}
          onSaved={dialogSaved}
          release={query.data}
        />
      )}
      {query.data && dialog?.kind === 'splits' && (
        <SplitsDialog
          artistId={artistId}
          onClose={closeDialog}
          onSaved={dialogSaved}
          release={query.data}
          rightType={dialog.rightType}
        />
      )}
      {query.data && dialog?.kind === 'upc' && (
        <UpcDialog
          artistId={artistId}
          onClose={closeDialog}
          onSaved={dialogSaved}
          release={query.data}
        />
      )}
      {query.data && dialog?.kind === 'isrc' && (
        <IsrcDialog
          artistId={artistId}
          onClose={closeDialog}
          onSaved={dialogSaved}
          release={query.data}
          trackId={dialog.trackId}
        />
      )}
      {query.data && dialog?.kind === 'cover' && (
        <CoverDialog
          artistId={artistId}
          onClose={closeDialog}
          onSaved={dialogSaved}
          release={query.data}
        />
      )}
      {query.data &&
        (dialog?.kind === 'track-add' || dialog?.kind === 'track-audio') && (
          <TrackUploadDialog
            artistId={artistId}
            onClose={closeDialog}
            onSaved={dialogSaved}
            release={query.data}
            trackId={dialog.kind === 'track-audio' ? dialog.trackId : undefined}
          />
        )}
      {query.data && dialog?.kind === 'track-rename' && (
        <RenameTrackDialog
          artistId={artistId}
          onClose={closeDialog}
          onSaved={dialogSaved}
          release={query.data}
          trackId={dialog.trackId}
        />
      )}
      {query.data && dialog?.kind === 'track-remove' && (
        <RemoveTrackDialog
          artistId={artistId}
          onClose={closeDialog}
          onSaved={dialogSaved}
          release={query.data}
          trackId={dialog.trackId}
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
