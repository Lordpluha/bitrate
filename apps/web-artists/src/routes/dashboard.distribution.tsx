import { createFileRoute } from '@tanstack/react-router'
import { DashboardSectionView } from '@views/DashboardView'

export const Route = createFileRoute('/dashboard/distribution')({
  component: DistributionPage,
})

function DistributionPage() {
  return (
    <DashboardSectionView
      description="External delivery is not connected. No music has been sent to a streaming service from this workspace."
      title="Distribution"
    />
  )
}
