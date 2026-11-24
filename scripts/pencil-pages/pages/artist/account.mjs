// Artist account pages on the artist library: the public profile and the settings panels.
import { profilePage } from './account/profile.mjs'
import { settingsPage } from './account/settings.mjs'

/** The account pages by directory. */
export function accountPages(ui, frames) {
  return {
    profile: profilePage(ui, frames),
    settings: settingsPage(ui, frames),
  }
}
