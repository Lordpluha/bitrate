import type { IconName } from '@/components/ui/icon'
import type { TranslationKey } from '@/lib/i18n/messages/en'

export type IslandRoute = 'index' | 'search' | 'library'

export const ISLAND_TABS: readonly { route: IslandRoute; icon: IconName; labelKey: TranslationKey }[] = [
  { route: 'index', icon: 'home', labelKey: 'nav.home' },
  { route: 'search', icon: 'search', labelKey: 'nav.search' },
  { route: 'library', icon: 'layers', labelKey: 'nav.library' },
]

/**
 * Which island tab a focused route belongs to: Liked Songs lives under Library, and Profile under
 * Home, where its avatar entry point is (as drawn in pencil/mobile-app-design/profile).
 */
export function activeIslandTab(routeName: string | undefined): IslandRoute | null {
  if (routeName === 'liked-songs') return 'library'
  if (routeName === 'profile') return 'index'
  return ISLAND_TABS.find((tab) => tab.route === routeName)?.route ?? null
}
