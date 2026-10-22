// Every screen of the web player, composed only from library instances (see ui.mjs).
import { state, withMore } from '../../ui.mjs'
import { landing } from '../../pages-landing.mjs'
import { friends, friendsFind, friendsRequests } from '../../pages-friends.mjs'
import { loading } from '../../pages-loading.mjs'
import { cursor } from '../../pages-cursor.mjs'
import { mobileIsland } from '../../pages-island.mjs'
import { notificationSettings } from '../../pages-notifications.mjs'
import { assistant, withAssistant } from '../../pages-assistant.mjs'
import { authPages } from './auth.mjs'
import { publicPages } from './public.mjs'
import { playerPages } from './player.mjs'
import { searchDiscoveryPages } from './search-discovery.mjs'
import { libraryPages } from './library.mjs'
import { artistProfilePages } from './artist-profile.mjs'
import { podcastPages } from './podcast.mjs'
import { settingsPages } from './settings.mjs'
import { conceptsPages } from './concepts.mjs'

const dock = (fn, mobile) => fn && (() => withAssistant(fn(), mobile))

/**
 * Applies a page's flags: `more` ([kind, count]) adds the "Loading more" state every infinite list
 * draws, `extraStates` follow it, and `assistant` docks the AI assistant button on public pages
 * (outside /main) in the page and every state.
 */
const finish = ({ more, extraStates = [], assistant: docked, ...spec }) => {
  const states = [
    ...(spec.states ?? []),
    ...(more
      ? [
          state(
            'Loading more',
            () => withMore(spec.desktop(), false, ...more),
            () => withMore(spec.mobile(), true, ...more),
          ),
        ]
      : []),
    ...extraStates,
  ]
  if (!docked) return { ...spec, states }
  return {
    ...spec,
    desktop: dock(spec.desktop, false),
    mobile: dock(spec.mobile, true),
    states: states.map((st) => ({
      ...st,
      desktop: dock(st.desktop, false),
      mobile: dock(st.mobile, true),
    })),
  }
}

export const pages = Object.fromEntries(
  Object.entries({
    landing,
    ...authPages,
    ...publicPages,
    ...playerPages,
    ...searchDiscoveryPages,
    ...libraryPages,
    ...artistProfilePages,
    ...podcastPages,
    ...settingsPages,
    ...conceptsPages,
    loading,
    cursor,
    'mobile-island': mobileIsland,
    'notification-settings': notificationSettings,
    assistant,
    friends,
    'friends-find': friendsFind,
    'friends-requests': friendsRequests,
  }).map(([dir, spec]) => [dir, finish(spec)]),
)
