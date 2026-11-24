import { ROUTES } from '@shared/routes'
import { ActivityPage } from '@views/Activity'
import { ChartsPage } from '@views/Charts'
import { FindFriendsPage, FriendRequestsPage, FriendsPage } from '@views/Friends'
import { LibraryPage } from '@views/Library'
import { LyricsPage } from '@views/Lyrics'
import { NotificationsPage } from '@views/Notifications'
import { ProfilePage } from '@views/Profile'
import { QueuePage } from '@views/Queue'
import { RecentsPage } from '@views/Recents'
import { SearchView } from '@views/Search'
import { SettingsPage } from '@views/Settings'
import { StatsPage } from '@views/Stats'
import { MainPanel } from '@widgets/MainPanel'
import { createRoute, redirect } from '@tanstack/react-router'
import { mainRoute, mainScreen } from './mainRoute'

/** `/main/settings` is an old address of the preferences screen. */
const legacySettingsRoute = createRoute({
  getParentRoute: () => mainRoute,
  path: 'settings',
  beforeLoad: () => {
    throw redirect({ href: ROUTES.settings, replace: true })
  },
})

/** The shell's screens without route params, one per web-player `app/main/**\/page.tsx`. */
export const mainScreens = [
  mainScreen(ROUTES.main, MainPanel),
  mainScreen(ROUTES.activity, ActivityPage),
  mainScreen(ROUTES.charts, ChartsPage),
  mainScreen(ROUTES.friends, FriendsPage),
  mainScreen(ROUTES.findFriends, FindFriendsPage),
  mainScreen(ROUTES.friendRequests, FriendRequestsPage),
  mainScreen(ROUTES.library, LibraryPage),
  mainScreen(ROUTES.lyrics, LyricsPage),
  mainScreen(ROUTES.notifications, NotificationsPage),
  mainScreen(ROUTES.settings, SettingsPage),
  mainScreen(ROUTES.profile, ProfilePage),
  mainScreen(ROUTES.queue, QueuePage),
  mainScreen(ROUTES.recents, RecentsPage),
  mainScreen(ROUTES.search(), SearchView),
  mainScreen(ROUTES.stats, StatsPage),
  legacySettingsRoute,
]
