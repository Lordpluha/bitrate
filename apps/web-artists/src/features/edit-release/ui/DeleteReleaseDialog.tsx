import { Button } from '@bitrate/ui-react'
import { useDeleteRelease } from '@entities/release'
import { useI18n } from '@shared/i18n'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'

interface DeleteReleaseDialogProps {
  artistId: string
  release: { id: string; title: string; updatedAt: string }
  onClose: () => void
  onDeleted: () => void
}

export function DeleteReleaseDialog({
  artistId,
  release,
  onClose,
  onDeleted,
}: DeleteReleaseDialogProps) {
  const { tMessage } = useI18n()
  const remove = useDeleteRelease(artistId)
  const confirm = async () => {
    try {
      await remove.mutateAsync({
        id: release.id,
        input: { expectedUpdatedAt: release.updatedAt },
      })
      onDeleted()
    } catch {
      // The draft stays; the error explains what to do next.
    }
  }
  return (
    <WorkspaceModal
      canClose={!remove.isPending}
      className="artist-release-credit-modal"
      onClose={onClose}
      title="Delete draft"
    >
      <div aria-busy={remove.isPending} className="space-y-6">
        <p>
          Delete <strong>{release.title}</strong> and its recordings? This
          cannot be undone.
        </p>
        {remove.error && (
          <p className="text-sm text-destructive" role="alert">
            {tMessage(remove.error.message)}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            data-initial-focus
            disabled={remove.isPending}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Keep draft
          </Button>
          <Button
            disabled={remove.isPending}
            onClick={() => {
              void confirm()
            }}
            type="button"
            variant="destructive"
          >
            {remove.isPending ? 'Deleting…' : 'Delete draft'}
          </Button>
        </div>
      </div>
    </WorkspaceModal>
  )
}
