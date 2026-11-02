import type { ReleaseWorkspace } from '@entities/release'
import {
  AddContributorDialog,
  CreditSelfDialog,
  EditContributorDialog,
  EditReleaseDialog,
  IsrcDialog,
  RemoveContributorDialog,
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
import { SubmitPreviewDialog } from '@features/submit-release'
import { useNavigate } from '@tanstack/react-router'
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
  const navigate = useNavigate()
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
      return <SplitsDialog {...props} />
    case 'upc':
      return <UpcDialog {...props} />
    case 'isrc':
      return <IsrcDialog {...props} trackId={dialog.trackId} />
    case 'cover':
      return <CoverDialog {...props} initialFile={dialog.file} />
    case 'submit':
      return (
        <SubmitPreviewDialog
          artistId={artistId}
          onClose={onClose}
          onSubmitted={() => {
            // A submitted draft is waiting on Bitrate, so the Review stage is what comes next.
            void navigate({
              to: '/dashboard/music/$releaseId',
              params: { releaseId },
              search: { step: 'review' },
            })
          }}
          release={release}
        />
      )
    case 'track-add':
      return <AddTrackDialog {...props} />
    case 'track-audio':
      return <ReplaceAudioDialog {...props} trackId={dialog.trackId} />
    case 'track-rename':
      return <RenameTrackDialog {...props} trackId={dialog.trackId} />
    case 'track-remove':
      return <RemoveTrackDialog {...props} trackId={dialog.trackId} />
    case 'contributor-remove':
      return (
        <RemoveContributorDialog
          {...props}
          contributorId={dialog.contributorId}
        />
      )
    case 'contributor-self':
      return <CreditSelfDialog {...props} />
  }
}
