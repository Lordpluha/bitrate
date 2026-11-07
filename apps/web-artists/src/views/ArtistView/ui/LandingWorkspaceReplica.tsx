import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  cn,
} from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  LayoutDashboard,
  Music2,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
} from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { useWorkspacePanelSpotlight } from '../lib/landingInteractions'
import type { StudioPreviewTab } from '../lib/studioPreview'
import { StudioAnalyticsPreview } from './StudioAnalyticsPreview'
import { StudioDashboardPreview } from './StudioDashboardPreview'
import { StudioWorkspacePreview } from './StudioWorkspacePreview'

export type { StudioPreviewTab } from '../lib/studioPreview'

interface LandingWorkspaceReplicaProps {
  activeTab: StudioPreviewTab
  onSelectTab: (tab: StudioPreviewTab) => void
}

interface PillBox {
  top: number
  height: number
}

function useReplicaNavigationPill(activeIndex: number) {
  const navRef = useRef<HTMLElement>(null)
  const [pill, setPill] = useState<PillBox | null>(null)

  useLayoutEffect(() => {
    const item =
      navRef.current?.querySelectorAll<HTMLElement>('[data-nav-item]')[
        activeIndex
      ]
    if (!item) {
      setPill(null)
      return
    }
    const measure = () =>
      setPill({ top: item.offsetTop, height: item.offsetHeight })
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(item)
    return () => observer.disconnect()
  }, [activeIndex])

  return { navRef, pill }
}

/** A bounded, responsive product preview using the workspace's own visual language. */
export function LandingWorkspaceReplica({
  activeTab,
  onSelectTab,
}: LandingWorkspaceReplicaProps) {
  const { t } = useI18n()
  const [compact, setCompact] = useState(false)
  useWorkspacePanelSpotlight()
  const navItems = [
    {
      id: 'dashboard' as const,
      label: t('shell.nav.dashboard'),
      icon: LayoutDashboard,
    },
    { id: 'workspace' as const, label: t('shell.nav.music'), icon: Music2 },
    {
      id: 'analytics' as const,
      label: t('shell.nav.analytics'),
      icon: ChartNoAxesCombined,
    },
  ]
  const activeNavIndex = navItems.findIndex((item) => item.id === activeTab)
  const { navRef, pill } = useReplicaNavigationPill(activeNavIndex)

  return (
    <div
      aria-labelledby={`studio-preview-tab-${activeTab}`}
      className="artist-dashboard studio-preview-replica relative isolate flex bg-background text-left text-foreground"
      data-workspace-page={activeTab === 'workspace' ? 'music' : activeTab}
      id="studio-preview-panel"
      role="tabpanel"
    >
      <aside
        aria-label={t('shell.sidebar')}
        className="studio-preview-sidebar"
        data-compact={compact}
      >
        <div className="artist-workspace-brand-row flex justify-between">
          <div className="artist-workspace-brand flex min-h-11 items-center gap-2">
            <img alt="" height={28} src="/bitrate-logo.svg" width={28} />
            <span className="flex min-w-0 flex-col">
              <span>Bitrate</span>
              <span className="text-sm uppercase text-text-secondary">
                {t('shell.forArtists')}
              </span>
            </span>
          </div>
          <Button
            aria-controls="studio-preview-navigation"
            aria-expanded={!compact}
            aria-label={
              compact ? t('shell.expandSidebar') : t('shell.collapseSidebar')
            }
            className="studio-preview-sidebar-toggle size-7 shrink-0 rounded-full text-text-secondary"
            onClick={() => setCompact(!compact)}
            size="icon"
            variant="ghost"
          >
            {compact ? (
              <PanelLeftOpen aria-hidden="true" className="size-3.5" />
            ) : (
              <PanelLeftClose aria-hidden="true" className="size-3.5" />
            )}
          </Button>
        </div>
        <nav
          aria-label={t('shell.artistWorkspace')}
          className="artist-workspace-nav relative flex flex-col gap-2"
          data-pill={pill !== null}
          id="studio-preview-navigation"
          ref={navRef}
        >
          {pill && (
            <span
              aria-hidden="true"
              className="artist-workspace-nav-pill"
              style={{ height: pill.height, translate: `0 ${pill.top}px` }}
            />
          )}
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                aria-current={activeTab === item.id ? 'page' : undefined}
                aria-label={item.label}
                className={cn(
                  'artist-workspace-nav-item flex cursor-pointer items-center gap-3 rounded-lg border border-transparent text-left text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  activeTab === item.id && 'artist-workspace-nav-selected',
                )}
                data-nav-item=""
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={item.label}
                type="button"
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="studio-preview-profile">
          <Avatar aria-label="Mira Sol" className="size-8 shrink-0" role="img">
            <AvatarImage alt="" src="/artwork/landing/night-signal.webp" />
            <AvatarFallback>
              <UserRound aria-hidden="true" className="size-4" />
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0">
            <span className="block truncate text-sm">Mira Sol</span>
            <span className="block text-sm text-text-secondary">
              {t('shell.artistAccount')}
            </span>
          </span>
        </div>
      </aside>
      <div className="studio-preview-main-shell">
        <header className="studio-preview-header">
          <p className="studio-preview-breadcrumb text-sm text-text-secondary">
            {t('shell.workspace')}
            <span aria-hidden="true" className="mx-2">
              /
            </span>
            <span className="text-foreground">
              {navItems[activeNavIndex].label}
            </span>
          </p>
          <span className="studio-preview-demo-label">
            <span aria-hidden="true" />
            {t('landing.preview.interactive')}
          </span>
          <Link
            className="studio-preview-header-link"
            to={ROUTES.auth.registration}
          >
            {t('landing.signUp')}
            <ArrowUpRight aria-hidden="true" className="size-3" />
          </Link>
        </header>
        <div className="studio-preview-canvas" key={activeTab}>
          {activeTab === 'workspace' ? (
            <StudioWorkspacePreview />
          ) : activeTab === 'dashboard' ? (
            <StudioDashboardPreview onSelectTab={onSelectTab} />
          ) : (
            <StudioAnalyticsPreview />
          )}
        </div>
      </div>
    </div>
  )
}
