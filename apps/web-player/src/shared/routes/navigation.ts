import {
  Activity,
  ChartColumn,
  Clock3,
  Heart,
  House,
  type LucideIcon,
  Search,
  Settings,
  TrendingUp,
  UserRound,
  UsersRound,
} from 'lucide-react'
import type { TranslationKey } from '@/shared/i18n'
import { ROUTES } from './routes'

/** One destination in the app's navigation. */
export type NavItem = {
  href: string
  icon: LucideIcon
  labelKey: TranslationKey
  /** The mobile island already links here, so the mobile menu leaves it out. */
  onIsland?: boolean
}

/**
 * Where the app's pages are. The library panel lists these on desktop; below `xl` the island
 * holds Home and Search and the mobile menu lists the rest, so every page is reachable on
 * every screen size from the same list.
 */
export const MAIN_NAV: readonly NavItem[] = [
  { href: ROUTES.main, icon: House, labelKey: 'nav.home', onIsland: true },
  {
    href: ROUTES.search(),
    icon: Search,
    labelKey: 'nav.search',
    onIsland: true,
  },
  { href: ROUTES.charts, icon: TrendingUp, labelKey: 'nav.charts' },
  { href: ROUTES.activity, icon: Activity, labelKey: 'nav.activity' },
  { href: ROUTES.likedSongs, icon: Heart, labelKey: 'library.likedSongs' },
  { href: ROUTES.recents, icon: Clock3, labelKey: 'library.recents' },
]

/** The signed-in account's pages: the profile menu on desktop, the mobile menu below `xl`. */
export const ACCOUNT_NAV: readonly NavItem[] = [
  { href: ROUTES.profile, icon: UserRound, labelKey: 'common.profile' },
  { href: ROUTES.friends, icon: UsersRound, labelKey: 'friends.title' },
  { href: ROUTES.stats, icon: ChartColumn, labelKey: 'stats.title' },
  { href: ROUTES.settings, icon: Settings, labelKey: 'settings.title' },
]

/** The menu below `xl`: the pages the island does not hold, then the account's. */
export const MOBILE_MENU_NAV: readonly NavItem[] = [
  ...MAIN_NAV.filter(({ onIsland }) => !onIsland),
  ...ACCOUNT_NAV,
]
