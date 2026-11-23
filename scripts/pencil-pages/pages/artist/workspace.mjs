// Artist workspace pages on the artist library: the dashboard and the music catalogue (distribution
// follows with the release stages).
import { dashboardPage } from './workspace/dashboard.mjs'
import { musicPage } from './workspace/music.mjs'

/** The workspace pages by directory. */
export function workspacePages(ui, frames) {
  return {
    dashboard: dashboardPage(ui, frames),
    music: musicPage(ui, frames),
  }
}
