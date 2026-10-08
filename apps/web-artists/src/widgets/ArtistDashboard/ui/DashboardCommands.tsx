import { Button } from '@bitrate/ui-react'
import {
  CreateReleaseButton,
  useWorkspaceActions,
} from '@features/workspace-actions'
import { ROUTES } from '@shared/routes/routes'
import { Link, useLocation } from '@tanstack/react-router'
import { Bell, Search } from 'lucide-react'

export function DashboardCommands() {
  const { openAction } = useWorkspaceActions()
  const releaseWorkspace = useLocation({
    select: (location) =>
      location.pathname.startsWith(`${ROUTES.dashboard.music}/`),
  })
  return (
    <div className="artist-workspace-commands flex items-center">
      <Button
        aria-label="Search workspace"
        className="artist-workspace-search h-11 justify-start gap-3 rounded-lg border border-input bg-secondary px-3.5 text-text-secondary"
        onClick={() => openAction('search')}
        variant="ghost"
      >
        <Search aria-hidden="true" className="size-[1.125rem] shrink-0" />
        <span className="artist-workspace-search-label text-[0.8125rem] font-normal">
          Search workspace
        </span>
        <kbd className="artist-workspace-search-label ml-auto text-[0.6875rem]">
          Ctrl K
        </kbd>
      </Button>
      <Button
        aria-label="Notifications"
        className="size-11 shrink-0 rounded-lg bg-secondary text-text-secondary"
        onClick={() => openAction('notifications')}
        size="icon"
        variant="ghost"
      >
        <Bell aria-hidden="true" className="size-5" />
      </Button>
      {releaseWorkspace ? (
        <Button
          asChild
          className="artist-workspace-header-create hidden rounded-full lg:inline-flex"
          variant="outline"
        >
          <Link
            search={{ tab: 'releases', page: 1 }}
            to={ROUTES.dashboard.music}
          >
            Back to music
          </Link>
        </Button>
      ) : (
        <CreateReleaseButton className="artist-workspace-header-create hidden lg:inline-flex" />
      )}
    </div>
  )
}
