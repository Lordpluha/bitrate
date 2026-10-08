import { Button } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'

interface DashboardSectionViewProps {
  title: string
  description: string
}

export function DashboardSectionView({
  title,
  description,
}: DashboardSectionViewProps) {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <div className="max-w-2xl space-y-4 rounded-xl border border-border bg-card p-6">
        <p className="text-sm font-semibold text-accent">Coming soon</p>
        <p className="text-text-secondary">{description}</p>
        <Button asChild variant="outline">
          <Link preload={false} to={ROUTES.dashboard.home}>
            Back to dashboard
          </Link>
        </Button>
      </div>
    </section>
  )
}
