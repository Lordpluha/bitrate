import type { TranslationKey } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import {
  BarChart3,
  Disc3,
  LayoutDashboard,
  type LucideIcon,
  Send,
  Settings2,
  UserRound,
} from 'lucide-react'

type DashboardDestination =
  (typeof ROUTES.dashboard)[keyof typeof ROUTES.dashboard]

interface DashboardNavigationItem {
  /** The page's name in every language; styles select on it, so it is never translated. */
  page: string
  label: TranslationKey
  to: DashboardDestination
  icon: LucideIcon
}

export const dashboardNavigation: DashboardNavigationItem[] = [
  {
    page: 'dashboard',
    label: 'shell.nav.dashboard',
    to: ROUTES.dashboard.home,
    icon: LayoutDashboard,
  },
  {
    page: 'music',
    label: 'shell.nav.music',
    to: ROUTES.dashboard.music,
    icon: Disc3,
  },
  {
    page: 'distribution',
    label: 'shell.nav.distribution',
    to: ROUTES.dashboard.distribution,
    icon: Send,
  },
  {
    page: 'analytics',
    label: 'shell.nav.analytics',
    to: ROUTES.dashboard.analytics,
    icon: BarChart3,
  },
  {
    page: 'profile',
    label: 'shell.nav.profile',
    to: ROUTES.dashboard.profile,
    icon: UserRound,
  },
  {
    page: 'settings',
    label: 'shell.nav.settings',
    to: ROUTES.dashboard.settings,
    icon: Settings2,
  },
]
