import { cn } from '@bitrate/ui-react'
import { useWorkspaceActions } from '@features/workspace-actions'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import {
  ChartNoAxesCombined,
  LayoutDashboard,
  Megaphone,
  Music2,
  Send,
  Settings2,
  UserRound,
} from 'lucide-react'

/** Designed order: live sections link, upcoming ones explain themselves in a dialog. */
const sections = [
  {
    label: 'shell.nav.dashboard',
    to: ROUTES.dashboard.home,
    icon: LayoutDashboard,
  },
  { label: 'shell.nav.music', to: ROUTES.dashboard.music, icon: Music2 },
  {
    label: 'shell.nav.distribution',
    to: ROUTES.dashboard.distribution,
    icon: Send,
  },
  { label: 'shell.nav.promotion', action: 'promotion', icon: Megaphone },
  {
    label: 'shell.nav.analytics',
    to: ROUTES.dashboard.analytics,
    icon: ChartNoAxesCombined,
  },
  { label: 'shell.nav.profile', to: ROUTES.dashboard.profile, icon: UserRound },
  {
    label: 'shell.nav.settings',
    to: ROUTES.dashboard.settings,
    icon: Settings2,
  },
] as const

export function DashboardDesignNavigation({
  compact = false,
  onNavigate,
}: {
  compact?: boolean
  onNavigate?: () => void
}) {
  const { openAction } = useWorkspaceActions()
  const { t } = useI18n()
  const itemClass = cn(
    'artist-workspace-nav-item flex min-h-11 items-center gap-3 rounded-lg border border-transparent px-3.5 py-2 text-left text-sm font-normal text-text-secondary hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
    compact && 'justify-center',
  )

  return (
    <nav
      aria-label={t('shell.artistWorkspace')}
      className="flex w-full flex-col gap-2"
    >
      {sections.map((section) => {
        const Icon = section.icon
        const label = t(section.label)
        const content = (
          <>
            <Icon aria-hidden="true" className="size-5 shrink-0" />
            <span className={cn(compact && 'sr-only')}>{label}</span>
          </>
        )
        return 'to' in section ? (
          <Link
            activeOptions={{ exact: section.to === ROUTES.dashboard.home }}
            activeProps={{
              className: 'artist-workspace-nav-selected',
              'aria-current': 'page',
            }}
            className={itemClass}
            key={section.label}
            onClick={onNavigate}
            preload={false}
            title={compact ? label : undefined}
            to={section.to}
          >
            {content}
          </Link>
        ) : (
          <button
            className={itemClass}
            key={section.label}
            onClick={() => {
              onNavigate?.()
              openAction(section.action)
            }}
            title={compact ? label : undefined}
            type="button"
          >
            {content}
          </button>
        )
      })}
    </nav>
  )
}
