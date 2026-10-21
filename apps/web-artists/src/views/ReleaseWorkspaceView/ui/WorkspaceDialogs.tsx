import type { ReleaseWorkspace } from '@entities/release'
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
  AddTrackDialog,
  CoverDialog,
  RemoveTrackDialog,
  RenameTrackDialog,
  ReplaceAudioDialog,
} from '@features/release-media'
import type { WorkspaceAction } from '@widgets/ReleaseWorkspace'

interface WorkspaceDialogsProps {
  artistId: string
  releaseId: string
  /** The loaded workspace; dialogs that edit it wait for it. */
  release: ReleaseWorkspace | undefined
  dialog: WorkspaceAction
  onClose: () => void
  onSaved: () => void
}

/** The single dialog the workspace page has open. */
export function WorkspaceDialogs({
  artistId,
  releaseId,
  release,
  dialog,
  onClose,
  onSaved,
}: WorkspaceDialogsProps) {
  const own = { artistId, onClose, onSaved }
  switch (dialog.kind) {
    case 'edit':
      return <EditReleaseDialog {...own} releaseId={releaseId} />
    case 'schedule':
      return <ScheduleReleaseDialog {...own} releaseId={releaseId} />
    case 'contributor-add':
      return <AddContributorDialog {...own} releaseId={releaseId} />
    case 'contributor-edit':
      return (
        <EditContributorDialog
          {...own}
          contributorId={dialog.contributorId}
          releaseId={releaseId}
        />
      )
  }
  if (!release) return null
  const props = { ...own, release }
  switch (dialog.kind) {
    case 'rights':
      return <RightsDialog {...props} />
    case 'splits':
      return <SplitsDialog {...props} rightType={dialog.rightType} />
    case 'upc':
      return <UpcDialog {...props} />
    case 'isrc':
      return <IsrcDialog {...props} trackId={dialog.trackId} />
    case 'cover':
      return <CoverDialog {...props} />
    case 'track-add':
      return <AddTrackDialog {...props} />
    case 'track-audio':
      return <ReplaceAudioDialog {...props} trackId={dialog.trackId} />
    case 'track-rename':
      return <RenameTrackDialog {...props} trackId={dialog.trackId} />
    case 'track-remove':
      return <RemoveTrackDialog {...props} trackId={dialog.trackId} />
  }
}
