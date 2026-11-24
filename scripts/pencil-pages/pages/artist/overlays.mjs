// Artist workspace overlays as their own pages, each drawn over the workspace shell: workspace search,
// notifications, the account switcher and the phone menu drawer.
import { accountSwitcherPage } from './overlays/account-switcher.mjs'
import { mobileMenuPage } from './overlays/mobile-menu.mjs'
import { notificationsPage } from './overlays/notifications.mjs'
import { workspaceSearchPage } from './overlays/workspace-search.mjs'

/** The overlay pages by directory. */
export function overlaysPages(ui, frames) {
  return {
    'workspace-search': workspaceSearchPage(ui, frames),
    notifications: notificationsPage(ui, frames),
    'account-switcher': accountSwitcherPage(ui, frames),
    'mobile-menu': mobileMenuPage(ui, frames),
  }
}
