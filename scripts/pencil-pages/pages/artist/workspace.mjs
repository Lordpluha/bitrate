// Artist workspace pages on the artist library: the dashboard, the music catalogue and distribution.
import { dashboardPage } from './workspace/dashboard.mjs'
import { distributionPage } from './workspace/distribution.mjs'
import { musicPage } from './workspace/music.mjs'

/** The workspace pages by directory. */
export function workspacePages(ui, frames) {
  return {
    dashboard: dashboardPage(ui, frames),
    music: musicPage(ui, frames),
    distribution: distributionPage(ui, frames),
  }
}
