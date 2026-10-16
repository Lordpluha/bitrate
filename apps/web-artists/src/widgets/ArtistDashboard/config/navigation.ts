import { ROUTES } from '@shared/routes/routes'
import {
  BarChart3,
  CalendarCheck,
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
  label: string
  to: DashboardDestination
  icon: LucideIcon
}

export const dashboardNavigation: DashboardNavigationItem[] = [
  { label: 'Dashboard', to: ROUTES.dashboard.home, icon: LayoutDashboard },
  { label: 'Music', to: ROUTES.dashboard.music, icon: Disc3 },
  { label: 'Tasks', to: ROUTES.dashboard.tasks, icon: CalendarCheck },
  { label: 'Distribution', to: ROUTES.dashboard.distribution, icon: Send },
  { label: 'Analytics', to: ROUTES.dashboard.analytics, icon: BarChart3 },
  { label: 'Profile', to: ROUTES.dashboard.profile, icon: UserRound },
  { label: 'Settings', to: ROUTES.dashboard.settings, icon: Settings2 },
]
