import { type TaskFilter, taskFilters } from '@entities/task'
import { createFileRoute, type SearchSchemaInput } from '@tanstack/react-router'
import { type TasksSearch, TasksView } from '@views/TasksView'
import { z } from 'zod'

/** Unknown or missing values fall back instead of failing, so old links still open the page. */
const tasksSearchSchema = z.object({
  status: z.enum(taskFilters).catch('OPEN'),
  page: z.coerce.number().int().min(1).catch(1),
})

export const Route = createFileRoute('/dashboard/tasks')({
  validateSearch: (
    search: SearchSchemaInput & { status?: TaskFilter; page?: number },
  ): TasksSearch => tasksSearchSchema.parse(search),
  component: TasksPage,
})

function TasksPage() {
  const search = Route.useSearch()
  const { artist } = Route.useRouteContext()
  return <TasksView artistId={artist.id} search={search} />
}
