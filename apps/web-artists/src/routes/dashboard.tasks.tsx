import { createFileRoute } from '@tanstack/react-router'
import { DashboardSectionView } from '@views/DashboardView'

export const Route = createFileRoute('/dashboard/tasks')({
  component: TasksPage,
})

function TasksPage() {
  return (
    <DashboardSectionView
      description="Release tasks, deadlines and collaborators will appear here when release preparation is available."
      title="Tasks"
    />
  )
}
