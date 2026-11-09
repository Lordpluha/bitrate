import { Button } from '@bitrate/ui-react'
import {
  CreateReleaseButton,
  useWorkspaceActions,
} from '@features/workspace-actions'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { Link, useLocation } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { DashboardNotificationsPopover } from './DashboardNotificationsPopover'

export function DashboardCommands({ artistId }: { artistId: string }) {
  const { openAction } = useWorkspaceActions()
  const { t } = useI18n()
  const pathname = useLocation({ select: (location) => location.pathname })
  const releaseWorkspace = pathname.startsWith(`${ROUTES.dashboard.music}/`)
  return (
    <div className="artist-workspace-commands flex items-center">
      <Button
        aria-label={t('shell.search')}
        className="artist-workspace-search h-11 justify-start gap-3 rounded-lg border border-input bg-secondary px-3.5 text-text-secondary"
        onClick={() => openAction('search')}
        variant="ghost"
      >
        <Search aria-hidden="true" className="size-[1.125rem] shrink-0" />
        <span className="artist-workspace-search-label text-[0.8125rem] font-normal">
          {t('shell.search')}
        </span>
        <kbd className="artist-workspace-search-label ml-auto text-[0.6875rem]">
          Ctrl K
        </kbd>
      </Button>
      <DashboardNotificationsPopover artistId={artistId} key={pathname} />
      {releaseWorkspace ? (
        <Button
          asChild
          className="artist-workspace-header-create hidden lg:inline-flex"
          variant="outline"
        >
          <Link
            search={{ tab: 'releases', page: 1 }}
            to={ROUTES.dashboard.music}
          >
            {t('shell.backToMusic')}
          </Link>
        </Button>
      ) : (
        <CreateReleaseButton className="artist-workspace-header-create hidden lg:inline-flex" />
      )}
    </div>
  )
}
