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
import { ReleaseDeliveryPanel } from '@widgets/ReleaseDelivery'
import { ReleaseTasksPanel } from '@widgets/ReleaseTasks'
import {
  ReleaseWorkspaceContent,
  type RightsAction,
  type TrackActions,
} from '@widgets/ReleaseWorkspace'
import { useState } from 'react'

type TrackDialogKind = 'isrc' | 'track-audio' | 'track-rename' | 'track-remove'

/** Every dialog the workspace can open; only one is open at a time. */
type WorkspaceDialog =
  | RightsAction
  | { kind: TrackDialogKind; trackId: string }
  | { kind: 'cover' }
  | { kind: 'track-add' }
  | { kind: 'edit' }
  | { kind: 'schedule' }
  | { kind: 'contributor-add' }
  | { kind: 'contributor-edit'; contributorId: string }

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
  const [dialog, setDialog] = useState<WorkspaceDialog | null>(null)
  /** Opening the next dialog is the next action, so it retires the saved notice. */
  const openDialog = (next: WorkspaceDialog) => {
    setSaved(false)
    setDialog(next)
  }
  const closeDialog = () => setDialog(null)
  const dialogSaved = () => {
    setDialog(null)
    setSaved(true)
  }
  const trackActions: TrackActions = {
    onAdd: () => openDialog({ kind: 'track-add' }),
    onEditIsrc: (trackId) => openDialog({ kind: 'isrc', trackId }),
    onReplaceAudio: (trackId) => openDialog({ kind: 'track-audio', trackId }),
    onRename: (trackId) => openDialog({ kind: 'track-rename', trackId }),
    onRemove: (trackId) => openDialog({ kind: 'track-remove', trackId }),
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
            onAddContributor={() => openDialog({ kind: 'contributor-add' })}
            onCover={() => openDialog({ kind: 'cover' })}
            onEdit={() => openDialog({ kind: 'edit' })}
            onEditContributor={(contributorId) =>
              openDialog({ kind: 'contributor-edit', contributorId })
            }
            onRightsAction={openDialog}
            onSchedule={() => openDialog({ kind: 'schedule' })}
            release={query.data}
            trackActions={trackActions}
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
      {dialog?.kind === 'edit' && (
        <EditReleaseDialog
          artistId={artistId}
          onClose={closeDialog}
          onSaved={dialogSaved}
          releaseId={releaseId}
        />
      )}
      {dialog?.kind === 'schedule' && (
        <ScheduleReleaseDialog
          artistId={artistId}
          onClose={closeDialog}
          onSaved={dialogSaved}
          releaseId={releaseId}
        />
      )}
      {dialog?.kind === 'contributor-add' && (
        <AddContributorDialog
          artistId={artistId}
          onClose={closeDialog}
          onSaved={dialogSaved}
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
      {dialog?.kind === 'contributor-edit' && (
        <EditContributorDialog
          artistId={artistId}
          contributorId={dialog.contributorId}
          onClose={closeDialog}
          onSaved={dialogSaved}
          releaseId={releaseId}
        />
      )}
    </div>
  )
}
