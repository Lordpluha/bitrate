import { useReleaseWorkspace } from '@entities/release'
import { useI18n } from '@shared/i18n'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
import { ProposeReleaseChangesDialog } from './ProposeReleaseChangesDialog'

interface ProposeReleaseChangesLoaderProps {
  artistId: string
  releaseId: string
  title: string
  onClose: () => void
}

/** Loads the release's own recordings, then opens the proposal form; used outside its page. */
export function ProposeReleaseChangesLoader({
  artistId,
  releaseId,
  title,
  onClose,
}: ProposeReleaseChangesLoaderProps) {
  const { t, tMessage } = useI18n()
  const workspace = useReleaseWorkspace(artistId, releaseId)
  if (workspace.data)
    return (
      <ProposeReleaseChangesDialog
        artistId={artistId}
        onClose={onClose}
        recordings={workspace.data.trackDrafts.filter(
          (recording) => !recording.sourceTrackId,
        )}
        release={workspace.data}
      />
    )
  return (
    <WorkspaceModal
      onClose={onClose}
      title={t('releaseChanges.dialog.title', { title })}
    >
      <p
        className={workspace.error ? 'text-sm text-destructive' : 'text-sm'}
        role={workspace.error ? 'alert' : 'status'}
      >
        {workspace.error
          ? tMessage(workspace.error.message)
          : t('releaseChanges.loading')}
      </p>
    </WorkspaceModal>
  )
}
