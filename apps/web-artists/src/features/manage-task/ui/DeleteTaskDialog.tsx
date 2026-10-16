import { Button } from '@bitrate/ui-react'
import { type ReleaseTask, useDeleteTask } from '@entities/task'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'

interface DeleteTaskDialogProps {
  artistId: string
  task: ReleaseTask
  onClose: () => void
  onDeleted: () => void
}

export function DeleteTaskDialog({
  artistId,
  task,
  onClose,
  onDeleted,
}: DeleteTaskDialogProps) {
  const remove = useDeleteTask(artistId)
  const confirm = async () => {
    try {
      await remove.mutateAsync({
        releaseId: task.releaseId,
        taskId: task.id,
        expectedUpdatedAt: task.updatedAt,
      })
      onDeleted()
    } catch {
      // The task stays; the error explains what to do next.
    }
  }
  return (
    <WorkspaceModal
      canClose={!remove.isPending}
      className="artist-release-credit-modal"
      onClose={onClose}
      title="Delete task"
    >
      <div aria-busy={remove.isPending} className="space-y-6">
        <p>
          Delete <strong>{task.title}</strong>? This cannot be undone.
        </p>
        {remove.error && (
          <p className="text-sm text-destructive" role="alert">
            {remove.error.message}
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
            Keep task
          </Button>
          <Button
            disabled={remove.isPending}
            onClick={() => {
              void confirm()
            }}
            type="button"
            variant="destructive"
          >
            {remove.isPending ? 'Deleting…' : 'Delete task'}
          </Button>
        </div>
      </div>
    </WorkspaceModal>
  )
}
