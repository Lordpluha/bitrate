import {
  type ReleaseTask,
  type TaskStatus,
  taskStatuses,
  taskStatusLabels,
  useUpdateTask,
} from '@entities/task'

interface TaskStatusControlProps {
  artistId: string
  task: Pick<ReleaseTask, 'id' | 'releaseId' | 'title' | 'status' | 'updatedAt'>
}

const isTaskStatus = (value: string): value is TaskStatus =>
  (taskStatuses as readonly string[]).includes(value)

/** Moves a task between statuses in place; a rejected change keeps the saved status. */
export function TaskStatusControl({ artistId, task }: TaskStatusControlProps) {
  const update = useUpdateTask(artistId)
  return (
    <div className="space-y-1">
      <select
        aria-label={`Status of ${task.title}`}
        className="artist-music-control h-9 w-36 px-3 text-sm"
        disabled={update.isPending}
        onChange={(event) => {
          const value = event.target.value
          if (!isTaskStatus(value) || value === task.status) return
          update.mutate({
            releaseId: task.releaseId,
            taskId: task.id,
            input: { status: value, expectedUpdatedAt: task.updatedAt },
          })
        }}
        value={task.status}
      >
        {taskStatuses.map((status) => (
          <option key={status} value={status}>
            {taskStatusLabels[status]}
          </option>
        ))}
      </select>
      {update.error && (
        <p className="max-w-56 text-xs text-destructive" role="alert">
          {update.error.message}
        </p>
      )}
    </div>
  )
}
