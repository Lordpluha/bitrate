import { Button, cn } from '@bitrate/ui-react'
import { releaseStatusLabels } from '@entities/release'
import {
  formatDue,
  isOverdue,
  type TaskFilter,
  taskFilterLabels,
  taskFilters,
  useArtistTasks,
} from '@entities/task'
import { TaskStatusControl } from '@features/manage-task'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { CircleAlert, ListChecks } from 'lucide-react'

export interface TasksSearch {
  status: TaskFilter
  page: number
}

interface TasksViewProps {
  artistId: string
  search: TasksSearch
}

/** Every task across the artist's releases; editing happens in each release workspace. */
export function TasksView({ artistId, search }: TasksViewProps) {
  const tasks = useArtistTasks(artistId, search.status, search.page)
  const counts = tasks.data?.counts
  const countFor = (filter: TaskFilter) =>
    counts
      ? filter === 'OPEN'
        ? counts.TODO + counts.IN_PROGRESS
        : counts[filter]
      : undefined
  const pages = tasks.data
    ? Math.max(1, Math.ceil(tasks.data.total / tasks.data.limit))
    : 1

  return (
    <section aria-busy={tasks.isFetching} className="artist-music space-y-6">
      <div>
        <h1 className="text-[1.625rem] font-normal lg:text-[2rem]">Tasks</h1>
        <p className="mt-2 text-[0.9375rem] text-text-secondary">
          Deadlines and assignees across your releases.
          {counts && counts.overdue > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 text-destructive">
              <CircleAlert aria-hidden="true" className="size-4" />
              {counts.overdue} overdue
            </span>
          )}
        </p>
      </div>
      <nav aria-label="Task status" className="flex flex-wrap gap-2">
        {taskFilters.map((filter) => {
          const active = filter === search.status
          const count = countFor(filter)
          return (
            <Link
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded-full border border-border px-4 py-2 text-sm',
                active ? 'bg-secondary font-medium' : 'text-text-secondary',
              )}
              key={filter}
              search={{ status: filter, page: 1 }}
              to={ROUTES.dashboard.tasks}
            >
              {taskFilterLabels[filter]}
              {count === undefined ? '' : ` (${count})`}
            </Link>
          )
        })}
      </nav>
      {tasks.isPending ? (
        <p role="status">Loading tasks…</p>
      ) : tasks.isError ? (
        <div className="space-y-3">
          <p role="alert">{tasks.error.message}</p>
          <Button
            onClick={() => {
              void tasks.refetch()
            }}
            variant="outline"
          >
            Try again
          </Button>
        </div>
      ) : tasks.data.data.length === 0 ? (
        <div className="flex items-start gap-3 rounded-lg border border-border p-5">
          <ListChecks
            aria-hidden="true"
            className="size-5 shrink-0 text-accent"
          />
          <div className="space-y-2">
            <p>
              {search.status === 'OPEN'
                ? 'Nothing left to do. Add tasks from a release workspace.'
                : `No ${taskFilterLabels[search.status].toLowerCase()} tasks.`}
            </p>
            <Link
              className="underline"
              search={{ tab: 'releases', page: 1 }}
              to={ROUTES.dashboard.music}
            >
              Open your releases
            </Link>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {tasks.data.data.map((task) => {
            const overdue = isOverdue(task)
            return (
              <li
                className="flex flex-wrap items-start gap-4 p-4"
                key={task.id}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p
                    className={cn(
                      'font-medium',
                      task.status === 'DONE' &&
                        'text-text-secondary line-through',
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="text-sm text-text-secondary">
                    <Link
                      className="underline"
                      params={{ releaseId: task.release.id }}
                      to="/dashboard/music/$releaseId"
                    >
                      {task.release.title}
                    </Link>{' '}
                    · {releaseStatusLabels[task.release.status]} ·{' '}
                    {task.assignee ? task.assignee.displayName : 'Unassigned'}
                  </p>
                  {task.dueAt && (
                    <p
                      className={cn(
                        'text-sm',
                        overdue ? 'text-destructive' : 'text-text-secondary',
                      )}
                    >
                      {overdue ? 'Overdue · ' : 'Due '}
                      {formatDue(task.dueAt)}
                    </p>
                  )}
                </div>
                <TaskStatusControl artistId={artistId} task={task} />
              </li>
            )
          })}
        </ul>
      )}
      {tasks.data && pages > 1 && (
        <nav
          aria-label="Task pages"
          className="flex items-center justify-between gap-3"
        >
          {search.page > 1 ? (
            <Link
              className="underline"
              search={{ status: search.status, page: search.page - 1 }}
              to={ROUTES.dashboard.tasks}
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-text-secondary">
            Page {search.page} of {pages}
          </span>
          {search.page < pages ? (
            <Link
              className="underline"
              search={{ status: search.status, page: search.page + 1 }}
              to={ROUTES.dashboard.tasks}
            >
              Next
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </section>
  )
}
