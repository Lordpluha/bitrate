import { Button, cn } from '@bitrate/ui-react'
import { CreateReleaseDialog } from '@features/create-release'
import { WorkspaceActionsProvider } from '@features/workspace-actions'
import { AccountLocaleSync } from '@features/workspace-language'
import { ThemeSwitcher } from '@features/workspace-theme'
import type { ArtistIdentity } from '@shared/auth/artistSession.types'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { Link, useLocation } from '@tanstack/react-router'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { type ReactNode, useMemo, useState } from 'react'
import { dashboardNavigation } from '../config/navigation'
import { DashboardAccount } from './DashboardAccount'
import { DashboardAccountMenu } from './DashboardAccountMenu'
import { DashboardCommands } from './DashboardCommands'
import { DashboardDesignNavigation } from './DashboardDesignNavigation'
import { DashboardMobileMenu } from './DashboardMobileMenu'
import { DashboardNotifications } from './DashboardNotifications'
import { DashboardSettingsLink } from './DashboardSettingsLink'
import { DashboardSupport } from './DashboardSupport'

interface ArtistDashboardProps {
  artist: ArtistIdentity
  children: ReactNode
}

export function ArtistDashboard({ artist, children }: ArtistDashboardProps) {
  const [compact, setCompact] = useState(false)
  const pathname = useLocation({ select: (location) => location.pathname })
  const { t } = useI18n()
  const current =
    dashboardNavigation.find((item) => item.to === pathname) ??
    (pathname.startsWith(`${ROUTES.dashboard.music}/`)
      ? dashboardNavigation.find((item) => item.to === ROUTES.dashboard.music)
      : undefined)
  const title = t(current?.label ?? 'shell.workspace')
  const destinations = useMemo(
    () =>
      dashboardNavigation.map((item) => ({ ...item, label: t(item.label) })),
    [t],
  )

  return (
    <WorkspaceActionsProvider
      accountContent={(onNavigate) => (
        <>
          <DashboardAccount artist={artist} />
          <ThemeSwitcher />
          <DashboardSettingsLink onNavigate={onNavigate} />
        </>
      )}
      artistId={artist.id}
      createReleaseDialog={(onClose) => (
        <CreateReleaseDialog artistId={artist.id} onClose={onClose} />
      )}
      destinations={destinations}
      notificationsContent={(onNavigate) => (
        <DashboardNotifications artistId={artist.id} onNavigate={onNavigate} />
      )}
    >
      <AccountLocaleSync artistId={artist.id} />
      <div
        className="artist-dashboard flex min-h-dvh bg-background text-foreground"
        data-workspace-page={current?.page ?? 'workspace'}
      >
        <a
          className="sr-only z-50 rounded-lg bg-primary p-3 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          href="#workspace-content"
        >
          {t('shell.skipToContent')}
        </a>
        <aside
          aria-label={t('shell.sidebar')}
          className={cn(
            'artist-dashboard-sidebar sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-card p-4 lg:flex',
            compact ? 'w-20' : 'w-64',
          )}
          data-compact={compact}
        >
          <div className="artist-workspace-brand-row flex items-start justify-between">
            <Link
              aria-label={t('shell.homeLink')}
              className="artist-workspace-brand mb-8 flex min-h-11 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              preload={false}
              to={ROUTES.dashboard.home}
            >
              <img alt="" height={32} src="/bitrate-logo.svg" width={32} />
              {!compact && (
                <span className="flex flex-col">
                  <span className="text-[1.375rem] font-normal leading-[1.5]">
                    Bitrate
                  </span>
                  <span className="text-[0.625rem] uppercase leading-[1.5] text-text-secondary">
                    {t('shell.forArtists')}
                  </span>
                </span>
              )}
            </Link>
            <Button
              aria-label={
                compact ? t('shell.expandSidebar') : t('shell.collapseSidebar')
              }
              className="size-8 shrink-0 rounded-full border border-input bg-secondary text-text-secondary"
              onClick={() => setCompact(!compact)}
              size="icon"
              variant="ghost"
            >
              {compact ? (
                <PanelLeftOpen aria-hidden="true" className="size-4" />
              ) : (
                <PanelLeftClose aria-hidden="true" className="size-4" />
              )}
            </Button>
          </div>
          <div className="artist-workspace-design-navigation flex w-full flex-col">
            {!compact && (
              <p className="mb-4 px-3 text-[0.625rem] uppercase leading-[1.5] text-text-secondary">
                {t('shell.artistWorkspace')}
              </p>
            )}
            <DashboardDesignNavigation compact={compact} />
          </div>
          <div className="artist-workspace-sidebar-footer mt-auto flex flex-col gap-6 pt-6">
            {!compact && <DashboardSupport />}
            <DashboardAccountMenu artist={artist} compact={compact} />
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="artist-dashboard-header flex min-h-20 items-center justify-between gap-3 px-3 py-4 lg:flex-wrap lg:border-b lg:border-border lg:bg-card lg:px-8 lg:py-3">
            <div className="flex min-w-0 items-center gap-2 lg:hidden">
              <DashboardMobileMenu artist={artist} />
              <Link
                aria-label={t('shell.homeLink')}
                className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                preload={false}
                to={ROUTES.dashboard.home}
              >
                <img
                  alt=""
                  className="shrink-0"
                  height={28}
                  src="/bitrate-logo.svg"
                  width={28}
                />
                <span className="text-lg">Bitrate</span>
              </Link>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm text-text-secondary">
                {t('shell.workspace')}{' '}
                <span aria-hidden="true" className="mx-2">
                  /
                </span>{' '}
                <span className="artist-workspace-breadcrumb-title font-semibold text-foreground">
                  {title}
                </span>
              </p>
            </div>
            <DashboardCommands artistId={artist.id} />
          </header>
          <main
            className="artist-dashboard-main mx-auto w-full max-w-7xl px-6 pb-8 pt-7 md:p-8"
            id="workspace-content"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>
    </WorkspaceActionsProvider>
  )
}
