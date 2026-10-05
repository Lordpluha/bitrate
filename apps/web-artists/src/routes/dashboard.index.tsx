import { createFileRoute } from '@tanstack/react-router'
import { DashboardView } from '@views/DashboardView'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardView,
})
