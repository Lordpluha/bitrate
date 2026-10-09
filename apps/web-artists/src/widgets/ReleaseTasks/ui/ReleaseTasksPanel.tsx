import { Button, cn } from '@bitrate/ui-react'
import {
  formatDue,
  isOverdue,
  type ReleaseTask,
  useReleaseTasks,
} from '@entities/task'
import {
  DeleteTaskDialog,
  TaskDialog,
  TaskStatusControl,
} from '@features/manage-task'
import { ListChecks, Plus } from 'lucide-react'
import { useState } from 'react'

interface ReleaseTasksPanelProps {
  artistId: string
  releaseId: string
  participants: { id: string; displayName: string }[]
}

type TaskPanelDialog =
  | { kind: 'create' }
  | { kind: 'edit'; task: ReleaseTask }
  | { kind: 'delete'; task: ReleaseTask }

/** Tasks, deadlines and assignees of one release; editable in every release status. */
export function ReleaseTasksPanel({
  artistId,
  releaseId,
  participants,
}: ReleaseTasksPanelProps) {
  const tasks = useReleaseTasks(artistId, releaseId)
  const [dialog, setDialog] = useState<TaskPanelDialog | null>(null)
  const close = () => setDialog(null)
  const open = tasks.data?.data.filter((task) => task.status !== 'DONE').length

  return (
    <section
      aria-labelledby="release-tasks-heading"
      className="artist-release-workspace-panel"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="release-tasks-heading">
          Tasks{' '}
          {tasks.data && (
            <span>
              ({open} open of {tasks.data.total})
            </span>
          )}
        </h2>
        <Button
          onClick={() => setDialog({ kind: 'create' })}
          size="sm"
          variant="outline"
        >
          <Plus aria-hidden="true" className="size-4" />
          Add task
        </Button>
      </div>
      <p>Deadlines and assignees for preparing this release.</p>
      {tasks.isPending ? (
        <p role="status">Loading tasks…</p>
      ) : tasks.isError ? (
        <div className="space-y-2">
          <p role="alert">{tasks.error.message}</p>
          <Button
            onClick={() => {
              void tasks.refetch()
            }}
            size="sm"
            variant="outline"
          >
            Try again
          </Button>
        </div>
      ) : tasks.data.data.length === 0 ? (
        <div className="artist-release-inset">
          <ListChecks
            aria-hidden="true"
            className="size-5 shrink-0 text-accent"
          />
          <p>No tasks yet. Add the first step, such as approving the master.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tasks.data.data.map((task) => {
            const overdue = isOverdue(task)
            return (
              <li
                className="flex flex-wrap items-start gap-3"
                data-status={task.status}
                key={task.id}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <h3
                    className={cn(
                      task.status === 'DONE' &&
                        'text-text-secondary line-through',
                    )}
                  >
                    {task.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {task.assignee ? task.assignee.displayName : 'Unassigned'}
                    {task.dueAt && (
                      <>
                        {' · '}
                        <span className={cn(overdue && 'text-destructive')}>
                          {overdue ? 'Overdue · ' : 'Due '}
                          {formatDue(task.dueAt)}
                        </span>
                      </>
                    )}
                  </p>
                  {task.notes && (
                    <p className="whitespace-pre-line text-sm text-text-secondary">
                      {task.notes}
                    </p>
                  )}
                </div>
                <TaskStatusControl artistId={artistId} task={task} />
                <div className="flex gap-2">
                  <Button
                    aria-label={`Edit ${task.title}`}
                    onClick={() => setDialog({ kind: 'edit', task })}
                    size="sm"
                    variant="outline"
                  >
                    Edit
                  </Button>
                  <Button
                    aria-label={`Delete ${task.title}`}
                    onClick={() => setDialog({ kind: 'delete', task })}
                    size="sm"
                    variant="ghost"
                  >
                    Delete
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {tasks.data && tasks.data.total > tasks.data.data.length && (
        <p>
          Showing {tasks.data.data.length} of {tasks.data.total} tasks.
        </p>
      )}
      {(dialog?.kind === 'create' || dialog?.kind === 'edit') && (
        <TaskDialog
          artistId={artistId}
          onClose={close}
          onSaved={close}
          participants={participants}
          releaseId={releaseId}
          task={dialog.kind === 'edit' ? dialog.task : undefined}
        />
      )}
      {dialog?.kind === 'delete' && (
        <DeleteTaskDialog
          artistId={artistId}
          onClose={close}
          onDeleted={close}
          task={dialog.task}
        />
      )}
    </section>
  )
}
