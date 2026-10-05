import { cn } from '@bitrate/ui-react'
import { useWorkspaceActions } from '@features/workspace-actions'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import {
  ChartNoAxesCombined,
  LayoutDashboard,
  Megaphone,
  Music2,
  Settings2,
  UserRound,
} from 'lucide-react'

const upcomingSections = [
  { label: 'Promotion', action: 'promotion', icon: Megaphone },
  { label: 'Analytics', action: 'analytics', icon: ChartNoAxesCombined },
  { label: 'Profile', action: 'profile', icon: UserRound },
  { label: 'Settings', action: 'settings', icon: Settings2 },
] as const

export function DashboardDesignNavigation({
  compact = false,
  onNavigate,
}: {
  compact?: boolean
  onNavigate?: () => void
}) {
  const { openAction } = useWorkspaceActions()
  const itemClass = cn(
    'artist-workspace-nav-item flex min-h-11 items-center gap-3 rounded-lg border border-transparent px-3.5 py-2 text-left text-sm font-normal text-text-secondary hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
    compact && 'justify-center',
  )

  return (
    <nav aria-label="Artist workspace" className="flex w-full flex-col gap-2">
      {[
        {
          label: 'Dashboard',
          to: ROUTES.dashboard.home,
          icon: LayoutDashboard,
        },
        { label: 'Music', to: ROUTES.dashboard.music, icon: Music2 },
      ].map(({ label, to, icon: Icon }) => (
        <Link
          activeOptions={{ exact: to === ROUTES.dashboard.home }}
          activeProps={{
            className: 'artist-workspace-nav-selected',
            'aria-current': 'page',
          }}
          className={itemClass}
          key={to}
          onClick={onNavigate}
          preload={false}
          title={compact ? label : undefined}
          to={to}
        >
          <Icon aria-hidden="true" className="size-5 shrink-0" />
          <span className={cn(compact && 'sr-only')}>{label}</span>
        </Link>
      ))}
      {upcomingSections.map(({ label, action, icon: Icon }) => (
        <button
          className={itemClass}
          key={action}
          onClick={() => {
            onNavigate?.()
            openAction(action)
          }}
          title={compact ? label : undefined}
          type="button"
        >
          <Icon aria-hidden="true" className="size-5 shrink-0" />
          <span className={cn(compact && 'sr-only')}>{label}</span>
        </button>
      ))}
    </nav>
  )
}
